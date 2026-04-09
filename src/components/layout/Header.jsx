import { useState } from 'react'
import Icon from '../ui/Icon'

export default function Header({ right, lang, onToggleLang, onNavigate, session, onSignOut }) {
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      <div className="hdr">
        <div>
          <div className="hdr-brand">Your Home</div>
          <div className="hdr-sub">· Conciergerie</div>
        </div>
        <div className="hdr-r">
          {onToggleLang && (
            <button className="hbtn" onClick={onToggleLang} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
          )}
          <button className="hbtn" onClick={() => setShowNotif(true)}>
            <Icon name="bell" size={15}/>
            <span className="hnotif"/>
          </button>
          {right ?? (
            <button className="hbtn" onClick={() => setShowProfile(true)}>
              <Icon name="user" size={15}/>
            </button>
          )}
        </div>
      </div>

      {showNotif && (
        <div className="mov" onClick={() => setShowNotif(false)}>
          <div className="msh" onClick={e => e.stopPropagation()}>
            <div className="mhnd"/>
            <div className="mtit">{lang === 'fr' ? 'Notifications' : 'Notifications'}</div>
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>
              {lang === 'fr' ? 'Aucune notification pour le moment.' : 'No notifications yet.'}
            </div>
            <button className="btn-o" onClick={() => setShowNotif(false)}>
              {lang === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="mov" onClick={() => setShowProfile(false)}>
          <div className="msh" onClick={e => e.stopPropagation()}>
            <div className="mhnd"/>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(196,164,107,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="user" size={24} color="var(--gold-dk)"/>
            </div>
            <div className="mtit">{session?.user?.email?.split('@')[0] || (lang === 'fr' ? 'Invité' : 'Guest')}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 24 }}>
              {session?.user?.email || session?.user?.phone || ''}
            </div>
            {onSignOut && (
              <button className="btn-p" onClick={onSignOut} style={{ background: '#B85050' }}>
                <Icon name="logOut" size={13} color="#fff"/>
                {lang === 'fr' ? 'Déconnexion' : 'Log out'}
              </button>
            )}
            <button className="btn-o" style={{ marginTop: 10 }} onClick={() => setShowProfile(false)}>
              {lang === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
