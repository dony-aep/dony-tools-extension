import { useCallback } from 'react'
import type { TabId } from '../../../App'
import { useApp } from '../../../context/AppContext'
import styles from './HomeTab.module.css'

const FEATURES: { tab: TabId; icon: string; title: string; desc: string }[] = [
  {
    tab: 'twixtor',
    icon: 'speed',
    title: 'Twixtor',
    desc: 'Retiming with full control',
  },
  {
    tab: 'anchor',
    icon: 'anchor',
    title: 'Anchor Point',
    desc: 'Quick position & offset',
  },
  {
    tab: 'render',
    icon: 'movie',
    title: 'Render',
    desc: 'Output & render queue',
  },
  {
    tab: 'setup',
    icon: 'build',
    title: 'Setup',
    desc: 'Project presets',
  },
]

interface HomeTabProps {
  onNavigate: (tab: TabId) => void
}

export function HomeTab({ onNavigate }: HomeTabProps) {
  const { version } = useApp()
  const handleCardClick = useCallback(
    (tab: TabId) => {
      onNavigate(tab)
    },
    [onNavigate],
  )

  return (
    <div className={styles.tab} id="home">
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>dony Tools</h2>
        <span className={styles.versionBadge}>v{version}</span>
      </div>

      <div className={styles.cardList}>
        {FEATURES.map((f) => (
          <button
            key={f.tab}
            type="button"
            className={styles.card}
            onClick={() => handleCardClick(f.tab)}
            aria-label={`Open ${f.title}`}
          >
            <span className={`material-symbols-outlined ${styles.cardIcon}`}>
              {f.icon}
            </span>
            <div className={styles.cardText}>
              <span className={styles.cardTitle}>{f.title}</span>
              <span className={styles.cardDesc}>{f.desc}</span>
            </div>
            <span className={`material-symbols-outlined ${styles.cardArrow}`}>
              chevron_right
            </span>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.aboutLink}
          onClick={() => handleCardClick('about')}
          aria-label="About dony Tools"
        >
          <span className="material-symbols-outlined">info</span>
          <span>About</span>
        </button>
      </div>
    </div>
  )
}
