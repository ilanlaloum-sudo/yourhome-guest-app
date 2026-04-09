import { useState } from 'react'
import { signInWithMagicLink, signInWithPhone, verifyOtp } from '../../lib/auth'
import Icon from '../ui/Icon'

const T = {
  welcome:    { fr: 'Bienvenue',  en: 'Welcome' },
  loginSub:   { fr: 'Connectez-vous pour accéder à votre séjour', en: 'Sign in to access your stay' },
  email:      { fr: 'Email',      en: 'Email' },
  phone:      { fr: 'Téléphone',  en: 'Phone' },
  sendLink:   { fr: 'Recevoir le lien',  en: 'Send link' },
  sendCode:   { fr: 'Recevoir le code',  en: 'Send code' },
  sending:    { fr: 'Envoi...',   en: 'Sending...' },
  codeSent:   { fr: 'Code envoyé au',  en: 'Code sent to' },
  verifying:  { fr: 'Vérification...', en: 'Verifying...' },
  confirm:    { fr: 'Confirmer',  en: 'Confirm' },
  back:       { fr: 'Retour',    en: 'Back' },
  linkSent:   { fr: 'Lien envoyé à',   en: 'Link sent to' },
  checkMail:  { fr: 'Vérifiez votre boîte mail.', en: 'Check your inbox.' },
}

const t = (key, lang) => T[key]?.[lang] || T[key]?.fr || key

export default function LoginScreen({ lang = 'fr', onToggleLang }) {
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleEmailSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      await signInWithMagicLink(email)
      setStep('sent')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) return
    setLoading(true)
    setError(null)
    try {
      await signInWithPhone(phone)
      setStep('otp')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    if (!otp.trim()) return
    setLoading(true)
    setError(null)
    try {
      await verifyOtp(phone, otp)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 22px' }}>

      <div style={{ position: 'absolute', top: 16, right: 22 }}>
        {onToggleLang && (
          <button className="hbtn" onClick={onToggleLang} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        )}
      </div>

      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text)', marginBottom: 6 }}>Your Home</div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 300 }}>Conciergerie</div>
      </div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>
          {t('welcome', lang)}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, textAlign: 'center', marginBottom: 36, lineHeight: 1.6 }}>
          {t('loginSub', lang)}
        </p>

        {step === 'input' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <button
                onClick={() => setMode('email')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid', borderColor: mode === 'email' ? 'var(--gold)' : 'var(--bd)', background: mode === 'email' ? 'rgba(196,164,107,.08)' : 'transparent', color: mode === 'email' ? 'var(--gold-dk)' : 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}
              >
                {t('email', lang)}
              </button>
              <button
                onClick={() => setMode('phone')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid', borderColor: mode === 'phone' ? 'var(--gold)' : 'var(--bd)', background: mode === 'phone' ? 'rgba(196,164,107,.08)' : 'transparent', color: mode === 'phone' ? 'var(--gold-dk)' : 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}
              >
                {t('phone', lang)}
              </button>
            </div>

            {mode === 'email' ? (
              <>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  style={{ width: '100%', background: 'var(--card)', border: '1.5px solid var(--bd)', borderRadius: 14, padding: '14px 18px', fontFamily: "'Raleway', sans-serif", fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 16 }}
                />
                <button
                  className="btn-p"
                  onClick={handleEmailSubmit}
                  disabled={loading}
                >
                  <Icon name="send" size={13} color="#fff"/>
                  {loading ? t('sending', lang) : t('sendLink', lang)}
                </button>
              </>
            ) : (
              <>
                <input
                  type="tel"
                  placeholder="+33 6 00 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                  style={{ width: '100%', background: 'var(--card)', border: '1.5px solid var(--bd)', borderRadius: 14, padding: '14px 18px', fontFamily: "'Raleway', sans-serif", fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 16 }}
                />
                <button
                  className="btn-p"
                  onClick={handlePhoneSubmit}
                  disabled={loading}
                >
                  <Icon name="send" size={13} color="#fff"/>
                  {loading ? t('sending', lang) : t('sendCode', lang)}
                </button>
              </>
            )}
          </>
        )}

        {step === 'otp' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'center', marginBottom: 24, fontWeight: 300 }}>
              {t('codeSent', lang)} {phone}
            </p>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOtpSubmit()}
              style={{ width: '100%', background: 'var(--card)', border: '1.5px solid var(--bd)', borderRadius: 14, padding: '14px 18px', fontFamily: "'Courier New', monospace", fontSize: 22, color: 'var(--text)', outline: 'none', marginBottom: 16, textAlign: 'center', letterSpacing: 8 }}
            />
            <button className="btn-p" onClick={handleOtpSubmit} disabled={loading}>
              <Icon name="check" size={13} color="#fff"/>
              {loading ? t('verifying', lang) : t('confirm', lang)}
            </button>
            <button className="btn-o" style={{ marginTop: 10 }} onClick={() => setStep('input')}>
              {t('back', lang)}
            </button>
          </>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(61,122,86,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="check" size={24} color="var(--green)"/>
            </div>
            <p style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 300, lineHeight: 1.6 }}>
              {t('linkSent', lang)} <strong>{email}</strong>.<br/>
              {t('checkMail', lang)}
            </p>
            <button className="btn-o" style={{ marginTop: 24 }} onClick={() => setStep('input')}>
              {t('back', lang)}
            </button>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(184,80,80,.08)', borderRadius: 12, fontSize: 12, color: '#B85050', textAlign: 'center' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
