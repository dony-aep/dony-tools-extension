import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../../context/AppContext'
import { escapeForEval } from '../../../hooks/useCSInterface'
import { Dropdown } from '../../ui/Dropdown'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Toggle } from '../../ui/Toggle'
import styles from './RenderSettingsTab.module.css'

export function RenderSettingsTab() {
  const [outputModules, setOutputModules] = useState<string[]>(['Select Output Module...'])
  const [selectedModule, setSelectedModule] = useState('Select Output Module...')
  const [autoRender, setAutoRender] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { evalHostScript, notify } = useApp()

  // Load output modules on mount
  useEffect(() => {
    const loadModules = async () => {
      const result = await evalHostScript('loadOutputModules()')
      if (result) {
        try {
          const modules: string[] = JSON.parse(result)
          setOutputModules(modules)
        } catch (e) {
          console.error('Error parsing output modules:', e)
          setOutputModules(['Select Output Module...'])
        }
      }
    }
    loadModules()
  }, [evalHostScript])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const result = await evalHostScript('getOutputModules()')
    try {
      const modules: string[] = JSON.parse(result)
      setOutputModules(modules)
      setSelectedModule('Select Output Module...')
    } catch (e) {
      console.error('Error parsing output modules:', e)
    }
    setTimeout(() => setIsRefreshing(false), 800)
  }, [evalHostScript])

  const handleAddToRenderQueue = useCallback(async () => {
    if (selectedModule === 'Select Output Module...') {
      notify('Pick an output module first.', 'warning')
      return
    }
    const result = await evalHostScript(
      `addToRenderQueue("${escapeForEval(selectedModule)}", ${autoRender})`,
    )
    console.log('Add to render queue result:', result)
  }, [selectedModule, autoRender, evalHostScript, notify])

  const handleShowLocation = useCallback(async () => {
    const result = await evalHostScript('showSettingsLocation()')
    console.log('Show settings location result:', result)
  }, [evalHostScript])

  const moduleOptions = outputModules.map((m) => ({ label: m, value: m }))

  return (
    <div className={styles.tab}>
      <Section title="Output module">
        <div className={styles.moduleRow}>
          <Dropdown
            options={moduleOptions}
            value={selectedModule}
            placeholder="Select Output Module..."
            searchPlaceholder="Search modules..."
            showSearch
            onChange={(value) => setSelectedModule(value)}
            id="outputModule-dropdown"
            aria-label="Output module template"
          />
          <Button
            variant="default"
            iconOnly
            onPress={handleRefresh}
            aria-label="Refresh the list of available output modules"
          >
            <Icon name="refresh" size={18} className={isRefreshing ? styles.rotating : undefined} />
          </Button>
        </div>
      </Section>

      <Section title="Render queue" description="Queues the active composition.">
        <div className={styles.queue}>
          <Toggle
            label="Start rendering right away"
            isSelected={autoRender}
            onChange={setAutoRender}
          />
          <Button
            variant="key"
            block
            onPress={handleAddToRenderQueue}
          >
            Add to render queue
          </Button>
        </div>
      </Section>

      <Section title="Settings">
        <Button
          block
          onPress={handleShowLocation}
        >
          <Icon name="folder_open" size={17} />
          Show settings location
        </Button>
      </Section>
    </div>
  )
}
