import Icon from '../ui/Icon'

const tabs = [
  { i: 'home',          l: 'Accueil' },
  { i: 'calendar',      l: 'Sejour' },
  { i: 'building',      l: 'Logement' },
  { i: 'concierge',     l: 'Services' },
  { i: 'messageCircle', l: 'Assistant' },
  { i: 'history',       l: 'Historique' },
]

export default function BottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="bnav">
      {tabs.map((t, i) => (
        <div
          key={i}
          className={`ni${activeTab === i ? ' on' : ''}`}
          onClick={() => onNavigate(i)}
        >
          {activeTab === i && <div className="nibar"/>}
          <Icon
            name={t.i}
            size={20}
            color={activeTab === i ? 'var(--gold-dk)' : 'var(--muted)'}
            strokeWidth={activeTab === i ? 2 : 1.5}
          />
          <div className="nilbl">{t.l}</div>
        </div>
      ))}
    </nav>
  )
}
