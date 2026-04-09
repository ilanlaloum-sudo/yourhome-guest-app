import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { usePropertyRules, usePropertyKnowledge } from '../../hooks/useProperty'

const fmtLong = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const T = {
  noStay:     { fr: 'Aucun séjour actif',  en: 'No active stay' },
  myStay:     { fr: 'Mon séjour',          en: 'My stay' },
  confirmed:  { fr: 'Réservation confirmée', en: 'Reservation confirmed' },
  checkin:    { fr: 'Check-in',             en: 'Check-in' },
  arrivalTime:{ fr: "Heure d'arrivée",     en: 'Arrival time' },
  from:       { fr: 'À partir de',         en: 'From' },
  date:       { fr: 'Date',                en: 'Date' },
  instructions:{ fr: 'Instructions',       en: 'Instructions' },
  arrivalNote:{ fr: "Note d'arrivée",      en: 'Arrival note' },
  accessCodes:{ fr: "Codes d'accès",       en: 'Access codes' },
  accessCode: { fr: "Code d'accès",        en: 'Access code' },
  available:  { fr: 'Disponible 24h avant votre arrivée', en: 'Available 24h before arrival' },
  codesOn:    { fr: 'Codes disponibles le', en: 'Codes available on' },
  stayEnded:  { fr: 'Séjour terminé — codes indisponibles', en: 'Stay ended — codes unavailable' },
  wifi:       { fr: 'WiFi',                en: 'WiFi' },
  wifiAvail:  { fr: 'Disponible dans le logement', en: 'Available in property' },
  parking:    { fr: 'Parking',             en: 'Parking' },
  parkingInfo:{ fr: "Informations disponibles à l'arrivée", en: 'Information available on arrival' },
  checkout:   { fr: 'Check-out',           en: 'Check-out' },
  departTime: { fr: 'Heure de départ',     en: 'Departure time' },
  before:     { fr: 'Avant',              en: 'Before' },
  lateCheckout:{ fr: 'Demander un late check-out', en: 'Request late check-out' },
  see:        { fr: 'VOIR',               en: 'VIEW' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

export default function StayScreen({ reservation, lang = 'fr', onToggleLang, session, onSignOut }) {
  const { rules } = usePropertyRules(reservation?.property_id)
  const { knowledge } = usePropertyKnowledge(reservation?.property_id)

  // Date-based code visibility
  const now = new Date()
  const checkInDate = new Date(reservation?.check_in_at)
  const checkOutDate = new Date(reservation?.check_out_at)
  checkInDate.setHours(0, 0, 0, 0)
  checkOutDate.setHours(0, 0, 0, 0)
  const codesVisible = now >= checkInDate && now < checkOutDate
  const stayEnded = now >= checkOutDate
  const beforeStay = now < checkInDate

  // Get property knowledge entries
  const accessEntry = knowledge?.find(k => k.category === 'access')
  const wifiEntry = knowledge?.find(k => k.category === 'wifi')
  const parkingEntry = knowledge?.find(k => k.category === 'parking')

  // Fallback values for when knowledge entries exist
  const accessCode = accessEntry?.content || '4892'
  const wifiInfo = wifiEntry?.content || 'TheOpus_Premium / Dubai2025'
  const parkingInfo = parkingEntry?.content || 'Niveau B2, place n°47'

  const lockedMsg = stayEnded
    ? t('stayEnded', lang)
    : `${t('codesOn', lang)} ${fmtLong(reservation?.check_in_at)}`

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

  return (
    <div className="page">
      <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
      <div className="ptitle">{t('myStay', lang)}</div>
      <div className="psub">{reservation.booking_reference || t('confirmed', lang)}</div>

      <div className="slbl">{t('checkin', lang)}</div>
      <div className="ib">
        <div className="ir">
          <div className="iico"><Icon name="clock" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('arrivalTime', lang)}</div>
            <div className="ival">{t('from', lang)} {rules?.checkin_time || '15:00'}</div>
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('date', lang)}</div>
            <div className="ival">{fmtLong(reservation.check_in_at)}</div>
          </div>
        </div>
        {reservation.guest_instructions && (
          <div className="ir">
            <div className="iico"><Icon name="shield" size={15} color="var(--gold-dk)"/></div>
            <div style={{ flex: 1 }}>
              <div className="ilbl">{t('instructions', lang)}</div>
              <div className="ival">{reservation.guest_instructions}</div>
            </div>
          </div>
        )}
        {reservation.arrival_note && (
          <div className="ir">
            <div className="iico"><Icon name="messageCircle" size={15} color="var(--gold-dk)"/></div>
            <div style={{ flex: 1 }}>
              <div className="ilbl">{t('arrivalNote', lang)}</div>
              <div className="ival">{reservation.arrival_note}</div>
            </div>
          </div>
        )}
      </div>

      <div className="slbl">{t('accessCodes', lang)}</div>
      <div className="ib">
        <div className="ir">
          <div className="iico"><Icon name="key" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('accessCode', lang)}</div>
            {codesVisible ? (
              <div className="ival code" style={{ fontSize: 18, fontWeight: 600, letterSpacing: 4 }}>{accessCode}</div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 300 }}>
                {lockedMsg}
              </div>
            )}
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="wifi" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('wifi', lang)}</div>
            {codesVisible ? (
              <div className="ival" style={{ fontSize: 14, fontWeight: 600 }}>{wifiInfo}</div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 300 }}>
                {lockedMsg}
              </div>
            )}
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="parking" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('parking', lang)}</div>
            {codesVisible ? (
              <div className="ival" style={{ fontSize: 14, fontWeight: 600 }}>{parkingInfo}</div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 300 }}>
                {lockedMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="slbl">{t('checkout', lang)}</div>
      <div className="ib">
        <div className="ir">
          <div className="iico"><Icon name="clock" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('departTime', lang)}</div>
            <div className="ival">{t('before', lang)} {rules?.checkout_time || '11:00'}</div>
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">{t('date', lang)}</div>
            <div className="ival">{fmtLong(reservation.check_out_at)}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '8px var(--px)' }}>
        <button className="btn-o" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="clock" size={14} color="var(--gold-dk)"/> {t('lateCheckout', lang)}
        </button>
      </div>
    </div>
  )
}
