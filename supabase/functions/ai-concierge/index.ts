import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { conversation_id, reservation_id, guest_id, message_text } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: reservation } = await supabase
      .from('reservations')
      .select('*, channel_account:channel_accounts(property_id)')
      .eq('id', reservation_id)
      .single()

    const propertyId = reservation?.property_id || reservation?.channel_account?.property_id

    const { data: knowledge } = await supabase
      .from('property_knowledge')
      .select('category, title, content, priority')
      .eq('property_id', propertyId)
      .eq('status', 'active')
      .order('priority', { ascending: true })

    const { data: rules } = await supabase
      .from('property_rules')
      .select('*')
      .eq('property_id', propertyId)
      .single()

    const { data: memory } = await supabase
      .from('guest_memory')
      .select('memory_key, memory_value, confidence')
      .eq('guest_id', guest_id)
      .order('last_updated_at', { ascending: false })
      .limit(10)

    const { data: history } = await supabase
      .from('messages')
      .select('role, content_text, created_at')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(10)

    const historyFormatted = (history || []).reverse().map((m) =>
      `${m.role === 'guest' ? 'Guest' : 'Assistant'}: ${m.content_text}`
    ).join('\n')

    const knowledgeFormatted = (knowledge || []).map((k) =>
      `[${k.category}] ${k.title}: ${k.content}`
    ).join('\n')

    const systemPrompt = `You are a premium concierge assistant for high-end property guests.
Your role is to provide smooth, professional, and reassuring assistance throughout the guest stay.
Behave like a high-end human concierge, not a chatbot.

CORE BEHAVIOR:
- Always respond directly to the guest request
- Be helpful, calm, and confident
- Keep responses short, fluid, and natural
- Never create lists or bullet points
- Anticipate needs instead of interrogating the guest

LANGUAGE RULE:
- Always respond in the language of the guest last message
- If unclear, default to French

PROPERTY KNOWLEDGE:
${knowledgeFormatted || 'No specific knowledge available.'}

PROPERTY RULES:
Check-in: ${rules?.checkin_time || 'N/A'}
Check-out: ${rules?.checkout_time || 'N/A'}
Pets: ${rules?.pets_allowed ? 'Allowed' : 'Not allowed'}
Smoking: ${rules?.smoking_allowed ? 'Allowed' : 'Not allowed'}

RESERVATION:
Check-in: ${reservation?.check_in_at || 'N/A'}
Check-out: ${reservation?.check_out_at || 'N/A'}
Status: ${reservation?.status || 'N/A'}

GUEST MEMORY:
${(memory || []).map((m) => `${m.memory_key}: ${m.memory_value}`).join('\n') || 'No memory yet.'}

RESPONSE FORMAT (mandatory JSON):
{
  "reply": "message to guest",
  "language": "fr or en",
  "intent": "short label",
  "confidence": 0.0-1.0,
  "needs_ticket": false,
  "conversation_action": "continue"
}`

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `CONVERSATION HISTORY:\n${historyFormatted}\n\nGUEST MESSAGE:\n${message_text}`
          }
        ]
      })
    })

    const anthropicData = await anthropicResponse.json()
    const rawContent = anthropicData.content?.[0]?.text || '{}'

    let parsed
    try {
      const clean = rawContent.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      parsed = {
        reply: rawContent,
        language: 'fr',
        intent: 'general',
        confidence: 0.8,
        needs_ticket: false,
        conversation_action: 'continue'
      }
    }

    await supabase.from('messages').insert({
      conversation_id,
      direction: 'outbound',
      role: 'ai',
      message_type: 'text',
      content_text: parsed.reply,
      received_at: new Date().toISOString()
    })

    if (parsed.needs_ticket) {
      await supabase.from('tickets').insert({
        conversation_id,
        reservation_id,
        guest_id,
        category: 'guest_request',
        source: 'in_app',
        status: 'open',
        description: message_text
      })
    }

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_ai_run_at: new Date().toISOString()
      })
      .eq('id', conversation_id)

    return new Response(
      JSON.stringify({
        reply: parsed.reply,
        intent: parsed.intent,
        confidence: parsed.confidence
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
