import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useLoyaltyProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_loyalty_profiles')
          .select('*')
          .single()

        if (error && error.code !== 'PGRST116') throw error
        setProfile(data || null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { profile, loading }
}

export const useRewards = () => {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_rewards')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) throw error
        setRewards(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { rewards, loading }
}
