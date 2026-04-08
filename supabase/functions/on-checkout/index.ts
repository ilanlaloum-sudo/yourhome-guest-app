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

    const { data: reservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservation_id)
      .single()

    if (!reservation) throw new Error('Reservation not found')

    const checkIn = new Date(reservation.check_in_at)
    const checkOut = new Date(reservation.check_out_at)
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    await supabase
      .from('reservations')
      .update({ status: 'completed', actual_check_out_at: new Date().toISOString() })
      .eq('id', reservation_id)

    await supabase
      .from('booking_access_tokens')
      .update({ is_revoked: true, revoked_at: new Date().toISOString() })
      .eq('reservation_id', reservation_id)

    const { data: loyalty } = await supabase
      .from('guest_loyalty_profiles')
      .select('*')
      .eq('guest_id', reservation.guest_id)
      .single()

    if (loyalty) {
      const newTotalStays = (loyalty.total_stays || 0) + 1
      const newTotalNights = (loyalty.total_nights || 0) + nights

      let newStatus = 'new'
      if (newTotalStays >= 5 || newTotalNights >= 20) {
        newStatus = 'preferred'
      } else if (newTotalStays >= 2) {
        newStatus = 'returning'
      }

      await supabase
        .from('guest_loyalty_profiles')
        .update({
          total_stays: newTotalStays,
          total_nights: newTotalNights,
          last_stay_date: checkOut.toISOString().split('T')[0],
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('guest_id', reservation.guest_id)

      if (newStatus !== loyalty.status) {
        if (newStatus === 'returning') {
          await supabase.from('guest_rewards').insert({
            guest_id: reservation.guest_id,
            reservation_id: reservation_id,
            reward_type: 'welcome_gift',
            description_fr: 'Bienvenue dans le club des clients fideles Your Home',
            status: 'active',
            valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          })
        }
        if (newStatus === 'preferred') {
          await supabase.from('guest_rewards').insert([
            {
              guest_id: reservation.guest_id,
              reservation_id: reservation_id,
              reward_type: 'late_checkout',
              description_fr: 'Late check-out offert sur votre prochain sejour',
              status: 'active',
              valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
            {
              guest_id: reservation.guest_id,
              reservation_id: reservation_id,
              reward_type: 'welcome_gift',
              description_fr: 'Attention de bienvenue a votre prochain sejour',
              status: 'active',
              valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }
          ])
        }
      }
    }

    const { data: guest } = await supabase
      .from('guests')
      .select('*')
      .eq('id', reservation.guest_id)
      .single()

    if (guest?.phone_e164) {
      const appUrl = Deno.env.get('GUEST_APP_URL') || ''
      const message = guest.preferred_language === 'fr'
        ? `Bonjour ${guest.first_name || ''}, merci pour votre sejour chez Your Home ! Votre avis nous est tres precieux : ${appUrl}`
        : `Hello ${guest.first_name || ''}, thank you for staying with Your Home! Your feedback means a lot to us: ${appUrl}`

      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
      const from = Deno.env.get('TWILIO_WHATSAPP_FROM')

      const body = new URLSearchParams({
        From: `whatsapp:${from}`,
        To: `whatsapp:${guest.phone_e164}`,
        Body: message,
      })

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })
    }

    return new Response(
      JSON.stringify({ success: true, nights, guest_id: reservation.guest_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
