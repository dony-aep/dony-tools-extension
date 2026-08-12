import { useCallback } from 'react'
import { useApp } from '../../../context/AppContext'
import { useUpdateChecker } from '../../../hooks/useUpdateChecker'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import styles from './AboutTab.module.css'

const FEATURES: { icon: string; label: string }[] = [
  { icon: 'speed', label: 'Twixtor Pro automation' },
  { icon: 'anchor', label: 'Advanced anchor point control' },
  { icon: 'movie', label: 'Render settings management' },
  { icon: 'build', label: 'Project setup presets' },
]

export function AboutTab() {
  const { evalHostScript, openURL, version } = useApp()
  const update = useUpdateChecker(version)

  const handleVisitWebsite = useCallback(async () => {
    const result = await evalHostScript('visitWebsite()')
    console.log('Visit website result:', result)
  }, [evalHostScript])

  const handleDownloadUpdate = useCallback(() => {
    if (update.releaseUrl) openURL(update.releaseUrl)
  }, [openURL, update.releaseUrl])

  return (
    <div className={styles.tab}>
      <div className={styles.hero}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>dony Tools</h1>
          <span className={styles.version}>v{version}</span>
        </div>
        <p className={styles.blurb}>
          A toolkit for Adobe After Effects: retiming, anchor points, render queue and
          project setup, without leaving the panel.
        </p>
        {update.hasUpdate && update.latestVersion && (
          <div className={styles.update}>
            <Icon name="upgrade" size={20} className={styles.updateIcon} />
            <span className={styles.updateText}>v{update.latestVersion} available</span>
            <Button variant="key" onPress={handleDownloadUpdate}>
              Download
            </Button>
          </div>
        )}
      </div>

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Features</h2>
        <ul className={styles.features}>
          {FEATURES.map((feature) => (
            <li key={feature.icon}>
              <Icon name={feature.icon} size={18} className={styles.featureIcon} />
              {feature.label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Links</h2>
        <Button
          variant="key"
          block
          onPress={handleVisitWebsite}
        >
          Visit website
          <Icon name="open_in_new" size={16} />
        </Button>
      </div>
    </div>
  )
}
