import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { usePropertyPhotos, usePropertyAmenities, usePropertyKnowledge, usePropertyRules } from '../../hooks/useProperty'

const AMENITY_ICONS = {
  wifi: 'wifi', tv: 'tv', kitchen: 'utensils', pool: 'swim', gym: 'trophy',
  parking: 'parking', ac: 'wind', heating: 'thermometer', washer: 'iron',
  dryer: 'wind', iron: 'iron', coffee: 'coffee', bath: 'bath',
  balcony: 'sun', safe: 'lock', camera: 'camera', default: 'sparkles',
}

const T = {
  loading:    { fr: 'Chargement...', en: 'Loading...' },
  floor:      { fr: '28e étage',     en: '28th floor' },
  amenities:  { fr: 'Équipements',   en: 'Amenities' },
  rules:      { fr: 'Règles',        en: 'Rules' },
  arrAfter:   { fr: 'Arrivée après', en: 'Arrival after' },
  depBefore:  { fr: 'Départ avant',  en: 'Departure before' },
  noSmoking:  { fr: 'Non-fumeur',    en: 'No smoking' },
  noPets:     { fr: 'Animaux non admis', en: 'No pets' },
  noParties:  { fr: 'Fêtes non autorisées', en: 'No parties' },
  nearby:     { fr: 'À proximité',   en: 'Nearby' },
  faq:        { fr: 'Questions fréquentes', en: 'FAQ' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

export default function PropertyScreen({ reservation, lang = 'fr', onToggleLang, session, onSignOut }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const propertyId = reservation?.property_id
  const { photos } = usePropertyPhotos(propertyId)
  const { amenities } = usePropertyAmenities(propertyId)
  const { knowledge } = usePropertyKnowledge(propertyId)
  const { rules } = usePropertyRules(propertyId)

  const description = knowledge?.find(k => k.category === 'description')?.content || ''
  const nearby = knowledge?.filter(k => k.category === 'nearby') || []
  const faqs = knowledge?.filter(k => k.category === 'faq') || []

  if (!reservation || !propertyId) {
    return (
      <div className="page">
        <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
        <div style={{ padding: '60px var(--px)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="dot" style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}/>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>{t('loading', lang)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>

      {/* Full-width hero with name overlay */}
      <div style={{ position: 'relative', margin: '4px var(--px) 0' }}>
        <div style={{ position: 'relative', height: 280, borderRadius: 'var(--r)', overflow: 'hidden' }}>
          {photos.length > 0 ? (
            <img src={photos[activePhoto]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2D2418, #1A1510)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="building" size={48} color="rgba(196,164,107,.3)" strokeWidth={1}/>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,5,.75) 0%, transparent 50%)' }}/>
          <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,.4)', marginBottom: 4 }}>
              The Opus
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 300, letterSpacing: 0.5 }}>
              Business Bay · {t('floor', lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal photo gallery */}
      {photos.length > 1 && (
        <div className="gscr">
          {photos.map((p, i) => (
            <img
              key={i}
              src={p.url}
              className="gthm"
              style={{ opacity: i === activePhoto ? 1 : 0.55, outline: i === activePhoto ? '2px solid var(--gold)' : 'none', outlineOffset: 2 }}
              onClick={() => setActivePhoto(i)}
            />
          ))}
        </div>
      )}

      {/* Editorial description */}
      {description && (
        <div style={{ padding: '24px var(--px) 8px' }}>
          <p style={{ fontSize: 14, color: 'var(--sub)', lineHeight: 1.8, fontWeight: 300, fontStyle: 'italic' }}>
            {description}
          </p>
        </div>
      )}

      {/* Amenities — larger chips with relevant icons */}
      {amenities.length > 0 && (
        <>
          <div className="slbl">{t('amenities', lang)}</div>
          <div className="agrid">
            {amenities.map((a, i) => {
              const iconKey = a.icon_key || Object.keys(AMENITY_ICONS).find(k => a.name?.toLowerCase().includes(k)) || 'default'
              return (
                <div key={i} className="achip">
                  <Icon name={AMENITY_ICONS[iconKey] || AMENITY_ICONS.default} size={15} color="var(--gold-dk)"/>
                  <span>{a.name}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* House rules */}
      {rules && (
        <>
          <div className="slbl">{t('rules', lang)}</div>
          <div className="ib">
            {rules.checkin_time && (
              <div className="ir">
                <div className="iico"><Icon name="clock" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">{t('arrAfter', lang)} {rules.checkin_time}</div>
              </div>
            )}
            {rules.checkout_time && (
              <div className="ir">
                <div className="iico"><Icon name="logOut" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">{t('depBefore', lang)} {rules.checkout_time}</div>
              </div>
            )}
            {rules.smoking_allowed === false && (
              <div className="ir">
                <div className="iico"><Icon name="smoke" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">{t('noSmoking', lang)}</div>
              </div>
            )}
            {rules.pets_allowed === false && (
              <div className="ir">
                <div className="iico"><Icon name="paw" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">{t('noPets', lang)}</div>
              </div>
            )}
            {rules.parties_allowed === false && (
              <div className="ir">
                <div className="iico"><Icon name="slash" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">{t('noParties', lang)}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Nearby — horizontal cards with distance badges */}
      {nearby.length > 0 && (
        <>
          <div className="slbl">{t('nearby', lang)}</div>
          <div style={{ display: 'flex', gap: 10, padding: '0 var(--px) 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {nearby.map((n, i) => (
              <div key={i} className="ncard">
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(196,164,107,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="mapPin" size={15} color="var(--gold-dk)"/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 300 }}>{n.content}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <>
          <div className="slbl">{t('faq', lang)}</div>
          <div className="ib" style={{ margin: '0 var(--px) 12px' }}>
            {faqs.map((f, i) => (
              <div key={i} className="ir">
                <div className="iico"><Icon name="messageCircle" size={15} color="var(--gold-dk)"/></div>
                <div style={{ flex: 1 }}>
                  <div className="ilbl">{f.title}</div>
                  <div className="ival">{f.content}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
