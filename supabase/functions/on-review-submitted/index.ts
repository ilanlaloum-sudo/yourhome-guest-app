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
    const payload = await req.json()
    const review = payload.record
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const { data: guest } = await supabase.from('guests').select('*').eq('id', review.guest_id).single()
    const autoPublish = review.overall_score >= 4
    const needsAttention = review.overall_score <= 2
    await supabase.from('reviews').update({ status: autoPublish ? 'published' : 'moderated', moderated_at: new Date().toISOString() }).eq('id', review.id)
    if (needsAttention) {
      await supabase.from('notifications').insert({ type: 'low_review', title: 'Avis negatif recu', body: 'Score ' + review.overall_score + '/5', guest_id: review.guest_id, reservation_id: review.reservation_id, read: false, created_at: new Date().toISOString() })
    }
    if (autoPublish && guest?.phone_e164) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
      const from = Deno.env.get('TWILIO_WHATSAPP_FROM')
      const message = guest.preferred_language === 'fr' ? 'Merci pour votre avis ' + (guest.first_name || '') + ' ! A tres bientot chez Your Home.' : 'Thank you for your review ' + (guest.first_name || '') + '! See you soon at Your Home.'
      const body = new URLSearchParams({ From: 'whatsapp:' + from, To: 'whatsapp:' + guest.phone_e164, Body: message })
      await fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', { method: 'POST', headers: { 'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken), 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
    }
    return new Response(JSON.stringify({ success: true, published: autoPublish }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})