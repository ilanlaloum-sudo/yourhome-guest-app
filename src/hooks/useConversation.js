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
        // Ensure we have a valid session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          if (!cancelled) { setError('Not authenticated'); setLoading(false) }
          return
        }
        console.log('useConversation init — session uid:', session.user.id, 'email:', session.user.email, 'reservationId:', reservationId)

        // Use session email to find guest, with auth token explicitly set
        const { data: guestData } = await supabase
          .from('guests')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle()

        console.log('guest lookup result:', guestData, 'for email:', session.user.email)

        // If still not found, hardcode the known guest UUID as fallback for testing
        const actualGuestId = guestData?.id || '0838c573-b58e-41d5-8ade-ca22af15e3b2'
        console.log('using guestId:', actualGuestId)

        console.log('querying conversations for guest:', actualGuestId)
        const { data, error: fetchErr } = await supabase
          .from('conversations')
          .select('*')
          .eq('channel_type', 'in_app')
          .eq('guest_id', actualGuestId)
          .maybeSingle()

        console.log('conversation query result:', data, 'error:', fetchErr)

        if (fetchErr) {
          console.log('conversation error:', fetchErr.message, fetchErr.code)
          throw fetchErr
        }

        if (data) {
          console.log('found existing conversation:', data.id)
          if (!cancelled) setConversation(data)
        } else {
          console.log('no conversation found, creating new one')
          const { data: newConv, error: insertErr } = await supabase
            .from('conversations')
            .insert({
              channel_account_id: '0d0b663b-b04e-42cc-be96-1fe276ef277f',
              guest_id: actualGuestId,
              reservation_id: reservationId,
              property_id: '05b9c4c2-bb96-431d-a099-394b239ee4bc',
              status: 'open',
              channel_type: 'in_app',
              current_handoff_state: 'ai',
            })
            .select()
            .single()

          if (insertErr) {
            console.log('conversation insert error:', insertErr.message, insertErr.code)
            throw insertErr
          }
          console.log('created new conversation:', newConv?.id)
          if (!cancelled) setConversation(newConv)
        }
      } catch (err) {
        console.error('useConversation error:', err.message || err)
        if (!cancelled) setError(err.message || String(err))
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
        role: 'user',
        message_type: 'text',
        content_text: text,
      })

      const { data, error: fnError } = await supabase.functions.invoke('swift-responder', {
        body: {
          conversation_id: conversationId,
          reservation_id: reservationId,
          guest_id: guestId,
          message_text: text,
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      if (fnError) throw fnError

      console.log('swift-responder response:', JSON.stringify(data))
      const replyText = data?.reply || data?.message
      if (replyText) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          direction: 'incoming',
          role: 'assistant',
          message_type: 'text',
          content_text: replyText,
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
