import Icon from '../ui/Icon'
import Header from '../layout/Header'

const fmtShort = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
const fmtLong = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const T = {
  noStay:     { fr: 'Aucun séjour actif',  en: 'No active stay' },
  noStaySub:  { fr: 'Votre prochain séjour apparaîtra ici une fois confirmé.', en: 'Your next stay will appear here once confirmed.' },
  upcoming:   { fr: 'À VENIR',   en: 'UPCOMING' },
  inProgress: { fr: 'EN COURS',  en: 'IN PROGRESS' },
  completed:  { fr: 'TERMINÉ',   en: 'COMPLETED' },
  bannerConf: { fr: 'Votre séjour approche. Préparez votre arrivée.', en: 'Your stay is coming up. Prepare your arrival.' },
  bannerStay: { fr: 'Bienvenue ! Votre séjour est en cours. Comment pouvons-nous vous aider ?', en: 'Welcome! Your stay is in progress. How can we help?' },
  bannerDone: { fr: 'Merci pour votre séjour. Votre avis nous est précieux.', en: 'Thank you for your stay. Your feedback is valuable.' },
  quickAccess:{ fr: 'Accès rapide', en: 'Quick access' },
  reservation:{ fr: 'Réservation', en: 'Reservation' },
  arrival:    { fr: 'Arrivée',   en: 'Arrival' },
  departure:  { fr: 'Départ',    en: 'Departure' },
  reference:  { fr: 'Référence', en: 'Reference' },
  property:   { fr: 'Votre logement', en: 'Your property' },
  wifi:       { fr: 'WiFi',      en: 'WiFi' },
  services:   { fr: 'Services',  en: 'Services' },
  assistant:  { fr: 'Assistant', en: 'Assistant' },
  housing:    { fr: 'Logement',  en: 'Property' },
  problem:    { fr: 'Problème',  en: 'Issue' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

const PHASE = (lang) => ({
  confirmed: { l: t('upcoming', lang), c: '#C4A46B', bg: 'rgba(196,164,107,.14)' },
  in_stay:   { l: t('inProgress', lang), c: '#3D7A56', bg: 'rgba(61,122,86,.14)' },
  completed: { l: t('completed', lang),  c: '#6A6050', bg: 'rgba(106,96,80,.10)' },
})

const BANNERS = (lang) => ({
  confirmed: { bg: 'rgba(196,164,107,.08)', dot: '#C4A46B', txt: t('bannerConf', lang) },
  in_stay:   { bg: 'rgba(61,122,86,.08)',   dot: '#3D7A56', txt: t('bannerStay', lang) },
  completed: { bg: 'rgba(106,96,80,.08)',   dot: '#A09880', txt: t('bannerDone', lang) },
})

export default function HomeScreen({ reservation, onNavigate, lang = 'fr', onToggleLang, session, onSignOut }) {
  if (!reservation) {
    return (
      <div className="page">
        <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
        <div style={{ padding: '60px var(--px)', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: 'var(--text)', marginBottom: 12 }}>
            {t('noStay', lang)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>
            {t('noStaySub', lang)}
          </div>
        </div>
      </div>
    )
  }

  const status = reservation.status || 'confirmed'
  const phases = PHASE(lang)
  const phase = phases[status] || phases.confirmed
  const banners = BANNERS(lang)
  const banner = banners[status] || banners.confirmed

  const qa = [
    { i: 'key',          l: t('arrival', lang),   t: 1 },
    { i: 'wifi',         l: t('wifi', lang),      t: 1 },
    { i: 'concierge',    l: t('services', lang),  t: 3 },
    { i: 'messageCircle',l: t('assistant', lang), t: 4 },
    { i: 'building',     l: t('housing', lang),   t: 2 },
    { i: 'alert',        l: t('problem', lang),   t: 4 },
  ]

  return (
    <div className="page">
      <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>

      <div style={{ padding: '4px var(--px) 0' }}>
        <div className="hero">
          {reservation.cover_photo_url ? (
            <img src={reservation.cover_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2D2418, #1A1510)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="building" size={48} color="rgba(196,164,107,.3)" strokeWidth={1}/>
            </div>
          )}
          <div className="hero-ov"/>
          <div className="hero-ct">
            <div className="hbadge" style={{ background: phase.bg, color: phase.c }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: phase.c, display: 'inline-block' }}/>
              {phase.l}
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 400,
              color: '#fff',
              textShadow: '0 1px 8px rgba(0,0,0,.5)',
              marginBottom: 2,
            }}>
              {reservation.property_name || 'The Opus'}
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 300,
              color: 'rgba(255,255,255,.75)',
              textShadow: '0 1px 4px rgba(0,0,0,.4)',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}>
              {reservation.property_location || 'Business Bay, Dubai'}
            </div>
            <div className="hdates">
              <Icon name="calendar" size={11} color="rgba(255,255,255,.5)"/>
              {fmtShort(reservation.check_in_at)} - {fmtShort(reservation.check_out_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="pbanner" style={{ background: banner.bg }}>
        <div className="pdot" style={{ background: banner.dot }}/>
        <div style={{ fontSize: 12, color: 'var(--sub)', fontWeight: 400, lineHeight: 1.5 }}>{banner.txt}</div>
      </div>

      <div className="slbl">{t('quickAccess', lang)}</div>
      <div className="qgrid">
        {qa.map(a => (
          <div key={a.l} className="qi" onClick={() => onNavigate(a.t)}>
            <div className="qico"><Icon name={a.i} size={18} color="var(--gold-dk)"/></div>
            <div className="qlbl">{a.l}</div>
          </div>
        ))}
      </div>

      <div className="slbl">{t('reservation', lang)}</div>
      <div className="ib">
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('arrival', lang)}</div>
            <div className="ival">{fmtLong(reservation.check_in_at)}</div>
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('departure', lang)}</div>
            <div className="ival">{fmtLong(reservation.check_out_at)}</div>
          </div>
        </div>
        {reservation.booking_reference && (
          <div className="ir">
            <div className="iico"><Icon name="tag" size={15} color="var(--gold-dk)"/></div>
            <div style={{ flex: 1 }}>
              <div className="ilbl">{t('reference', lang)}</div>
              <div className="ival">{reservation.booking_reference}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
