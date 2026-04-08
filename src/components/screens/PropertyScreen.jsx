import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { usePropertyPhotos, usePropertyAmenities, usePropertyKnowledge, usePropertyRules } from '../../hooks/useProperty'

export default function PropertyScreen({ reservation }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const propertyId = reservation?.property_id
  const { photos } = usePropertyPhotos(propertyId)
  const { amenities } = usePropertyAmenities(propertyId)
  const { knowledge } = usePropertyKnowledge(propertyId)
  const { rules } = usePropertyRules(propertyId)

  const description = knowledge?.find(k => k.category === 'description')?.content || ''
  const wifiEntry = knowledge?.find(k => k.category === 'wifi')
  const accessEntries = knowledge?.filter(k => ['checkin', 'checkout', 'access'].includes(k.category)) || []
  const nearby = knowledge?.filter(k => k.category === 'nearby') || []
  const faqs = knowledge?.filter(k => k.category === 'faq') || []

  if (!reservation || !propertyId) {
    return (
      <div className="page">
        <Header/>
        <div style={{ padding: '60px var(--px)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="dot" style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}/>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>Chargement du logement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Header/>

      <div style={{ padding: '4px var(--px) 0' }}>
        {photos.length > 0 ? (
          <img
            src={photos[activePhoto]?.url}
            alt=""
            style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 'var(--r)' }}
          />
        ) : (
          <div style={{ width: '100%', height: 240, borderRadius: 'var(--r)', background: 'linear-gradient(135deg, #2D2418, #1A1510)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="building" size={48} color="rgba(196,164,107,.3)" strokeWidth={1}/>
          </div>
        )}
      </div>

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

      <div style={{ padding: '18px var(--px) 4px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400 }}>
          Votre logement
        </h1>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontWeight: 300, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="mapPin" size={12} color="var(--muted)"/>
            Dubai
          </span>
        </div>
        {description && (
          <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.7, marginTop: 14, fontWeight: 300 }}>
            {description}
          </p>
        )}
      </div>

      {wifiEntry && (
        <>
          <div className="slbl">WiFi</div>
          <div className="ib" style={{ margin: '0 var(--px) 12px' }}>
            <div className="ir">
              <div className="iico"><Icon name="wifi" size={15} color="var(--gold-dk)"/></div>
              <div style={{ flex: 1 }}>
                <div className="ilbl">{wifiEntry.title}</div>
                <div className="ival" style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>{wifiEntry.content}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {accessEntries.length > 0 && (
        <>
          <div className="slbl">Acces & instructions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, padding: '0 var(--px) 12px' }}>
            {accessEntries.map((a, i) => (
              <div key={i} style={{ background: 'var(--card)', borderRadius: 'var(--r)', padding: '14px 15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Icon name={a.category === 'checkin' ? 'key' : a.category === 'checkout' ? 'logOut' : 'lock'} size={14} color="var(--gold-dk)"/>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sub)' }}>{a.title}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>{a.content}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {amenities.length > 0 && (
        <>
          <div className="slbl">Equipements</div>
          <div className="agrid">
            {amenities.map((a, i) => (
              <div key={i} className="achip">
                <Icon name={a.icon_key || 'sparkles'} size={14} color="var(--gold-dk)"/>
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {rules && (
        <>
          <div className="slbl">Regles du logement</div>
          <div className="ib">
            {rules.checkin_time && (
              <div className="ir">
                <div className="iico"><Icon name="clock" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">Arrivee apres {rules.checkin_time}</div>
              </div>
            )}
            {rules.checkout_time && (
              <div className="ir">
                <div className="iico"><Icon name="logOut" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">Depart avant {rules.checkout_time}</div>
              </div>
            )}
            {rules.smoking_allowed === false && (
              <div className="ir">
                <div className="iico"><Icon name="smoke" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">Non-fumeur</div>
              </div>
            )}
            {rules.pets_allowed === false && (
              <div className="ir">
                <div className="iico"><Icon name="paw" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">Animaux non admis</div>
              </div>
            )}
            {rules.parties_allowed === false && (
              <div className="ir">
                <div className="iico"><Icon name="slash" size={15} color="var(--gold-dk)"/></div>
                <div className="ival">Fetes non autorisees</div>
              </div>
            )}
          </div>
        </>
      )}

      {nearby.length > 0 && (
        <>
          <div className="slbl">A proximite</div>
          <div className="ib" style={{ margin: '0 var(--px) 12px' }}>
            {nearby.map((n, i) => (
              <div key={i} className="ir">
                <div className="iico"><Icon name="mapPin" size={15} color="var(--gold-dk)"/></div>
                <div className="ival" style={{ flex: 1 }}>{n.title}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {faqs.length > 0 && (
        <>
          <div className="slbl">Questions frequentes</div>
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
