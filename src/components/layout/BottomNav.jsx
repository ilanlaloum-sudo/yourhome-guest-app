import Icon from '../ui/Icon'

const tabs = [
  { i: 'home',          fr: 'Accueil',     en: 'Home' },
  { i: 'calendar',      fr: 'Séjour',      en: 'Stay' },
  { i: 'building',      fr: 'Logement',    en: 'Property' },
  { i: 'concierge',     fr: 'Services',    en: 'Services' },
  { i: 'messageCircle', fr: 'Assistant',   en: 'Assistant' },
  { i: 'history',       fr: 'Historique',  en: 'History' },
]

export default function BottomNav({ activeTab, onNavigate, lang = 'fr' }) {
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
          <div className="nilbl">{lang === 'fr' ? t.fr : t.en}</div>
        </div>
      ))}
    </nav>
  )
}
