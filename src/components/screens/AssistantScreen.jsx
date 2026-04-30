import { useState, useEffect, useRef } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { useConversation, useMessages, useSendMessage } from '../../hooks/useConversation'
import { supabase } from '../../lib/supabase'

const CHIPS = {
  fr: {
    in_stay: [
      { i: 'wifi',       l: 'WiFi ?' },
      { i: 'parking',    l: 'Parking ?' },
      { i: 'moon',       l: 'Late check-out ?' },
      { i: 'utensils',   l: 'Restaurants ?' },
      { i: 'taxi',       l: 'Taxi ?' },
    ],
    confirmed: [
      { i: 'key',        l: 'Arrivée' },
      { i: 'plane',      l: 'Transfert' },
      { i: 'shoppingBag',l: 'Courses' },
      { i: 'concierge',  l: 'Services' },
      { i: 'alert',      l: 'Question' },
    ],
    default: [
      { i: 'key',        l: 'Arrivée' },
      { i: 'wifi',       l: 'WiFi' },
      { i: 'concierge',  l: 'Service' },
      { i: 'utensils',   l: 'Restaurant' },
      { i: 'mapPin',     l: 'Quartier' },
    ],
  },
  en: {
    in_stay: [
      { i: 'wifi',       l: 'WiFi?' },
      { i: 'parking',    l: 'Parking?' },
      { i: 'moon',       l: 'Late check-out?' },
      { i: 'utensils',   l: 'Restaurants?' },
      { i: 'taxi',       l: 'Taxi?' },
    ],
    confirmed: [
      { i: 'key',        l: 'Arrival' },
      { i: 'plane',      l: 'Transfer' },
      { i: 'shoppingBag',l: 'Groceries' },
      { i: 'concierge',  l: 'Services' },
      { i: 'alert',      l: 'Question' },
    ],
    default: [
      { i: 'key',        l: 'Arrival' },
      { i: 'wifi',       l: 'WiFi' },
      { i: 'concierge',  l: 'Service' },
      { i: 'utensils',   l: 'Restaurant' },
      { i: 'mapPin',     l: 'Area' },
    ],
  },
}

