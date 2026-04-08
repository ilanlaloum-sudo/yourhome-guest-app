import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export const useConversation = (reservationId, guestId) => {
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!reservationId || !guestId) {
      setLoading(false)
      return
    }

    let cancelled = false

    const init = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('conversations')
          .select('*')
          .eq('reservation_id', reservationId)
          .eq('channel_type', 'in_app')
          .maybeSingle()

        if (fetchErr) throw fetchErr

        if (data) {
          if (!cancelled) setConversation(data)
        } else {
          const { data: newConv, error: insertErr } = await supabase
            .from('conversations')
            .insert({
              channel_account_id: '0d0b663b-b04e-42cc-be96-1fe276ef277f',
              guest_id: guestId,
              reservation_id: reservationId,
              property_id: '05b9c4c2-bb96-431d-a099-394b239ee4bc',
              status: 'open',
              channel_type: 'in_app',
              current_handoff_state: 'ai',
            })
            .select()
            .single()

          if (insertErr) throw insertErr
          if (!cancelled) setConversation(newConv)
        }
      } catch (err) {
        console.error('useConversation error:', err)
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [reservationId, guestId])

  return { conversation, loading, error }
}

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) {
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (error) throw error
        if (!cancelled) setMessages(data || [])
      } catch (err) {
        console.error('useMessages error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMessages()

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(subscription)
    }
  }, [conversationId])

  return { messages, loading }
}

export const useSendMessage = () => {
  const [sending, setSending] = useState(false)

  const sendMessage = useCallback(async ({ conversationId, reservationId, guestId, text, accessToken }) => {
    if (!text.trim() || !conversationId) return
    setSending(true)

    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        direction: 'outgoing',
        topic: 'default',
        role: 'user',
        extension: 'text',
        message_type: 'text',
        content_text: text,
        created_at: new Date().toISOString(),
      })

      const { data, error: fnError } = await supabase.functions.invoke('ai-concierge', {
        body: {
          conversation_id: conversationId,
          reservation_id: reservationId,
          guest_id: guestId,
          message_text: text,
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      if (fnError) throw fnError

      if (data?.reply) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          direction: 'incoming',
          topic: 'default',
          role: 'assistant',
          extension: 'text',
          message_type: 'text',
          content_text: data.reply,
          created_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('sendMessage error:', err)
      throw err
    } finally {
      setSending(false)
    }
  }, [])

  return { sendMessage, sending }
}
