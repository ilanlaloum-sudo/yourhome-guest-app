import { useState } from 'react'
import { signInWithMagicLink, signInWithPhone, verifyOtp } from '../../lib/auth'
import Icon from '../ui/Icon'

export default function LoginScreen() {
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

      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text)', marginBottom: 6 }}>Your Home</div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 300 }}>Conciergerie</div>
      </div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>
          Bienvenue
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, textAlign: 'center', marginBottom: 36, lineHeight: 1.6 }}>
          Connectez-vous pour acceder a votre sejour
        </p>

        {step === 'input' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <button
                onClick={() => setMode('email')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid', borderColor: mode === 'email' ? 'var(--gold)' : 'var(--bd)', background: mode === 'email' ? 'rgba(196,164,107,.08)' : 'transparent', color: mode === 'email' ? 'var(--gold-dk)' : 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}
              >
                Email
              </button>
              <button
                onClick={() => setMode('phone')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid', borderColor: mode === 'phone' ? 'var(--gold)' : 'var(--bd)', background: mode === 'phone' ? 'rgba(196,164,107,.08)' : 'transparent', color: mode === 'phone' ? 'var(--gold-dk)' : 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}
              >
                Telephone
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
                  {loading ? 'Envoi...' : 'Recevoir le lien'}
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
                  {loading ? 'Envoi...' : 'Recevoir le code'}
                </button>
              </>
            )}
          </>
        )}

        {step === 'otp' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'center', marginBottom: 24, fontWeight: 300 }}>
              Code envoye au {phone}
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
              {loading ? 'Verification...' : 'Confirmer'}
            </button>
            <button className="btn-o" style={{ marginTop: 10 }} onClick={() => setStep('input')}>
              Retour
            </button>
          </>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(61,122,86,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="check" size={24} color="var(--green)"/>
            </div>
            <p style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 300, lineHeight: 1.6 }}>
              Lien envoye a <strong>{email}</strong>.<br/>
              Verifiez votre boite mail.
            </p>
            <button className="btn-o" style={{ marginTop: 24 }} onClick={() => setStep('input')}>
              Retour
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
