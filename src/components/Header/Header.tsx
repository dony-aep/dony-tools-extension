import { useCallback } from 'react'
import type { TabId } from '../../App'
import styles from './Header.module.css'

const TAB_OPTIONS: { value: TabId; label: string; icon: string; title: string }[] = [
  { value: 'home', label: 'Home', icon: 'home', title: 'Quick access dashboard' },
  { value: 'twixtor', label: 'Twixtor', icon: 'speed', title: 'Twixtor Pro retiming controls' },
  { value: 'anchor', label: 'Anchor', icon: 'anchor', title: 'Anchor point positioning' },
  { value: 'render', label: 'Render', icon: 'movie', title: 'Render queue & output modules' },
  { value: 'setup', label: 'Setup', icon: 'build', title: 'Project setup presets' },
  { value: 'about', label: 'About', icon: 'info', title: 'About dony Tools' },
]

interface HeaderProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const handleTabClick = useCallback(
    (tab: TabId) => {
      onTabChange(tab)
    },
    [onTabChange],
  )

  return (
    <header className={styles.header}>
      <nav className={styles.tabBar} role="tablist" aria-label="Main navigation">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            className={`${styles.tabBtn}${activeTab === tab.value ? ` ${styles.active}` : ''}`}
            onClick={() => handleTabClick(tab.value)}
            aria-selected={activeTab === tab.value}
            aria-label={tab.label}
            title={tab.title}
          >
            <span className={`material-symbols-outlined ${styles.tabIcon}`}>
              {tab.icon}
            </span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}
