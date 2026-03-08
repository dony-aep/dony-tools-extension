import { useState, useEffect, useCallback } from 'react'
import { Button, Checkbox } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import { Dropdown } from '../../ui/Dropdown'
import styles from './RenderSettingsTab.module.css'

export function RenderSettingsTab() {
  const [outputModules, setOutputModules] = useState<string[]>(['Select Output Module...'])
  const [selectedModule, setSelectedModule] = useState('Select Output Module...')
  const [autoRender, setAutoRender] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { evalScript } = useApp()

  // Load output modules on mount
  useEffect(() => {
    const loadModules = async () => {
      const result = await evalScript('loadOutputModules()')
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
  }, [evalScript])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const result = await evalScript('getOutputModules()')
    try {
      const modules: string[] = JSON.parse(result)
      setOutputModules(modules)
      setSelectedModule('Select Output Module...')
    } catch (e) {
      console.error('Error parsing output modules:', e)
    }
    setTimeout(() => setIsRefreshing(false), 800)
  }, [evalScript])

  const handleAddToRenderQueue = useCallback(async () => {
    if (selectedModule === 'Select Output Module...') {
      await evalScript('alert("Please select an output module first.")')
      return
    }
    const result = await evalScript(
      `addToRenderQueue("${selectedModule}", ${autoRender})`,
    )
    console.log('Add to render queue result:', result)
  }, [selectedModule, autoRender, evalScript])

  const handleShowLocation = useCallback(async () => {
    const result = await evalScript('showSettingsLocation()')
    console.log('Show settings location result:', result)
  }, [evalScript])

  const moduleOptions = outputModules.map((m) => ({ label: m, value: m }))

  return (
    <div className={styles.tab} id="render">
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Output Module</h3>
        <div className={styles.outputGroup}>
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
          <span title="Refresh output modules list">
            <Button
              className="icon-btn"
              onPress={handleRefresh}
              aria-label="Refresh the list of available output modules"
            >
              <span
                className={`material-symbols-outlined${isRefreshing ? ` ${styles.rotating}` : ''}`}
                style={{ fontSize: 18 }}
              >refresh</span>
            </Button>
          </span>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Render Queue</h3>
        <div className={styles.controls}>
          <span title="Start rendering automatically after adding to queue">
            <Checkbox
              className={styles.checkbox}
              isSelected={autoRender}
              onChange={setAutoRender}
            >
              <div className={styles.checkboxBox} />
              Auto Render
            </Checkbox>
          </span>
          <span title="Add active composition to the render queue with selected output module">
            <Button
              className="primary-btn"
              onPress={handleAddToRenderQueue}
            >
              Add to Render Queue
            </Button>
          </span>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Settings</h3>
        <span title="Open output module settings folder in file explorer">
          <Button style={{ width: '100%' }} onPress={handleShowLocation}>
            Show Settings Location
          </Button>
        </span>
      </div>
    </div>
  )
}
