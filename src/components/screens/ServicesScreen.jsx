import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { useServices, useCreateServiceRequest } from '../../hooks/useServices'
import { fixAccents } from '../../lib/frenchAccents'

const SERVICE_ICONS = {
  'Transfert aéroport': 'plane', 'Transfert aeroport': 'plane',
  'Courses avant arrivée': 'shoppingBag', 'Courses avant arrivee': 'shoppingBag',
  'Ménage additionnel': 'broom', 'Menage additionnel': 'broom',
  'Réservation restaurant': 'utensils', 'Reservation restaurant': 'utensils',
  'Massage à domicile': 'heart', 'Massage a domicile': 'heart',
  'Location véhicule': 'car', 'Location vehicule': 'car',
  'Chauffeur privé': 'taxi', 'Chauffeur prive': 'taxi',
  'Occasion spéciale': 'gift', 'Occasion speciale': 'gift',
  'Late check-out': 'moon',
}

const POPULAR = ['Transfert aéroport', 'Transfert aeroport', 'Massage à domicile', 'Massage a domicile', 'Réservation restaurant', 'Reservation restaurant']

const CATEGORY_ICONS = {
  'Arrivée': 'plane', 'Confort': 'sparkles', 'Famille': 'baby',
  'Expériences': 'flower', 'Mobilité': 'car',
}

const T = {
  title:      { fr: 'Services',   en: 'Services' },
  subtitle:   { fr: 'Un accompagnement premium à chaque étape', en: 'Premium support at every step' },
  all:        { fr: 'Tous',       en: 'All' },
  noService:  { fr: 'Aucun service disponible pour ce bien.', en: 'No services available for this property.' },
  included:   { fr: 'Inclus',     en: 'Included' },
  onRequest:  { fr: 'Sur demande', en: 'On request' },
  request:    { fr: 'Demande',    en: 'Request' },
  paid:       { fr: 'Payant',     en: 'Paid' },
  popular:    { fr: 'Populaire',  en: 'Popular' },
  sent:       { fr: 'Demande envoyée', en: 'Request sent' },
  orderBtn:   { fr: 'Demander ce service', en: 'Request this service' },
  sendingBtn: { fr: 'Envoi...',   en: 'Sending...' },
  close:      { fr: 'Fermer',    en: 'Close' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

const fmtPrice = (svc, lang) => {
  const price = svc.custom_price_eur || svc.service?.base_price_eur
  const type = svc.service?.pricing_type
  if (type === 'free') return t('included', lang)
  if (type === 'on_request') return t('onRequest', lang)
  if (price) return price + ' €'
  return t('onRequest', lang)
}

export default function ServicesScreen({ reservation, lang = 'fr', onToggleLang, session, onSignOut }) {
  const [cat, setCat] = useState('all')
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState([])
  const { services, loading } = useServices(reservation?.property_id)
  const { createRequest, loading: creating } = useCreateServiceRequest()

  const cats = ['all', ...Array.from(new Set(services.map(s => s.service?.category || 'Autre')))]
  const filtered = cat === 'all' ? services : services.filter(s => (s.service?.category || 'Autre') === cat)

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

  const getType = (svc) => {
    const type = svc.service?.pricing_type
    if (type === 'free') return 'included'
    if (type === 'on_request') return 'req'
    return 'paid'
  }

  const getName = (svc) => {
    const raw = lang === 'fr' ? svc.service?.name_fr : (svc.service?.name_en || svc.service?.name_fr)
    return fixAccents(raw)
  }

  const getDesc = (svc) => {
    const raw = lang === 'fr' ? svc.service?.description_fr : (svc.service?.description_en || svc.service?.description_fr)
    return fixAccents(raw)
  }

  const isPopular = (svc) => POPULAR.includes(svc.service?.name_fr)

  const getIcon = (svc) => {
    return SERVICE_ICONS[svc.service?.name_fr] || CATEGORY_ICONS[svc.service?.category] || 'sparkles'
  }

  if (loading) {
    return (
      <div className="page">
        <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
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
      <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
      <div className="ptitle">{t('title', lang)}</div>
      <div className="psub">{t('subtitle', lang)}</div>

      <div className="ctabs">
        {cats.map(c => (
          <button key={c} className={`ctab${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
            {c === 'all' ? t('all', lang) : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px var(--px)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>
            {t('noService', lang)}
          </div>
        </div>
      ) : (
        <div className="sgrid">
          {filtered.map(svc => (
            <div key={svc.id} className="sc" onClick={() => setSelected(svc)}>
              {isPopular(svc) && <div className="pop">{t('popular', lang)}</div>}
              <div className="simg">
                <Icon name={getIcon(svc)} size={22} color="var(--gold)" strokeWidth={1.5}/>
              </div>
              <div className="sbod">
                <div className="sn">{getName(svc)}</div>
                <div className="sd">{getDesc(svc)}</div>
                <div className="sf">
                  <div className="sp">{fmtPrice(svc, lang)}</div>
                  {done.includes(svc.id)
                    ? <div className="sbg inc" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Icon name="check" size={9} color="var(--green)"/>OK
                      </div>
                    : <div className={`sbg ${getType(svc)}`}>
                        {getType(svc) === 'included' ? t('included', lang) : getType(svc) === 'req' ? t('request', lang) : t('paid', lang)}
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
              <Icon name={getIcon(selected)} size={24} color="var(--gold-dk)" strokeWidth={1.5}/>
            </div>
            <div className="mtit">{getName(selected)}</div>
            <div className="mpr">{fmtPrice(selected, lang)}</div>
            <div className="mds">{getDesc(selected)}</div>
            {done.includes(selected.id)
              ? <div style={{ textAlign: 'center', padding: 14, color: 'var(--green)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="check" size={15} color="var(--green)"/> {t('sent', lang)}
                </div>
              : <button className="btn-p" onClick={() => handleOrder(selected)} disabled={creating}>
                  <Icon name="concierge" size={14} color="#fff"/>
                  {creating ? t('sendingBtn', lang) : t('orderBtn', lang)}
                </button>
            }
            <button className="btn-o" style={{ marginTop: 10 }} onClick={() => setSelected(null)}>
              {t('close', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
