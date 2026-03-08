import { useCallback } from 'react'
import { Button } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import styles from './SetupTab.module.css'

interface SetupTabProps {
  onOpenCustomSetup: () => void
}

export function SetupTab({ onOpenCustomSetup }: SetupTabProps) {
  const { evalScript } = useApp()

  const handleCreate = useCallback(
    async (aspectRatio: string) => {
      const result = await evalScript(`createDefaultSetup("${aspectRatio}")`)
      console.log(`Create ${aspectRatio} setup result:`, result)
    },
    [evalScript],
  )

  const handleShowPresetsLocation = useCallback(async () => {
    const result = await evalScript('showPresetsLocation()')
    console.log('Show presets location result:', result)
  }, [evalScript])

  return (
    <div className={styles.tab} id="setup">
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Quick Setup</h3>
        <p className={styles.panelDescription}>Create a default project setup with common presets:</p>
        <div className={styles.presetButtons}>
          <Button onPress={() => handleCreate('16:9')} aria-label="Create 1920x1080 project setup">
            <span title="1920×1080 · 30 fps · 1 min">16:9</span>
          </Button>
          <Button onPress={() => handleCreate('1:1')} aria-label="Create 1080x1080 project setup">
            <span title="1080×1080 · 30 fps · 1 min">1:1</span>
          </Button>
          <Button onPress={() => handleCreate('4:3')} aria-label="Create 1600x1080 project setup">
            <span title="1440×1080 · 30 fps · 1 min">4:3</span>
          </Button>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Custom Setup</h3>
        <p className={styles.panelDescription}>Create a fully customized project setup:</p>
        <div className={styles.controls}>
          <span title="Open the custom setup dialog">
            <Button className="primary-btn" onPress={onOpenCustomSetup}>
              Custom Setup
            </Button>
          </span>
          <span title="Open presets folder in file explorer">
            <Button
              className="icon-btn"
              onPress={handleShowPresetsLocation}
              aria-label="Show the location of saved presets"
            >
              <span className="material-symbols-outlined btn-icon">folder_open</span>
            </Button>
          </span>
        </div>
      </div>
    </div>
  )
}
