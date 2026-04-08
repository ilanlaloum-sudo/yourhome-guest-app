import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useServices = (propertyId) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('property_service_availability')
          .select(`
            *,
            service:service_catalog(*)
          `)
          .eq('property_id', propertyId)
          .eq('is_available', true)

        if (error) throw error
        setServices(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [propertyId])

  return { services, loading }
}

export const useCreateServiceRequest = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createRequest = async ({ reservationId, guestId, serviceId, specialInstructions, priceEur }) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          reservation_id: reservationId,
          guest_id: guestId,
          service_id: serviceId,
          special_instructions: specialInstructions,
          price_eur: priceEur,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createRequest, loading, error }
}

export const useMyServiceRequests = (reservationId) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reservationId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('service_requests')
          .select(`
            *,
            service:service_catalog(name_fr, icon_key, category)
          `)
          .eq('reservation_id', reservationId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setRequests(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [reservationId])

  return { requests, loading }
}
