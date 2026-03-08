import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from './context/AppContext'
import { TwixtorTab } from './components/tabs/TwixtorTab'
import { AnchorPointTab } from './components/tabs/AnchorPointTab'
import { RenderSettingsTab } from './components/tabs/RenderSettingsTab'
import { SetupTab } from './components/tabs/SetupTab'
import { AboutTab } from './components/tabs/AboutTab'
import { HomeTab } from './components/tabs/HomeTab'
import { CustomSetupModal } from './components/modals/CustomSetupModal'
import styles from './App.module.css'

export type TabId = 'home' | 'twixtor' | 'anchor' | 'render' | 'setup' | 'about'

const TAB_LABELS: Record<Exclude<TabId, 'home'>, { label: string; icon: string }> = {
  twixtor: { label: 'Twixtor', icon: 'speed' },
  anchor: { label: 'Anchor Point', icon: 'anchor' },
  render: { label: 'Render', icon: 'movie' },
  setup: { label: 'Setup', icon: 'build' },
  about: { label: 'About', icon: 'info' },
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasScrollbar, setHasScrollbar] = useState(false)
  const tabContentRef = useRef<HTMLDivElement>(null)
  const { setFlyoutMenu, addEventListener } = useApp()

  // Initialize flyout menu
  useEffect(() => {
    const extensionVersion = `v${__APP_VERSION__}`
    const flyoutXML = `
      <Menu>
        <MenuItem Id="separator" Label="---" Enabled="false"/>
        <MenuItem Id="refreshPanel" Label="Refresh dony Tools ${extensionVersion}" Enabled="true" Checked="false"/>
        <MenuItem Id="separator" Label="---" Enabled="false"/>
        <MenuItem Id="documentationLink" Label="Open Documentation" Enabled="true" Checked="false"/>
      </Menu>
    `
    setFlyoutMenu(flyoutXML)

    const handleFlyoutClick = (event: CSEvent) => {
      const data = event.data as unknown as { menuId: string }
      if (data.menuId === 'refreshPanel') {
        location.reload()
      } else if (data.menuId === 'documentationLink') {
        try {
          const cs = new CSInterface()
          cs.openURLInDefaultBrowser('https://toolsbydonyaep.vercel.app/extension/dony-tools')
        } catch {
          window.open('https://toolsbydonyaep.vercel.app/extension/dony-tools', '_blank')
        }
      }
    }

    addEventListener('com.adobe.csxs.events.flyoutMenuClicked', handleFlyoutClick)
  }, [setFlyoutMenu, addEventListener])

  // Check scrollbar presence
  const checkScrollbar = useCallback(() => {
    const el = tabContentRef.current
    if (el) {
      setHasScrollbar(el.scrollHeight > el.clientHeight)
    }
  }, [])

  useEffect(() => {
    checkScrollbar()
    window.addEventListener('resize', checkScrollbar)
    return () => window.removeEventListener('resize', checkScrollbar)
  }, [checkScrollbar])

  // Re-check scrollbar when tab changes
  useEffect(() => {
    setTimeout(checkScrollbar, 50)
  }, [activeTab, checkScrollbar])

  const goHome = useCallback(() => setActiveTab('home'), [])

  return (
    <div className={styles.content}>
      {activeTab !== 'home' && (
        <div className={styles.backBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={goHome}
            aria-label="Back to Home"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className={styles.backBarDivider} />
          <div className={styles.backBarInfo}>
            <span className={`material-symbols-outlined ${styles.backBarIcon}`}>
              {TAB_LABELS[activeTab as Exclude<TabId, 'home'>].icon}
            </span>
            <span className={styles.backBarLabel}>
              {TAB_LABELS[activeTab as Exclude<TabId, 'home'>].label}
            </span>
          </div>
        </div>
      )}

      <div
        ref={tabContentRef}
        className={`${styles.tabContent}${hasScrollbar ? ` ${styles.hasScrollbar}` : ''}${activeTab !== 'home' ? ` ${styles.withBackBar}` : ''}`}
      >
        {activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
        {activeTab === 'twixtor' && <TwixtorTab />}
        {activeTab === 'anchor' && <AnchorPointTab />}
        {activeTab === 'render' && <RenderSettingsTab />}
        {activeTab === 'setup' && <SetupTab onOpenCustomSetup={() => setIsModalOpen(true)} />}
        {activeTab === 'about' && <AboutTab />}
      </div>

      {isModalOpen && (
        <CustomSetupModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
