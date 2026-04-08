import { useState, useEffect, useRef } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { useConversation, useMessages, useSendMessage } from '../../hooks/useConversation'
import { supabase } from '../../lib/supabase'

const CHIPS = [
  { i: 'key',          l: 'Arrivee' },
  { i: 'wifi',         l: 'WiFi' },
  { i: 'parking',      l: 'Parking' },
  { i: 'concierge',    l: 'Service' },
  { i: 'logOut',       l: 'Check-out' },
  { i: 'alert',        l: 'Probleme' },
  { i: 'utensils',     l: 'Restaurant' },
  { i: 'mapPin',       l: 'Quartier' },
]

export default function AssistantScreen({ reservation, session }) {
  const [input, setInput] = useState('')
  const [convError, setConvError] = useState(false)
  const ref = useRef(null)
  const reservationId = reservation?.id
  const guestId = session?.user?.id

  const { conversation, loading: convLoading } = useConversation(reservationId)
  const { messages, loading: messagesLoading } = useMessages(conversation?.id)
  const { sendMessage, loading: sending } = useSendMessage()
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (convLoading) {
      const timeout = setTimeout(() => {
        if (!conversation) setConvError(true)
      }, 5000)
      return () => clearTimeout(timeout)
    }
    if (conversation) setConvError(false)
  }, [convLoading, conversation, retryKey])

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    if (!text.trim() || !conversation?.id) return
    setInput('')
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      await sendMessage({
        conversationId: conversation.id,
        reservationId,
        guestId,
        text,
        accessToken: currentSession?.access_token,
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="page" style={{ paddingBottom: 160 }}>
      <Header right={
        <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}/>
          En ligne
        </div>
      }/>

      <div style={{ padding: '8px var(--px) 14px' }}>
        <div style={{ background: 'var(--card)', borderRadius: 'var(--r)', padding: '15px 17px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 15, background: 'linear-gradient(135deg,#C4A46B,#8A6A38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkles" size={20} color="#fff" strokeWidth={1.5}/>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Assistant Your Home</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300 }}>
              Concierge premium disponible 24h/24
            </div>
          </div>
        </div>
      </div>

      <div className="chips">
        {CHIPS.map(s => (
          <div key={s.l} className="chip" onClick={() => handleSend(s.l)}>
            <Icon name={s.i} size={13}/>
            <span>{s.l}</span>
          </div>
        ))}
      </div>

      {convError && (
        <div style={{ padding: '20px var(--px)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Impossible de charger la conversation.</div>
          <button
            onClick={() => { setConvError(false); setRetryKey(k => k + 1); window.location.reload() }}
            style={{ background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Reessayer
          </button>
        </div>
      )}

      <div className="cwrap">
        {messagesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="dot" style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}/>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ alignSelf: 'flex-start' }}>
            <div className="bsndr">Assistant</div>
            <div className="bbl ai">
              Bonjour ! Je suis votre assistant Your Home. Comment puis-je vous aider ?
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'guest' ? 'flex-end' : 'flex-start' }}>
              {m.role !== 'guest' && <div className="bsndr">Assistant</div>}
              <div className={`bbl ${m.role === 'guest' ? 'usr' : 'ai'}`}>
                {m.content_text}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="bsndr">Assistant</div>
            <div className="bbl ai" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="dot" style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={ref}/>
      </div>

      <div className="cbar">
        <input
          className="cinp"
          placeholder="Posez votre question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend(input)}
        />
        <button className="csnd" onClick={() => handleSend(input)} disabled={sending}>
          <Icon name="send" size={15} color="#fff"/>
        </button>
      </div>
    </div>
  )
}
