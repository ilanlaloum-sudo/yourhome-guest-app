import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TENANT_CONCIERGE_URL = import.meta.env.VITE_TENANT_CONCIERGE_URL
  ?? 'https://qscbpmqqcbjuobhwlcmw.supabase.co/functions/v1/tenant-concierge-run'

/**
 * Read-only resolver for the current guest's in_app conversation. Returns
 * one of these `state` values so the caller can render the right UI:
 *   - 'loading'          — initial fetch in flight
 *   - 'ready'            — `conversation` is populated
 *   - 'no_guest'         — auth user has no row in `guests` (mapping missing)
 *   - 'no_conversation'  — guest has no open in_app conv yet; the edge
 *                          function will create one on the first message
 *   - 'error'            — RLS / network failure (`error` is populated)
 */
export const useConversation = () => {
  const [conversation, setConversation] = useState(null)
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          if (!cancelled) { setState('error'); setError('Not authenticated') }
          return
        }

        // Resolve the guest row for this auth user. RLS on `guests` must allow
        // the row owner to read their own record (filtered on supabase_user_id).
        const { data: guest, error: guestErr } = await supabase
          .from('guests')
          .select('id')
          .eq('supabase_user_id', session.user.id)
          .maybeSingle()

        if (guestErr) throw guestErr
        if (!guest) {
          if (!cancelled) setState('no_guest')
          return
        }

        // Find the open in_app conversation. If none exists, the edge
        // function will create it server-side on the first send.
        const { data: conv, error: convErr } = await supabase
          .from('conversations')
          .select('*')
          .eq('guest_id', guest.id)
          .eq('channel_type', 'in_app')
          .eq('status', 'open')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (convErr) throw convErr
        if (!conv) {
          if (!cancelled) setState('no_conversation')
          return
        }

        if (!cancelled) {
          setConversation(conv)
          setState('ready')
        }
      } catch (err) {
        console.error('useConversation error:', err.message || err)
        if (!cancelled) {
          setError(err.message || String(err))
          setState('error')
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  return { conversation, state, error }
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
            const incoming = payload.new
            // Skip if already in state by DB id
            if (prev.some((m) => m.id === incoming.id)) return prev
            // Replace the matching optimistic placeholder with the real DB row.
            // Optimistic ids are 'opt-*'; the canonical match is direction +
            // content_text since the optimistic id never reaches the server.
            const optIdx = prev.findIndex(
              (m) =>
                String(m.id).startsWith('opt-') &&
                m.direction === incoming.direction &&
                m.content_text === incoming.content_text
            )
            if (optIdx !== -1) {
              const updated = [...prev]
              updated[optIdx] = incoming
              return updated
            }
            return [...prev, incoming]
          })
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(subscription)
    }
  }, [conversationId])

  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  return { messages, loading, addMessage }
}

/**
 * Sends a guest message to tenant-concierge-run v2. The edge function owns
 * conversation creation, message persistence, ticket creation, and routing
 * decisions — the frontend just relays the text and renders the reply.
 *
 * Returns the full edge-function payload:
 *   { reply, conversation_id, message_id, intent, confidence,
 *     needs_ticket, ticket_id, needs_handoff, latency_ms, cost_usd }
 */
export const useSendMessage = () => {
  const [sending, setSending] = useState(false)

  const sendMessage = useCallback(async ({ conversationId, text, accessToken }) => {
    if (!text.trim()) return null
    if (!accessToken) throw new Error('Not authenticated')
    setSending(true)

    try {
      const res = await fetch(TENANT_CONCIERGE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId ?? null,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const e = new Error(body.error ?? `HTTP ${res.status}`)
        e.status = res.status
        throw e
      }

      return await res.json()
    } catch (err) {
      console.error('sendMessage error:', err)
      throw err
    } finally {
      setSending(false)
    }
  }, [])

  return { sendMessage, sending }
}
