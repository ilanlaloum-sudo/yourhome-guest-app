import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useActiveReservation = () => {
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_reservation_view')
          .select('*')
          .in('status', ['confirmed', 'in_stay'])
          .order('check_in_at', { ascending: true })
          .limit(1)
          .single()

        if (error) throw error

        if (data?.property_id) {
          const { data: photos } = await supabase
            .from('property_photos')
            .select('url')
            .eq('property_id', data.property_id)
            .eq('is_cover', true)
            .single()

          const coverUrl = photos?.url || 'https://qscbpmqqcbjuobhwlcmw.supabase.co/storage/v1/object/public/property-images/the-opus.jpg'
          setReservation({ ...data, cover_photo_url: coverUrl })
        } else {
          setReservation(data)
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { reservation, loading, error }
}

export const useReservation = (id) => {
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_reservation_view')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setReservation(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id])

  return { reservation, loading, error }
}

export const usePastReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_reservation_view')
          .select('*')
          .eq('status', 'completed')
          .order('check_out_at', { ascending: false })

        if (error) throw error
        setReservations(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { reservations, loading }
}
