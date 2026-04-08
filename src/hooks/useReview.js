import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useReview = (reservationId) => {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reservationId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('reservation_id', reservationId)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        setReview(data || null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [reservationId])

  return { review, loading }
}

export const useSubmitReview = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitReview = async ({ reservationId, guestId, propertyId, overallScore, comment }) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          reservation_id: reservationId,
          guest_id: guestId,
          property_id: propertyId,
          overall_score: overallScore,
          comment: comment,
          status: 'submitted',
          submitted_at: new Date().toISOString()
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

  return { submitReview, loading, error }
}
