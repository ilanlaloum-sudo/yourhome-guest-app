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
    const { reservation_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Recuperer la reservation complete
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('*, channel_account:channel_accounts(*)')
      .eq('id', reservation_id)
      .single()

    if (resError || !reservation) throw new Error('Reservation not found')

    // 2. Recuperer le guest
    const { data: guest } = await supabase
      .from('guests')
      .select('*')
      .eq('id', reservation.guest_id)
      .single()

    if (!guest) throw new Error('Guest not found')

    // 3. Creer le profil de fidelite si inexistant
    await supabase
      .from('guest_loyalty_profiles')
      .upsert({
        guest_id: guest.id,
        status: 'new',
        total_stays: 0,
        total_nights: 0,
      }, { onConflict: 'guest_id', ignoreDuplicates: true })

    // 4. Generer un magic link Supabase Auth
    let magicLinkUrl = null
    if (guest.email) {
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: guest.email,
        options: {
          redirectTo: Deno.env.get('GUEST_APP_URL') + '?reservation=' + reservation_id,
        }
      })
      magicLinkUrl = linkData?.properties?.action_link ?? null
    }

    // 5. Generer un token court pour WhatsApp
    const shortToken = Math.random().toString(36).substring(2, 10).toUpperCase()
    const tokenHash = await hashToken(shortToken)
    const validFrom = new Date(reservation.check_in_at)
    validFrom.setDate(validFrom.getDate() - 7)
    const validUntil = new Date(reservation.check_out_at)
    validUntil.setDate(validUntil.getDate() + 3)

    await supabase
      .from('booking_access_tokens')
      .insert({
        reservation_id: reservation.id,
        guest_id: guest.id,
        token: shortToken,
        token_hash: tokenHash,
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
      })

    const appLink = magicLinkUrl ||
      (Deno.env.get('GUEST_APP_URL') + '?token=' + shortToken)

    // 6. Envoyer le message WhatsApp via Twilio
    const phone = guest.phone_e164
    if (phone) {
      const checkIn = new Date(reservation.check_in_at)
        .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      const message = guest.preferred_language === 'fr'
        ? `Bonjour ${guest.first_name || ''} ! Votre sejour Your Home est confirme pour le ${checkIn}. Accedez a toutes les informations de votre sejour ici : ${appLink}`
        : `Hello ${guest.first_name || ''}! Your Your Home stay is confirmed for ${checkIn}. Access all your stay information here: ${appLink}`

      await sendWhatsApp(phone, message)
    }

    // 7. Envoyer l email si disponible
    if (guest.email && magicLinkUrl) {
      await sendEmail(guest.email, guest.first_name, magicLinkUrl, reservation)
    }

    return new Response(
      JSON.stringify({ success: true, token: shortToken, magic_link: magicLinkUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function hashToken(token) {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sendWhatsApp(to, message) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_WHATSAPP_FROM')

  const body = new URLSearchParams({
    From: 'whatsapp:' + from,
    To: 'whatsapp:' + to,
    Body: message,
  })

  await fetch(
    'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  )
}

async function sendEmail(email, firstName, link, reservation) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return

  const checkIn = new Date(reservation.check_in_at)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Your Home <concierge@yourhome.ae>',
      to: email,
      subject: `Votre sejour Your Home - ${checkIn}`,
      html: `<h2>Bonjour ${firstName || ''},</h2><p>Votre sejour est confirme. Retrouvez toutes les informations de votre sejour en cliquant sur le lien ci-dessous.</p><a href="${link}" style="background:#C4A46B;color:white;padding:14px 28px;border-radius:14px;text-decoration:none;font-family:sans-serif;font-size:13px;font-weight:600;">Acceder a mon sejour</a>`,
    }),
  })
}
