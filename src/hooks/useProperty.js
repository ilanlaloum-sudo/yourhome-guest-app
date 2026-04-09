import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const usePropertyKnowledge = (propertyId) => {
  const [knowledge, setKnowledge] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('property_knowledge')
          .select('*')
          .eq('property_id', propertyId)
          .eq('status', 'active')
          .order('priority', { ascending: true })

        if (error) throw error
        setKnowledge(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [propertyId])

  return { knowledge, loading }
}

export const usePropertyRules = (propertyId) => {
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('property_rules')
          .select('*')
          .eq('property_id', propertyId)
          .single()

        if (error) throw error
        setRules(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [propertyId])

  return { rules, loading }
}

export const usePropertyPhotos = (propertyId) => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('property_photos')
          .select('*')
          .eq('property_id', propertyId)
          .eq('visible_guest_app', true)
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (error) throw error
        const COVER_URL = 'https://qscbpmqqcbjuobhwlcmw.supabase.co/storage/v1/object/public/property-images/the-opus.jpg'
        const results = data && data.length > 0 ? data : [{ url: COVER_URL, id: 'cover-fallback' }]
        setPhotos(results)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [propertyId])

  return { photos, loading }
}

export const usePropertyAmenities = (propertyId) => {
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('property_amenities')
          .select('*')
          .eq('property_id', propertyId)
          .eq('guest_visible', true)
          .order('display_order', { ascending: true })

        if (error) throw error
        setAmenities(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [propertyId])

  return { amenities, loading }
}
