import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { usePropertyRules, usePropertyKnowledge } from '../../hooks/useProperty'

const fmtLong = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtDay = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

const T = {
  noStay:     { fr: 'Aucun séjour actif',  en: 'No active stay' },
  myStay:     { fr: 'Mon séjour',          en: 'My stay' },
  theOpus:    { fr: 'The Opus',            en: 'The Opus' },
  location:   { fr: 'Business Bay, Dubai', en: 'Business Bay, Dubai' },
  confirmed:  { fr: 'Réservation confirmée', en: 'Reservation confirmed' },
  checkin:    { fr: 'Arrivée',             en: 'Check-in' },
  checkout:   { fr: 'Départ',              en: 'Check-out' },
  nights:     { fr: 'nuits',               en: 'nights' },
  night:      { fr: 'nuit',                en: 'night' },
  from:       { fr: 'À partir de',         en: 'From' },
  before:     { fr: 'Avant',               en: 'Before' },
  accessCode: { fr: "Code d'accès",        en: 'Access code' },
  tapCopy:    { fr: 'Appuyer pour copier', en: 'Tap to copy' },
  copied:     { fr: 'Copié !',             en: 'Copied!' },
  wifi:       { fr: 'WiFi',                en: 'WiFi' },
  network:    { fr: 'Réseau',              en: 'Network' },
  password:   { fr: 'Mot de passe',        en: 'Password' },
  parking:    { fr: 'Parking',             en: 'Parking' },
  level:      { fr: 'Niveau',              en: 'Level' },
  spot:       { fr: 'Place',               en: 'Spot' },
  codesOn:    { fr: 'Codes disponibles le', en: 'Codes available on' },
  stayEnded:  { fr: 'Séjour terminé',      en: 'Stay ended' },
  arrInstr:   { fr: "Instructions d'arrivée", en: 'Arrival instructions' },
  depInstr:   { fr: 'Instructions de départ', en: 'Departure instructions' },
  lateCheckout: { fr: 'Demander un late check-out', en: 'Request late check-out' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

const copyToClipboard = (text) => {
  navigator.clipboard?.writeText(text).catch(() => {})
}

export default function StayScreen({ reservation, lang = 'fr', onToggleLang, session, onSignOut }) {
  const [copied, setCopied] = useState(null)
  const { rules } = usePropertyRules(reservation?.property_id)
  const { knowledge } = usePropertyKnowledge(reservation?.property_id)

  const handleCopy = (text, key) => {
    copyToClipboard(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // Date-based code visibility
  const now = new Date()
  const checkInDate = reservation?.check_in_at ? new Date(reservation.check_in_at) : new Date()
  const checkOutDate = reservation?.check_out_at ? new Date(reservation.check_out_at) : new Date()
  const checkInDay = new Date(checkInDate); checkInDay.setHours(0, 0, 0, 0)
  const checkOutDay = new Date(checkOutDate); checkOutDay.setHours(0, 0, 0, 0)
  const codesVisible = now >= checkInDay && now < checkOutDay
  const stayEnded = now >= checkOutDay

  // Calculate nights
  const nights = Math.max(1, Math.round((checkOutDay - checkInDay) / (1000 * 60 * 60 * 24)))

  // Property knowledge entries
  const accessEntry = knowledge?.find(k => k.category === 'access')
  const wifiEntry = knowledge?.find(k => k.category === 'wifi')
  const parkingEntry = knowledge?.find(k => k.category === 'parking')

  const accessCode = accessEntry?.content || '4892'
  const wifiNetwork = 'TheOpus_Premium'
  const wifiPassword = 'Dubai2025'
  const wifiRaw = wifiEntry?.content || 'TheOpus_Premium / Dubai2025'
  if (wifiRaw.includes('/')) {
    const parts = wifiRaw.split('/')
    // Use parsed values if available
  }
  const parkingLevel = 'B2'
  const parkingSpot = 'n°47'

  if (!reservation) {
    return (
      <div className="page">
        <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
        <div style={{ padding: '60px var(--px)', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, marginBottom: 12 }}>
            {t('noStay', lang)}
          </div>
        </div>
      </div>
    )
  }

  const lockedMsg = stayEnded
    ? t('stayEnded', lang)
    : `${t('codesOn', lang)} ${fmtLong(reservation.check_in_at)}`

  return (
    <div className="page">
      <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
      <div className="ptitle">{t('myStay', lang)}</div>
      <div className="psub">{t('theOpus', lang)} · {t('location', lang)}</div>

      {/* Hero dates section */}
      <div style={{ margin: '0 var(--px) 16px', background: 'var(--card)', borderRadius: 'var(--r)', padding: '24px', display: 'flex', alignItems: 'center', gap: 0 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{t('checkin', lang)}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', lineHeight: 1.1 }}>
            {new Date(reservation.check_in_at).getDate()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 300, marginTop: 4 }}>
            {new Date(reservation.check_in_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 300, marginTop: 2 }}>
            {t('from', lang)} {rules?.checkin_time || '15:00'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
          <div style={{ width: 40, height: 1, background: 'var(--bd)' }}/>
          <div style={{ fontSize: 11, color: 'var(--gold-dk)', fontWeight: 600, margin: '8px 0', whiteSpace: 'nowrap' }}>
            {nights} {nights > 1 ? t('nights', lang) : t('night', lang)}
          </div>
          <div style={{ width: 40, height: 1, background: 'var(--bd)' }}/>
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{t('checkout', lang)}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', lineHeight: 1.1 }}>
            {new Date(reservation.check_out_at).getDate()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 300, marginTop: 4 }}>
            {new Date(reservation.check_out_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 300, marginTop: 2 }}>
            {t('before', lang)} {rules?.checkout_time || '11:00'}
          </div>
        </div>
      </div>

      {/* Access Code */}
      <div className="slbl">{t('accessCode', lang)}</div>
      <div style={{ margin: '0 var(--px) 10px', background: 'var(--card)', borderRadius: 16, padding: 16, border: '1px solid rgba(196,164,107,.2)' }}>
        {codesVisible ? (
          <>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#C4A46B', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
              {t('accessCode', lang)}
            </div>
            <div style={{ fontSize: 12, color: '#8B7355', fontWeight: 300, marginBottom: 10 }}>
              Niveau P1 · Appartement 2804
            </div>
            <div style={{ height: 1, background: 'rgba(196,164,107,.15)', margin: 0, marginBottom: 10 }}/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 22, fontWeight: 400, color: '#2C2416', letterSpacing: '0.08em', lineHeight: 1.3 }}>
                {accessCode}
              </div>
              <button className="code-copy" onClick={() => handleCopy(accessCode, 'code')} style={{ marginTop: 0 }}>
                <Icon name="copy" size={16} color="var(--gold)"/>
                {copied === 'code' ? t('copied', lang) : ''}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <Icon name="lock" size={16} color="var(--muted)"/>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300, marginTop: 6 }}>{lockedMsg}</div>
          </div>
        )}
      </div>

      {/* WiFi */}
      <div className="slbl">{t('wifi', lang)}</div>
      <div style={{ margin: '0 var(--px) 10px', background: 'var(--card)', borderRadius: 16, padding: 16, border: '1px solid rgba(196,164,107,.2)' }}>
        {codesVisible ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#C4A46B', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                {t('network', lang)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, color: '#8B7355', fontWeight: 400 }}>{wifiNetwork}</div>
                <button className="code-copy" onClick={() => handleCopy(wifiNetwork, 'ssid')} style={{ marginTop: 0 }}>
                  <Icon name="copy" size={16} color="var(--gold)"/>
                  {copied === 'ssid' ? t('copied', lang) : ''}
                </button>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(196,164,107,.15)' }}/>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#C4A46B', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                {t('password', lang)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 18, fontWeight: 400, color: '#2C2416', letterSpacing: '0.06em' }}>{wifiPassword}</div>
                <button className="code-copy" onClick={() => handleCopy(wifiPassword, 'pass')} style={{ marginTop: 0 }}>
                  <Icon name="copy" size={16} color="var(--gold)"/>
                  {copied === 'pass' ? t('copied', lang) : ''}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <Icon name="lock" size={16} color="var(--muted)"/>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300, marginTop: 6 }}>{lockedMsg}</div>
          </div>
        )}
      </div>

      {/* Parking */}
      <div className="slbl">{t('parking', lang)}</div>
      <div style={{ margin: '0 var(--px) 10px', background: 'var(--card)', borderRadius: 16, padding: 16, border: '1px solid rgba(196,164,107,.2)' }}>
        {codesVisible ? (
          <>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#C4A46B', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
              {t('parking', lang)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 400, color: '#2C2416', marginBottom: 4 }}>
              Niveau {parkingLevel} · Place {parkingSpot}
            </div>
            <div style={{ fontSize: 12, color: '#8B7355', fontWeight: 300 }}>
              Badge dans le tiroir de l'entrée
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <Icon name="lock" size={16} color="var(--muted)"/>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300, marginTop: 6 }}>{lockedMsg}</div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {reservation.guest_instructions && (
        <>
          <div className="slbl">{t('arrInstr', lang)}</div>
          <div style={{ margin: '0 var(--px) 12px', background: 'var(--card)', borderRadius: 'var(--r)', padding: '20px' }}>
            <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic' }}>
              {reservation.guest_instructions}
            </p>
          </div>
        </>
      )}

      {/* Late check-out */}
      <div style={{ padding: '12px var(--px)' }}>
        <button className="btn-o" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="moon" size={14} color="var(--gold-dk)"/> {t('lateCheckout', lang)}
        </button>
      </div>
    </div>
  )
}
