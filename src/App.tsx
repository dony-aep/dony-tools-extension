import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from './context/AppContext'
import { useHostTheme } from './hooks/useHostTheme'
import { TwixtorTab } from './components/tabs/TwixtorTab'
import { AnchorPointTab } from './components/tabs/AnchorPointTab'
import { RenderSettingsTab } from './components/tabs/RenderSettingsTab'
import { SetupTab } from './components/tabs/SetupTab'
import { AboutTab } from './components/tabs/AboutTab'
import { CustomSetupModal } from './components/modals/CustomSetupModal'
import { Icon } from './components/ui/Icon'
import styles from './App.module.css'

export type TabId = 'twixtor' | 'anchor' | 'render' | 'setup' | 'about'

interface RailItem {
  id: TabId
  label: string
  icon: string
  title: string
}

/* The four tools sit at the top of the rail; About is meta and sits at the
   foot with the version, separated by a rule. */
const TOOLS: RailItem[] = [
  { id: 'twixtor', label: 'Twixtor', icon: 'speed', title: 'Twixtor Pro retiming controls' },
  { id: 'anchor', label: 'Anchor Point', icon: 'anchor', title: 'Anchor point positioning' },
  { id: 'render', label: 'Render', icon: 'movie', title: 'Render queue & output modules' },
  { id: 'setup', label: 'Setup', icon: 'build', title: 'Project setup presets' },
]

const META: RailItem[] = [
  { id: 'about', label: 'About', icon: 'info', title: 'About dony Tools' },
]

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('twixtor')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasScrollbar, setHasScrollbar] = useState(false)
  const tabContentRef = useRef<HTMLDivElement>(null)
  const { version, setFlyoutMenu, addEventListener, removeEventListener } = useApp()

  // Adopt After Effects' UI greys and follow its brightness slider.
  useHostTheme()

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

    return () => {
      removeEventListener('com.adobe.csxs.events.flyoutMenuClicked', handleFlyoutClick)
    }
  }, [setFlyoutMenu, addEventListener, removeEventListener])

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
    const timeoutId = window.setTimeout(checkScrollbar, 50)
    return () => window.clearTimeout(timeoutId)
  }, [activeTab, checkScrollbar])

  const openTab = [...TOOLS, ...META].find((t) => t.id === activeTab) ?? TOOLS[0]

  // Below the wide step the label is hidden, so the button's name comes from
  // aria-label; above it, both carry the same words.
  const renderRailButton = (item: RailItem) => (
    <button
      key={item.id}
      type="button"
      className={`${styles.railBtn}${activeTab === item.id ? ` ${styles.railBtnActive}` : ''}`}
      onClick={() => setActiveTab(item.id)}
      aria-current={activeTab === item.id ? 'true' : undefined}
      aria-label={item.label}
      title={item.title}
    >
      <Icon name={item.icon} size={19} />
      <span className={styles.railLabel}>{item.label}</span>
    </button>
  )

  return (
    <div className={styles.shell}>
      <nav className={styles.rail} aria-label="Tools">
        <div className={styles.railGroup}>{TOOLS.map(renderRailButton)}</div>
        <div className={styles.railMeta}>
          {META.map(renderRailButton)}
          <span className={styles.railVersion}>v{version}</span>
        </div>
      </nav>

      <div className={styles.column}>
        <header key={activeTab} className={styles.title}>
          <Icon name={openTab.icon} size={16} className={styles.titleIcon} />
          <h1 className={styles.titleText}>{openTab.label}</h1>
        </header>

        <div
          ref={tabContentRef}
          className={`${styles.content}${hasScrollbar ? ` ${styles.hasScrollbar}` : ''}`}
        >
          {activeTab === 'twixtor' && <TwixtorTab />}
          {activeTab === 'anchor' && <AnchorPointTab />}
          {activeTab === 'render' && <RenderSettingsTab />}
          {activeTab === 'setup' && <SetupTab onOpenCustomSetup={() => setIsModalOpen(true)} />}
          {activeTab === 'about' && <AboutTab />}
        </div>
      </div>

      {isModalOpen && (
        <CustomSetupModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