const T = {
  title:      { fr: 'Assistant Your Home',  en: 'Your Home Assistant' },
  subtitle:   { fr: 'Concierge premium disponible 24h/24', en: 'Premium concierge available 24/7' },
  online:     { fr: 'En ligne',   en: 'Online' },
  loadErr:    { fr: 'Impossible de charger la conversation.', en: 'Unable to load conversation.' },
  retry:      { fr: 'Réessayer',  en: 'Retry' },
  greeting: {
    fr: 'Bonjour ! Je suis votre concierge Your Home. Comment puis-je vous aider ?',
    en: 'Hello! I\'m your Your Home concierge. How can I help?',
  },
  greetingWithProperty: {
    fr: (name) => `Bonjour ! Je suis votre concierge Your Home. Comment puis-je vous aider pendant votre séjour à ${name} ?`,
    en: (name) => `Hello! I'm your Your Home concierge. How can I help during your stay at ${name}?`,
  },
  placeholder:{ fr: 'Posez votre question...', en: 'Ask your question...' },
  noReservation: {
    fr: 'Aucune réservation active sur votre compte.\nLe chat conciergerie sera disponible pendant votre séjour.',
    en: 'No active reservation on your account.\nThe concierge chat will be available during your stay.',
  },
  noGuest: {
    fr: 'Profil locataire introuvable. Contactez le support pour activer votre compte.',
    en: 'Tenant profile not found. Contact support to activate your account.',
  },
  sendErr: {
    fr: 'Échec de l\'envoi. Réessayez dans un instant.',
    en: 'Send failed. Please try again in a moment.',
  },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

export default function AssistantScreen({ reservation, session, lang = 'fr', onToggleLang, onSignOut }) {
  const [input, setInput] = useState('')
  const [convError, setConvError] = useState(null)
  const [sendError, setSendError] = useState(null)
  const [activeConvId, setActiveConvId] = useState(null)
  const ref = useRef(null)
  const inputRef = useRef(null)
  const stayPhase = reservation?.status || 'default'

  const { conversation, state: convState, error: convErr } = useConversation()
  const { messages, loading: messagesLoading, addMessage } = useMessages(activeConvId)
  const { sendMessage, sending } = useSendMessage()

  // Sync the local active conversation id with the hook resolution. The id can
  // also be assigned later by the edge function on the very first send.
  useEffect(() => {
    if (conversation?.id && conversation.id !== activeConvId) {
      setActiveConvId(conversation.id)
    }
  }, [conversation?.id, activeConvId])

  const chips = CHIPS[lang]?.[stayPhase] || CHIPS[lang]?.default || CHIPS.fr.default

  // Check for prefilled message from HomeScreen CTA
  useEffect(() => {
    const prefilled = localStorage.getItem('prefilled_message')
    if (prefilled) {
      setInput(prefilled)
      localStorage.removeItem('prefilled_message')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  useEffect(() => {
    if (convState === 'error' && convErr) {
      setConvError(typeof convErr === 'string' ? convErr : convErr.message || String(convErr))
    } else {
      setConvError(null)
    }
  }, [convState, convErr])

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    if (!text.trim() || sending) return
    setInput('')
    setSendError(null)

    addMessage({
      id: 'opt-user-' + Date.now(),
      direction: 'inbound',
      role: 'guest',
      content_text: text,
      created_at: new Date().toISOString(),
    })

    let data
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      data = await sendMessage({
        conversationId: activeConvId,
        text,
        accessToken: currentSession?.access_token,
      })
    } catch (err) {
      console.error(err)
      setSendError(t('sendErr', lang))
      return
    }

    setSendError(null)

    if (data?.conversation_id && data.conversation_id !== activeConvId) {
      setActiveConvId(data.conversation_id)
    }

    if (data?.reply) {
      addMessage({
        id: 'opt-asst-' + Date.now(),
        direction: 'outbound',
        role: 'assistant',
        content_text: data.reply,
        created_at: new Date().toISOString(),
      })
    }
  }

  // Hard guards — rendered before the chat shell so we don't show a half-broken
  // assistant when the prerequisites aren't met.
  if (!reservation) {
    return (
      <AssistantUnavailable
        lang={lang}
        onToggleLang={onToggleLang}
        session={session}
        onSignOut={onSignOut}
        title={t('noReservation', lang).split('\n')[0]}
        body={t('noReservation', lang).split('\n').slice(1).join(' ')}
      />
    )
  }
  if (convState === 'no_guest') {
    return (
      <AssistantUnavailable
        lang={lang}
        onToggleLang={onToggleLang}
        session={session}
        onSignOut={onSignOut}
        title={t('noGuest', lang)}
      />
    )
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
        {chips.map(s => (
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
              {reservation?.property_name
                ? T.greetingWithProperty[lang](reservation.property_name)
                : t('greeting', lang)}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.direction === 'inbound'
            return (
              <div key={m.id ?? i} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                {!isUser && <div className="bsndr">Assistant</div>}
                <div className={`bbl ${isUser ? 'usr' : 'ai'}`}>
                  {m.content_text}
                </div>
              </div>
            )
          })
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

      {sendError && (
        <div style={{ padding: '6px var(--px) 0', fontSize: 11, color: '#B85050', textAlign: 'center' }}>
          {sendError}
        </div>
      )}

      <div className="cbar">
        <input
          ref={inputRef}
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

function AssistantUnavailable({ lang, onToggleLang, session, onSignOut, title, body }) {
  return (
    <div className="page" style={{ paddingBottom: 160 }}>
      <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '60px var(--px)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg,#C4A46B,#8A6A38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sparkles" size={26} color="#fff" strokeWidth={1.5}/>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', maxWidth: 320 }}>
          {title}
        </div>
        {body && (
          <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 320, lineHeight: 1.5 }}>
            {body}
          </div>
        )}
      </div>
    </div>
  )
}
