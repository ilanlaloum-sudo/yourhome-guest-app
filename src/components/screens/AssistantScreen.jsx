import { useState, useEffect, useRef } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { useConversation, useMessages, useSendMessage } from '../../hooks/useConversation'
import { supabase } from '../../lib/supabase'

const CHIPS = {
  fr: [
    { i: 'key',          l: 'Arrivée' },
    { i: 'wifi',         l: 'WiFi' },
    { i: 'parking',      l: 'Parking' },
    { i: 'concierge',    l: 'Service' },
    { i: 'logOut',       l: 'Check-out' },
    { i: 'alert',        l: 'Problème' },
    { i: 'utensils',     l: 'Restaurant' },
    { i: 'mapPin',       l: 'Quartier' },
  ],
  en: [
    { i: 'key',          l: 'Arrival' },
    { i: 'wifi',         l: 'WiFi' },
    { i: 'parking',      l: 'Parking' },
    { i: 'concierge',    l: 'Service' },
    { i: 'logOut',       l: 'Check-out' },
    { i: 'alert',        l: 'Issue' },
    { i: 'utensils',     l: 'Restaurant' },
    { i: 'mapPin',       l: 'Neighbourhood' },
  ],
}

const T = {
  title:      { fr: 'Assistant Your Home',  en: 'Your Home Assistant' },
  subtitle:   { fr: 'Concierge premium disponible 24h/24', en: 'Premium concierge available 24/7' },
  online:     { fr: 'En ligne',   en: 'Online' },
  loadErr:    { fr: 'Impossible de charger la conversation.', en: 'Unable to load conversation.' },
  retry:      { fr: 'Réessayer',  en: 'Retry' },
  greeting:   { fr: 'Bonjour ! Je suis votre assistant Your Home. Comment puis-je vous aider ?', en: 'Hello! I\'m your Your Home assistant. How can I help you?' },
  placeholder:{ fr: 'Posez votre question...', en: 'Ask your question...' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

export default function AssistantScreen({ reservation, session, lang = 'fr', onToggleLang, onSignOut }) {
  const [input, setInput] = useState('')
  const [convError, setConvError] = useState(null)
  const ref = useRef(null)
  const reservationId = reservation?.id
  const guestId = session?.user?.id

  const { conversation, loading: convLoading, error: convErr } = useConversation(reservationId, guestId)
  const { messages, loading: messagesLoading } = useMessages(conversation?.id)
  const { sendMessage, sending } = useSendMessage()

  useEffect(() => {
    if (convErr) setConvError(typeof convErr === 'string' ? convErr : convErr.message || String(convErr))
    else if (conversation) setConvError(null)
  }, [convErr, conversation])

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
      <Header
        lang={lang}
        onToggleLang={onToggleLang}
        session={session}
        onSignOut={onSignOut}
        right={
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}/>
            {t('online', lang)}
          </div>
        }
      />

      <div style={{ padding: '8px var(--px) 14px' }}>
        <div style={{ background: 'var(--card)', borderRadius: 'var(--r)', padding: '15px 17px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 15, background: 'linear-gradient(135deg,#C4A46B,#8A6A38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkles" size={20} color="#fff" strokeWidth={1.5}/>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{t('title', lang)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300 }}>
              {t('subtitle', lang)}
            </div>
          </div>
        </div>
      </div>

      <div className="chips">
        {(CHIPS[lang] || CHIPS.fr).map(s => (
          <div key={s.l} className="chip" onClick={() => handleSend(s.l)}>
            <Icon name={s.i} size={13}/>
            <span>{s.l}</span>
          </div>
        ))}
      </div>

      {convError && (
        <div style={{ padding: '20px var(--px)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{t('loadErr', lang)}</div>
          <div style={{ fontSize: 11, color: '#B85050', marginBottom: 12, fontFamily: 'monospace', background: 'rgba(184,80,80,.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'left', wordBreak: 'break-word' }}>
            {convError}
          </div>
          <button
            onClick={() => { setConvError(null); window.location.reload() }}
            style={{ background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {t('retry', lang)}
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
              {t('greeting', lang)}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.direction === 'outgoing' ? 'flex-end' : 'flex-start' }}>
              {m.direction !== 'outgoing' && <div className="bsndr">Assistant</div>}
              <div className={`bbl ${m.direction === 'outgoing' ? 'usr' : 'ai'}`}>
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
          placeholder={t('placeholder', lang)}
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
