import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const user = payload.record

    if (!user?.id || !user?.email) {
      return new Response('missing user data', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const email = user.email
    const phone = user.phone ?? null

    // 1. Chercher guest existant par email
    let { data: guest } = await supabase
      .from('guests')
      .select('id, supabase_user_id')
      .eq('email', email)
      .single()

    // 2. Si pas trouve par email, chercher par phone
    if (!guest && phone) {
      const { data: guestByPhone } = await supabase
        .from('guests')
        .select('id, supabase_user_id')
        .eq('phone_e164', phone)
        .single()
      guest = guestByPhone
    }

    // 3. Si guest trouve, lier le supabase_user_id
    if (guest) {
      if (!guest.supabase_user_id) {
        await supabase
          .from('guests')
          .update({
            supabase_user_id: user.id,
            email: email,
          })
          .eq('id', guest.id)
      }
      return new Response(JSON.stringify({ linked: true, guest_id: guest.id }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 4. Si guest pas trouve, en creer un nouveau
    const { data: newGuest } = await supabase
      .from('guests')
      .insert({
        supabase_user_id: user.id,
        email: email,
        phone_e164: phone,
        first_name: email.split('@')[0],
        full_name: email.split('@')[0],
        preferred_language: 'fr',
        locale: 'fr',
      })
      .select()
      .single()

    // 5. Creer un profil de fidelite vide
    if (newGuest) {
      await supabase
        .from('guest_loyalty_profiles')
        .insert({
          guest_id: newGuest.id,
          status: 'new',
          total_stays: 0,
          total_nights: 0,
        })
    }

    return new Response(JSON.stringify({ linked: false, guest_id: newGuest?.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
