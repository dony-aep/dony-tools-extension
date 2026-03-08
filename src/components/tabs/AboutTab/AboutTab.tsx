import { useCallback } from 'react'
import { Button } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import { useUpdateChecker } from '../../../hooks/useUpdateChecker'
import styles from './AboutTab.module.css'

export function AboutTab() {
  const { evalScript, openURL, version } = useApp()
  const update = useUpdateChecker(version)

  const handleVisitWebsite = useCallback(async () => {
    const result = await evalScript('visitWebsite()')
    console.log('Visit website result:', result)
  }, [evalScript])

  const handleDownloadUpdate = useCallback(() => {
    if (update.releaseUrl) openURL(update.releaseUrl)
  }, [openURL, update.releaseUrl])

  return (
    <div className={styles.tab} id="about">
      <div className={`${styles.panel} ${styles.aboutHero}`}>
        <div className={styles.titleRow}>
          <h3>dony Tools</h3>
          <span className={styles.versionBadge}>v{version}</span>
        </div>
        <p className={styles.panelDescription}>
          A comprehensive toolkit for Adobe After Effects providing utilities to enhance
          your workflow and boost productivity.
        </p>
        {update.hasUpdate && update.latestVersion && (
          <div className={styles.updateBanner}>
            <span className={`material-symbols-outlined ${styles.updateIcon}`}>upgrade</span>
            <span className={styles.updateText}>
              v{update.latestVersion} available
            </span>
            <Button className={styles.updateBtn} onPress={handleDownloadUpdate}>
              Download
            </Button>
          </div>
        )}
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Features</h3>
        <ul className={styles.featuresList}>
          <li>
            <span className={`material-symbols-outlined ${styles.featureIcon}`}>speed</span>
            Twixtor Pro automation
          </li>
          <li>
            <span className={`material-symbols-outlined ${styles.featureIcon}`}>anchor</span>
            Advanced anchor point control
          </li>
          <li>
            <span className={`material-symbols-outlined ${styles.featureIcon}`}>movie</span>
            Render settings management
          </li>
          <li>
            <span className={`material-symbols-outlined ${styles.featureIcon}`}>build</span>
            Project setup presets
          </li>
        </ul>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Links</h3>
        <span title="Open the dony Tools website in your browser">
          <Button className={`primary-btn ${styles.websiteBtn}`} onPress={handleVisitWebsite}>
            <span>Visit Website</span>
            <span className="material-symbols-outlined btn-icon">open_in_new</span>
          </Button>
        </span>
      </div>
    </div>
  )
}
