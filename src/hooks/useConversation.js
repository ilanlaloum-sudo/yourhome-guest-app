import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useConversation = (reservationId) => {
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reservationId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('reservation_id', reservationId)
          .eq('channel_type', 'in_app')
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (!data) {
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
              reservation_id: reservationId,
              channel_type: 'in_app',
              status: 'active'
            })
            .select()
            .single()

          if (createError) throw createError
          setConversation(newConv)
        } else {
          setConversation(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [reservationId])

  return { conversation, loading }
}

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [conversationId])

  return { messages, loading }
}

export const useSendMessage = () => {
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async ({ conversationId, reservationId, guestId, text }) => {
    if (!text.trim()) return
    setLoading(true)

    try {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          direction: 'inbound',
          role: 'guest',
          message_type: 'text',
          content_text: text,
          received_at: new Date().toISOString()
        })

      if (msgError) throw msgError

      const { data: guestData } = await supabase
        .from('guests')
        .select('id')
        .eq('supabase_user_id', guestId)
        .single()

      const actualGuestId = guestData?.id || guestId

      const { error: fnError } = await supabase.functions.invoke('ai-concierge', {
        body: {
          conversation_id: conversationId,
          reservation_id: reservationId,
          guest_id: actualGuestId,
          message_text: text
        }
      })

      if (fnError) throw fnError

    } catch (err) {
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { sendMessage, loading }
}
