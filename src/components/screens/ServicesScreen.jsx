import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { useServices, useCreateServiceRequest } from '../../hooks/useServices'

const ICON_MAP = {
  'Arrivee':     'plane',
  'Confort':     'sparkles',
  'Famille':     'heart',
  'Experiences': 'flower',
  'Mobilite':    'car',
}

export default function ServicesScreen({ reservation }) {
  const [cat, setCat] = useState('Tous')
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState([])
  const { services, loading } = useServices(reservation?.property_id)
  const { createRequest, loading: creating } = useCreateServiceRequest()

  const cats = ['Tous', ...Array.from(new Set(services.map(s => s.service?.category || 'Autre')))]
  const filtered = cat === 'Tous'
    ? services
    : services.filter(s => (s.service?.category || 'Autre') === cat)

  const handleOrder = async (svc) => {
    try {
      await createRequest({
        reservationId: reservation?.id,
        guestId: reservation?.guest_id,
        serviceId: svc.service?.id,
        priceEur: svc.custom_price_eur || svc.service?.base_price_eur,
      })
      setDone(d => [...d, svc.id])
      setSelected(null)
    } catch (err) {
      console.error(err)
    }
  }

  const getPrice = (svc) => {
    const price = svc.custom_price_eur || svc.service?.base_price_eur
    const type = svc.service?.pricing_type
    if (type === 'free') return 'Inclus'
    if (type === 'on_request') return 'Sur demande'
    if (price) return 'EUR ' + price
    return 'Sur demande'
  }

  const getType = (svc) => {
    const type = svc.service?.pricing_type
    if (type === 'free') return 'included'
    if (type === 'on_request') return 'req'
    return 'paid'
  }

  if (loading) {
    return (
      <div className="page">
        <Header/>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="dot" style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}/>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Header/>
      <div className="ptitle">Services</div>
      <div className="psub">Un accompagnement premium a chaque etape</div>

      <div className="ctabs">
        {cats.map(c => (
          <button key={c} className={`ctab${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px var(--px)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>
            Aucun service disponible pour ce bien.
          </div>
        </div>
      ) : (
        <div className="sgrid">
          {filtered.map(svc => (
            <div key={svc.id} className="sc" onClick={() => setSelected(svc)}>
              <div className="simg">
                <Icon
                  name={ICON_MAP[svc.service?.category] || 'sparkles'}
                  size={30}
                  color="var(--gold)"
                  strokeWidth={1.3}
                />
              </div>
              <div className="sbod">
                <div className="sn">{svc.service?.name_fr}</div>
                <div className="sd">{svc.service?.description_fr}</div>
                <div className="sf">
                  <div className="sp">{getPrice(svc)}</div>
                  {done.includes(svc.id)
                    ? <div className="sbg inc" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Icon name="check" size={9} color="var(--green)"/>OK
                      </div>
                    : <div className={`sbg ${getType(svc)}`}>
                        {getType(svc) === 'included' ? 'Inclus' : getType(svc) === 'req' ? 'Demande' : 'Payant'}
                      </div>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="mov" onClick={() => setSelected(null)}>
          <div className="msh" onClick={e => e.stopPropagation()}>
            <div className="mhnd"/>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(196,164,107,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name={ICON_MAP[selected.service?.category] || 'sparkles'} size={26} color="var(--gold-dk)" strokeWidth={1.3}/>
            </div>
            <div className="mtit">{selected.service?.name_fr}</div>
            <div className="mpr">{getPrice(selected)}</div>
            <div className="mds">{selected.service?.description_fr}</div>
            {done.includes(selected.id)
              ? <div style={{ textAlign: 'center', padding: 14, color: 'var(--green)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="check" size={15} color="var(--green)"/> Demande envoyee
                </div>
              : <button className="btn-p" onClick={() => handleOrder(selected)} disabled={creating}>
                  <Icon name="concierge" size={14} color="#fff"/>
                  {creating ? 'Envoi...' : 'Demander ce service'}
                </button>
            }
            <button className="btn-o" style={{ marginTop: 10 }} onClick={() => setSelected(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
