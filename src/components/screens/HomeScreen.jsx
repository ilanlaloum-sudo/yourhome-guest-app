import Icon from '../ui/Icon'
import Header from '../layout/Header'

const fmtShort = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
const fmtLong = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const PHASE = {
  confirmed: { l: 'A VENIR', c: '#C4A46B', bg: 'rgba(196,164,107,.14)' },
  in_stay:   { l: 'EN COURS', c: '#3D7A56', bg: 'rgba(61,122,86,.14)' },
  completed: { l: 'TERMINE',  c: '#6A6050', bg: 'rgba(106,96,80,.10)' },
}

const BANNERS = {
  confirmed: { bg: 'rgba(196,164,107,.08)', dot: '#C4A46B', txt: 'Votre sejour approche. Preparez votre arrivee.' },
  in_stay:   { bg: 'rgba(61,122,86,.08)',   dot: '#3D7A56', txt: 'Bienvenue ! Votre sejour est en cours. Comment pouvons-nous vous aider ?' },
  completed: { bg: 'rgba(106,96,80,.08)',   dot: '#A09880', txt: 'Merci pour votre sejour. Votre avis nous est precieux.' },
}

export default function HomeScreen({ reservation, onNavigate }) {
  if (!reservation) {
    return (
      <div className="page">
        <Header/>
        <div style={{ padding: '60px var(--px)', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: 'var(--text)', marginBottom: 12 }}>
            Aucun sejour actif
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>
            Votre prochain sejour apparaitra ici une fois confirme.
          </div>
        </div>
      </div>
    )
  }

  const status = reservation.status || 'confirmed'
  const phase = PHASE[status] || PHASE.confirmed
  const banner = BANNERS[status] || BANNERS.confirmed

  const qa = [
    { i: 'key',          l: 'Arrivee',   t: 1 },
    { i: 'wifi',         l: 'WiFi',      t: 1 },
    { i: 'concierge',    l: 'Services',  t: 3 },
    { i: 'messageCircle',l: 'Assistant', t: 4 },
    { i: 'building',     l: 'Logement',  t: 2 },
    { i: 'alert',        l: 'Probleme',  t: 4 },
  ]

  return (
    <div className="page">
      <Header/>

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
            <div className="htitle">{reservation.property_id || 'Votre logement'}</div>
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

      <div className="slbl">Acces rapide</div>
      <div className="qgrid">
        {qa.map(a => (
          <div key={a.l} className="qi" onClick={() => onNavigate(a.t)}>
            <div className="qico"><Icon name={a.i} size={18} color="var(--gold-dk)"/></div>
            <div className="qlbl">{a.l}</div>
          </div>
        ))}
      </div>

      <div className="slbl">Reservation</div>
      <div className="ib">
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Arrivee</div>
            <div className="ival">{fmtLong(reservation.check_in_at)}</div>
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Depart</div>
            <div className="ival">{fmtLong(reservation.check_out_at)}</div>
          </div>
        </div>
        {reservation.booking_reference && (
          <div className="ir">
            <div className="iico"><Icon name="tag" size={15} color="var(--gold-dk)"/></div>
            <div style={{ flex: 1 }}>
              <div className="ilbl">Reference</div>
              <div className="ival">{reservation.booking_reference}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
