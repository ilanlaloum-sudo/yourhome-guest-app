import { useState } from 'react'
import Icon from '../ui/Icon'
import Header from '../layout/Header'
import { useLoyaltyProfile, useRewards } from '../../hooks/useLoyalty'
import { useReview, useSubmitReview } from '../../hooks/useReview'
import { usePastReservations } from '../../hooks/useReservation'

const fmtShort = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

const STATUS_LABELS = {
  new:       { fr: 'Membre',          en: 'Member' },
  returning: { fr: 'Client fidèle',   en: 'Returning guest' },
  preferred: { fr: 'Preferred Guest', en: 'Preferred Guest' },
  vip:       { fr: 'VIP',             en: 'VIP' },
}

const T = {
  title:      { fr: 'Après séjour',   en: 'Post-stay' },
  hello:      { fr: 'Bonjour,',       en: 'Hello,' },
  dearGuest:  { fr: 'cher client',    en: 'dear guest' },
  stays:      { fr: 'séjour',         en: 'stay' },
  staysPlural:{ fr: 'séjours',        en: 'stays' },
  member:     { fr: 'Membre Your Home', en: 'Your Home Member' },
  wallet:     { fr: 'de cagnotte',    en: 'wallet balance' },
  currentStay:{ fr: 'Séjour actuel',  en: 'Current stay' },
  yourProp:   { fr: 'Votre logement', en: 'Your property' },
  thankReview:{ fr: 'Merci pour votre avis !', en: 'Thank you for your review!' },
  leaveReview:{ fr: 'Laisser un avis', en: 'Leave a review' },
  pastStays:  { fr: 'Séjours passés', en: 'Past stays' },
  propYH:     { fr: 'Logement Your Home', en: 'Your Home Property' },
  viewProp:   { fr: 'Voir le logement', en: 'View property' },
  rebook:     { fr: 'Réserver',       en: 'Rebook' },
  historyEmpty:{ fr: 'Votre historique de séjours apparaîtra ici.', en: 'Your stay history will appear here.' },
  yourReview: { fr: 'Votre avis',     en: 'Your review' },
  yourPropYH: { fr: 'Votre logement Your Home', en: 'Your Your Home property' },
  shareFb:    { fr: 'Partagez votre expérience... (optionnel)', en: 'Share your experience... (optional)' },
  sendReview: { fr: 'Envoyer mon avis', en: 'Submit review' },
  sendingRev: { fr: 'Envoi...',       en: 'Sending...' },
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

      <div style={{ padding: '0 var(--px) 12px' }}>
        <div className="lcard">
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
          {profile?.total_spent_eur > 0 && (
            <div className="lwlt">
              <div className="lamt">EUR {profile.total_spent_eur}</div>
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

      {reservation && (
        <>
          <div className="slbl">{t('currentStay', lang)}</div>
          <div className="ib" style={{ margin: '0 var(--px) 12px' }}>
            <div className="ir">
              <div className="iico">
                <Icon name="building" size={15} color="var(--gold-dk)"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 400 }}>
                  {t('yourProp', lang)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, marginTop: 2 }}>
                  {fmtShort(reservation.check_in_at)} - {fmtShort(reservation.check_out_at)}
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 18px' }}>
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
        </>
      )}

      {past.length > 0 && (
        <>
          <div className="slbl">{t('pastStays', lang)}</div>
          {past.map((s, i) => (
            <div key={i} className="stcard">
              <div style={{ width: '100%', height: 140, background: 'linear-gradient(135deg, #2D2418, #1A1510)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="building" size={36} color="rgba(196,164,107,.3)" strokeWidth={1}/>
              </div>
              <div className="stbd">
                <div className="stn">{t('propYH', lang)}</div>
                <div className="stm">
                  <Icon name="mapPin" size={11} color="var(--muted)"/>
                  Dubai · {fmtShort(s.check_in_at)} - {fmtShort(s.check_out_at)}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-o" style={{ fontSize: 9, padding: '10px 8px' }}>
                    {t('viewProp', lang)}
                  </button>
                  <button className="btn-p" style={{ fontSize: 9, padding: '10px 8px' }}>
                    <Icon name="repeat" size={11} color="#fff"/> {t('rebook', lang)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
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
                {t('yourPropYH', lang)}
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
