import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useActiveReservation } from './hooks/useReservation'
import BottomNav from './components/layout/BottomNav'
import LoginScreen from './components/screens/LoginScreen'
import HomeScreen from './components/screens/HomeScreen'
import StayScreen from './components/screens/StayScreen'
import PropertyScreen from './components/screens/PropertyScreen'
import ServicesScreen from './components/screens/ServicesScreen'
import AssistantScreen from './components/screens/AssistantScreen'
import HistoryScreen from './components/screens/HistoryScreen'

export default function App() {
  const { session, loading: authLoading, signOut } = useAuth()
  const { reservation, loading: resLoading } = useActiveReservation()
  const [activeTab, setActiveTab] = useState(0)
  const [lang, setLang] = useState('fr')

  const toggleLang = () => setLang(l => l === 'fr' ? 'en' : 'fr')

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="dot" style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}/>
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginScreen lang={lang} onToggleLang={toggleLang}/>
  }

  if (resLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="dot" style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}/>
          ))}
        </div>
      </div>
    )
  }

  const commonProps = { lang, onToggleLang: toggleLang, session, onSignOut: signOut }

  const screens = [
    <HomeScreen reservation={reservation} onNavigate={setActiveTab} {...commonProps}/>,
    <StayScreen reservation={reservation} {...commonProps}/>,
    <PropertyScreen reservation={reservation} {...commonProps}/>,
    <ServicesScreen reservation={reservation} {...commonProps}/>,
    <AssistantScreen reservation={reservation} {...commonProps}/>,
    <HistoryScreen reservation={reservation} {...commonProps}/>,
  ]

  return (
    <div className="app">
      <div style={{ overflowY: 'auto', height: '100vh' }}>
        {screens[activeTab]}
      </div>
      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} lang={lang}/>
    </div>
  )
}
