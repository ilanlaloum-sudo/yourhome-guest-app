import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { useLoyaltyProfile, useRewards } from '../../hooks/useLoyalty'
import { useReview, useSubmitReview } from '../../hooks/useReview'
import { usePastReservations } from '../../hooks/useReservation'
import { usePropertyKnowledge } from '../../hooks/useProperty'

const fmtShort = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
const COVER = 'https://qscbpmqqcbjuobhwlcmw.supabase.co/storage/v1/object/public/property-images/the-opus.jpg'

const STATUS_LABELS = {
  new:       { fr: 'Membre',          en: 'Member' },
  returning: { fr: 'Client fidèle',   en: 'Returning guest' },
  preferred: { fr: 'Preferred Guest', en: 'Preferred Guest' },
  vip:       { fr: 'VIP',             en: 'VIP' },
}

const T = {
  title:      { fr: 'Votre séjour à The Opus', en: 'Your stay at The Opus' },
  hello:      { fr: 'Bonjour,',       en: 'Hello,' },
  dearGuest:  { fr: 'cher client',    en: 'dear guest' },
  stays:      { fr: 'séjour',         en: 'stay' },
  staysPlural:{ fr: 'séjours',        en: 'stays' },
  member:     { fr: 'Membre Your Home', en: 'Your Home Member' },
  wallet:     { fr: 'de cagnotte',    en: 'wallet balance' },
  currentStay:{ fr: 'Séjour actuel',  en: 'Current stay' },
  thankReview:{ fr: 'Merci pour votre avis !', en: 'Thank you for your review!' },
  leaveReview:{ fr: 'Laisser un avis', en: 'Leave a review' },
  pastStays:  { fr: 'Séjours passés', en: 'Past stays' },
  viewProp:   { fr: 'Voir le logement', en: 'View property' },
  rebook:     { fr: 'Réserver The Opus à nouveau', en: 'Rebook The Opus' },
  rebookShort:{ fr: 'Réserver',       en: 'Rebook' },
  historyEmpty:{ fr: 'Votre historique de séjours apparaîtra ici.', en: 'Your stay history will appear here.' },
  yourReview: { fr: 'Votre avis',     en: 'Your review' },
  shareFb:    { fr: 'Partagez votre expérience... (optionnel)', en: 'Share your experience... (optional)' },
  sendReview: { fr: 'Envoyer mon avis', en: 'Submit review' },
  sendingRev: { fr: 'Envoi...',       en: 'Sending...' },
  goodbye:    { fr: 'À bientôt à Dubai.', en: 'See you soon in Dubai.' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

export default function HistoryScreen({ reservation, session, lang = 'fr', onToggleLang, onSignOut }) {
  const [showReview, setShowReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')

  const { profile } = useLoyaltyProfile()
  const { rewards } = useRewards()
  const { reservations: past } = usePastReservations()
  const { review } = useReview(reservation?.id)
  const { submitReview, loading: submitting } = useSubmitReview()
  const { knowledge } = usePropertyKnowledge(reservation?.property_id)

  const propertyName = reservation?.property_name || knowledge?.find(k => k.category === 'description')?.title || 'The Opus'

  const handleSubmit = async () => {
    if (!rating) return
    try {
      await submitReview({
        reservationId: reservation?.id,
        guestId: session?.user?.id,
        propertyId: reservation?.property_id,
        overallScore: rating,
        comment,
      })
      setShowReview(false)
    } catch (err) {
      console.error(err)
    }
  }

  const statusLabel = STATUS_LABELS[profile?.status || 'new']?.[lang] || STATUS_LABELS.new[lang]
  const totalStays = profile?.total_stays || 0

  return (
    <div className="page">
      <Header lang={lang} onToggleLang={onToggleLang} session={session} onSignOut={onSignOut}/>
      <div className="ptitle">{t('title', lang)}</div>
      <div className="psub" style={{ fontStyle: 'italic' }}>{t('goodbye', lang)}</div>

      {/* Member card with property photo background */}
      <div style={{ padding: '0 var(--px) 12px' }}>
        <div className="lcard" style={{ backgroundImage: `linear-gradient(135deg, rgba(26,21,16,.92), rgba(45,36,24,.88)), url(${COVER})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="lbdg">
            <Icon name="sparkles" size={12} color="var(--gold)"/>
            {statusLabel}
          </div>
          <div className="ltit">
            {t('hello', lang)} {session?.user?.email?.split('@')[0] || t('dearGuest', lang)}
          </div>
          <div className="lsub">
            {totalStays} {totalStays > 1 ? t('staysPlural', lang) : t('stays', lang)} · {t('member', lang)}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.1)' }}>
              <div style={{ width: `${Math.min(100, (totalStays / 5) * 100)}%`, height: '100%', borderRadius: 2, background: 'var(--gold)', transition: 'width .3s' }}/>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', whiteSpace: 'nowrap' }}>{totalStays}/5</div>
          </div>
          {profile?.total_spent_eur > 0 && (
            <div className="lwlt">
              <div className="lamt">{profile.total_spent_eur} €</div>
              <div className="lunt">{t('wallet', lang)}</div>
            </div>
          )}
          {rewards.length > 0 && (
            <div className="lavs">
              {rewards.slice(0, 2).map((r, i) => (
                <div key={i} className="lav">
                  <strong>{r.reward_type}</strong>
                  {r.description_fr || ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current stay */}
      {reservation && (
        <>
          <div className="slbl">{t('currentStay', lang)}</div>
          <div className="stcard" style={{ margin: '0 var(--px) 12px' }}>
            <img src={COVER} alt="The Opus" className="stph"/>
            <div className="stbd">
              <div className="stn">{propertyName}</div>
              <div className="stm">
                <Icon name="mapPin" size={11} color="var(--muted)"/>
                Business Bay, Dubai · {fmtShort(reservation.check_in_at)} – {fmtShort(reservation.check_out_at)}
              </div>
              <div style={{ marginTop: 14 }}>
                {review ? (
                  <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icon name="check" size={14} color="var(--green)"/> {t('thankReview', lang)}
                  </div>
                ) : (
                  <button className="btn-p" onClick={() => setShowReview(true)}>
                    <Icon name="star" size={13} color="#fff"/> {t('leaveReview', lang)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Past stays */}
      {past.length > 0 && (
        <>
          <div className="slbl">{t('pastStays', lang)}</div>
          {past.map((s, i) => (
            <div key={i} className="stcard">
              <img src={COVER} alt="The Opus" className="stph"/>
              <div className="stbd">
                <div className="stn">{s.property_name || 'The Opus'}</div>
                <div className="stm">
                  <Icon name="mapPin" size={11} color="var(--muted)"/>
                  Dubai · {fmtShort(s.check_in_at)} – {fmtShort(s.check_out_at)}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-o" style={{ fontSize: 9, padding: '10px 8px' }}>
                    {t('viewProp', lang)}
                  </button>
                  <button className="btn-p" style={{ fontSize: 9, padding: '10px 8px' }}>
                    <Icon name="repeat" size={11} color="#fff"/> {t('rebookShort', lang)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Rebook CTA */}
      {reservation && (
        <div style={{ padding: '8px var(--px) 16px' }}>
          <button className="btn-p">
            <Icon name="repeat" size={13} color="#fff"/> {t('rebook', lang)}
          </button>
        </div>
      )}

      {past.length === 0 && !reservation && (
        <div style={{ padding: '40px var(--px)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>
            {t('historyEmpty', lang)}
          </div>
        </div>
      )}

      {showReview && (
        <div className="mov" onClick={() => setShowReview(false)}>
          <div className="msh" onClick={e => e.stopPropagation()}>
            <div className="mhnd"/>
            <div style={{ textAlign: 'center' }}>
              <div className="mtit">{t('yourReview', lang)}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 300 }}>
                {propertyName} · Business Bay
              </div>
              <div className="srat">
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className="sst"
                    style={{ color: n <= (hover || rating) ? '#C4A46B' : '#EDE8E0' }}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                  >
                    *
                  </span>
                ))}
              </div>
            </div>
            <textarea
              className="rtxt"
              placeholder={t('shareFb', lang)}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button className="btn-p" onClick={handleSubmit} disabled={submitting || !rating}>
              <Icon name="send" size={13} color="#fff"/>
              {submitting ? t('sendingRev', lang) : t('sendReview', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
