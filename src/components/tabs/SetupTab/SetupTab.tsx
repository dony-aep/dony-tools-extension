import { useCallback } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import styles from './SetupTab.module.css'

// Dimensions mirror createDefaultSetup() in public/jsx/hostscript.jsx —
// every preset builds 3 comps at 30 fps, 1 minute long.
const PRESETS: { ratio: string; spec: string; full: string }[] = [
  { ratio: '16:9', spec: '1920×1080', full: '1920×1080 · 30 fps · 1 min' },
  { ratio: '1:1', spec: '1080×1080', full: '1080×1080 · 30 fps · 1 min' },
  { ratio: '4:3', spec: '1600×1080', full: '1600×1080 · 30 fps · 1 min' },
]

interface SetupTabProps {
  onOpenCustomSetup: () => void
}

export function SetupTab({ onOpenCustomSetup }: SetupTabProps) {
  const { evalHostScript } = useApp()

  const handleCreate = useCallback(
    async (aspectRatio: string) => {
      const result = await evalHostScript(`createDefaultSetup("${aspectRatio}")`)
      console.log(`Create ${aspectRatio} setup result:`, result)
    },
    [evalHostScript],
  )

  const handleShowPresetsLocation = useCallback(async () => {
    const result = await evalHostScript('showPresetsLocation()')
    console.log('Show presets location result:', result)
  }, [evalHostScript])

  return (
    <div className={styles.tab}>
      <Section
        title="Quick setup"
        description="Folders plus three 1-minute comps at 30 fps."
      >
        <div className={styles.presets}>
          {PRESETS.map((preset) => (
            <AriaButton
              key={preset.ratio}
              className={styles.preset}
              onPress={() => handleCreate(preset.ratio)}
              aria-label={`Create a ${preset.ratio} project — ${preset.full}`}
            >
              <span className={styles.presetRatio}>{preset.ratio}</span>
              <span className={styles.presetSpec}>{preset.spec}</span>
            </AriaButton>
          ))}
        </div>
      </Section>

      <Section title="Custom setup">
        <div className={styles.customRow}>
          <Button
            variant="key"
            block
            onPress={onOpenCustomSetup}
          >
            Custom setup
          </Button>
          <Button
            iconOnly
            onPress={handleShowPresetsLocation}
            aria-label="Show the location of saved presets"
          >
            <Icon name="folder_open" size={18} />
          </Button>
        </div>
      </Section>
    </div>
  )
}
