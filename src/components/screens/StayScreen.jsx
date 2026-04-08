import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { usePropertyRules } from '../../hooks/useProperty'

const fmtLong = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export default function StayScreen({ reservation }) {
  const [show, setShow] = useState({ code: false, wifi: false })
  const { rules } = usePropertyRules(reservation?.property_id)

  if (!reservation) {
    return (
      <div className="page">
        <Header/>
        <div style={{ padding: '60px var(--px)', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, marginBottom: 12 }}>
            Aucun sejour actif
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Header/>
      <div className="ptitle">Mon sejour</div>
      <div className="psub">{reservation.booking_reference || 'Reservation confirmee'}</div>

      <div className="slbl">Check-in</div>
      <div className="ib">
        <div className="ir">
          <div className="iico"><Icon name="clock" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Heure d arrivee</div>
            <div className="ival">A partir de {rules?.checkin_time || '15:00'}</div>
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Date</div>
            <div className="ival">{fmtLong(reservation.check_in_at)}</div>
          </div>
        </div>
        {reservation.guest_instructions && (
          <div className="ir">
            <div className="iico"><Icon name="shield" size={15} color="var(--gold-dk)"/></div>
            <div style={{ flex: 1 }}>
              <div className="ilbl">Instructions</div>
              <div className="ival">{reservation.guest_instructions}</div>
            </div>
          </div>
        )}
        {reservation.arrival_note && (
          <div className="ir">
            <div className="iico"><Icon name="messageCircle" size={15} color="var(--gold-dk)"/></div>
            <div style={{ flex: 1 }}>
              <div className="ilbl">Note d arrivee</div>
              <div className="ival">{reservation.arrival_note}</div>
            </div>
          </div>
        )}
      </div>

      <div className="slbl">Codes d acces</div>
      <div className="ib">
        <div className="ir" style={{ cursor: 'pointer' }} onClick={() => setShow(s => ({ ...s, code: !s.code }))}>
          <div className="iico"><Icon name="key" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Code d acces</div>
            {show.code
              ? <div className="ival code">****</div>
              : <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ letterSpacing: 6, color: 'var(--muted)', fontSize: 16 }}>****</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                    <Icon name="eye" size={12} color="var(--gold)"/> VOIR
                  </div>
                </div>
            }
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 300 }}>
              Disponible 24h avant votre arrivee
            </div>
          </div>
        </div>
        <div className="ir" style={{ cursor: 'pointer' }} onClick={() => setShow(s => ({ ...s, wifi: !s.wifi }))}>
          <div className="iico"><Icon name="wifi" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">WiFi</div>
            {show.wifi
              ? <div className="ival">Disponible dans le logement</div>
              : <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ letterSpacing: 4, color: 'var(--muted)', fontSize: 12 }}>********</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                    <Icon name="eye" size={12} color="var(--gold)"/> VOIR
                  </div>
                </div>
            }
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="parking" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Parking</div>
            <div className="ival">Informations disponibles a l arrivee</div>
          </div>
        </div>
      </div>

      <div className="slbl">Check-out</div>
      <div className="ib">
        <div className="ir">
          <div className="iico"><Icon name="clock" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Heure de depart</div>
            <div className="ival">Avant {rules?.checkout_time || '11:00'}</div>
          </div>
        </div>
        <div className="ir">
          <div className="iico"><Icon name="calendar" size={15} color="var(--gold-dk)"/></div>
          <div style={{ flex: 1 }}>
            <div className="ilbl">Date</div>
            <div className="ival">{fmtLong(reservation.check_out_at)}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '8px var(--px)' }}>
        <button className="btn-o" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="clock" size={14} color="var(--gold-dk)"/> Demander un late check-out
        </button>
      </div>
    </div>
  )
}
