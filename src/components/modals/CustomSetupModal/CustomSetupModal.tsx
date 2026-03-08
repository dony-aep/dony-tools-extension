import { useState, useCallback, useEffect } from 'react'
import { Button, Dialog, Modal, ModalOverlay, Input, TextField, Label } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import { Dropdown } from '../../ui/Dropdown'
import styles from './CustomSetupModal.module.css'

// Resolution presets data
const RESOLUTION_PRESETS = [
  'HD • 1920x1080 • 24 fps',
  'HD • 1920x1080 • 25 fps',
  'HD • 1920x1080 • 29.97 fps',
  'UHD (4K) • 3840x2160 • 25 fps',
  'UHD (4K) • 3840x2160 • 29.97 fps',
  'UHD (8K) • 7680x4320 • 23.976 fps',
  'Social Media Portrait HD • 1080x1920 • 30 fps',
  'Social Media Landscape HD • 1920x1080 • 30 fps',
  'Social Media Portrait • 720x1280 • 30 fps',
  'Social Media Landscape • 1280x720 • 30 fps',
  'Social Media Square • 1080x1080 • 30 fps',
  'HDV/HDTV • 1280x720 • 25 fps',
  'HDV/HDTV • 1280x720 • 29.97 fps',
  'HDV • 1440x1080 (1.33) • 25 fps',
  'HDV • 1440x1080 (1.33) • 29.97 fps',
  'DVCPRO HD • 960x720 (1.33) • 23.976 fps',
  'DVCPRO HD • 960x720 (1.33) • 25 fps',
  'DVCPRO HD • 960x720 (1.33) • 29.97 fps',
  'DVCPRO HD • 1440x1080 (1.33) • 25 fps',
  'DVCPRO HD • 1440x1080 (1.33) • 29.97 fps',
  'Cineon Half • 1828x1332 • 24 fps',
  'Cineon Full • 3656x2664 • 24 fps',
  'Film (2K) • 2048x1556 • 24 fps',
  'Film (4K) • 4096x3112 • 24 fps',
]

const FPS_PRESETS = ['8', '12', '15', '23.976', '24', '25', '29.97', '30', '50', '59.94', '60', '120']

interface CustomSetupModalProps {
  onClose: () => void
}

interface CompNameEntry {
  name: string
  folder: string
}

export function CustomSetupModal({ onClose }: CustomSetupModalProps) {
  const { evalScript } = useApp()

  // Form state
  const [width, setWidth] = useState('1920')
  const [height, setHeight] = useState('1080')
  const [fps, setFps] = useState('30')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('1')
  const [seconds, setSeconds] = useState('0')
  const [numComps, setNumComps] = useState('3')
  const [folders, setFolders] = useState('Comps\nMain Comps\nMaterials\nClips\nEpisodes')
  const [presetName, setPresetName] = useState('My Preset')

  // Dropdown state
  const [selectedPreset, setSelectedPreset] = useState('')
  const [presets, setPresets] = useState<Record<string, unknown>>({})
  const [resolutionDisplay, setResolutionDisplay] = useState('Custom')
  const [fpsDisplay, setFpsDisplay] = useState('Custom')

  // Comp names section
  const [showCompNames, setShowCompNames] = useState(false)
  const [compNames, setCompNames] = useState<CompNameEntry[]>([])

  // Load button feedback
  const [loadFeedback, setLoadFeedback] = useState(false)

  // Load presets on mount
  useEffect(() => {
    loadPresets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPresets = useCallback(async () => {
    const result = await evalScript('loadPresets()')
    try {
      const parsed = JSON.parse(result || '{}')
      setPresets(parsed)
    } catch {
      setPresets({})
    }
  }, [evalScript])

  // Resolution/FPS matching
  const updateResolutionDisplay = useCallback(
    (w: string, h: string, f: string) => {
      const wNum = parseInt(w)
      const hNum = parseInt(h)
      const fNum = parseFloat(f)

      if (isNaN(wNum) || isNaN(hNum) || isNaN(fNum)) {
        setResolutionDisplay('Custom')
        return
      }

      const match = RESOLUTION_PRESETS.find((preset) => {
        const dimMatch = preset.match(/(\d+)x(\d+)/)
        const fpsMatch = preset.match(/(\d+(?:\.\d+)?)\s*fps/)
        if (dimMatch && fpsMatch) {
          return (
            parseInt(dimMatch[1]) === wNum &&
            parseInt(dimMatch[2]) === hNum &&
            Math.abs(parseFloat(fpsMatch[1]) - fNum) < 0.01
          )
        }
        return false
      })

      setResolutionDisplay(match ?? 'Custom')
    },
    [],
  )

  const updateFpsDisplay = useCallback((f: string) => {
    const fNum = parseFloat(f)
    const match = FPS_PRESETS.find((preset) => Math.abs(parseFloat(preset) - fNum) < 0.01)
    setFpsDisplay(match ?? 'Custom')
  }, [])

  // Handle resolution preset selection
  const handleResolutionSelect = useCallback(
    (value: string) => {
      setResolutionDisplay(value)
      const dimMatch = value.match(/(\d+)x(\d+)/)
      const fpsMatch = value.match(/(\d+(?:\.\d+)?)\s*fps/)
      if (dimMatch) {
        setWidth(dimMatch[1])
        setHeight(dimMatch[2])
      }
      if (fpsMatch) {
        setFps(fpsMatch[1])
        updateFpsDisplay(fpsMatch[1])
      }
    },
    [updateFpsDisplay],
  )

  // Handle FPS preset selection
  const handleFpsSelect = useCallback(
    (value: string) => {
      setFps(value)
      setFpsDisplay(value)
      updateResolutionDisplay(width, height, value)
    },
    [width, height, updateResolutionDisplay],
  )

  // Handle dimension/fps input changes
  const handleWidthChange = useCallback(
    (value: string) => {
      setWidth(value)
      updateResolutionDisplay(value, height, fps)
    },
    [height, fps, updateResolutionDisplay],
  )

  const handleHeightChange = useCallback(
    (value: string) => {
      setHeight(value)
      updateResolutionDisplay(width, value, fps)
    },
    [width, fps, updateResolutionDisplay],
  )

  const handleFpsInputChange = useCallback(
    (value: string) => {
      setFps(value)
      updateFpsDisplay(value)
      updateResolutionDisplay(width, height, value)
    },
    [width, height, updateFpsDisplay, updateResolutionDisplay],
  )

  // Preset operations
  const handleLoadPreset = useCallback(async () => {
    if (!selectedPreset || selectedPreset === 'Select Preset...') {
      await evalScript('showPresetSelectionAlert("load")')
      return
    }

    const result = await evalScript('loadPresets()')
    try {
      const allPresets = JSON.parse(result || '{}')
      const settings = allPresets[selectedPreset]
      if (!settings) return

      setWidth(String(settings.width))
      setHeight(String(settings.height))
      setFps(String(settings.fps))
      setHours(String(settings.hours || 0))
      setMinutes(String(settings.minutes || 0))
      setSeconds(String(settings.seconds || 0))
      setNumComps(String(settings.numComps))
      setFolders((settings.folders as string[]).join('\n'))
      setPresetName(selectedPreset)

      updateResolutionDisplay(String(settings.width), String(settings.height), String(settings.fps))
      updateFpsDisplay(String(settings.fps))

      // Load comp names if available
      if (settings.compNames && (settings.compNames as string[]).length > 0) {
        const entries: CompNameEntry[] = []
        for (let i = 0; i < (settings.compNames as string[]).length; i++) {
          entries.push({
            name: (settings.compNames as string[])[i] || `Comp ${i + 1}`,
            folder: (settings.compFolders as string[])?.[i] || '',
          })
        }
        setCompNames(entries)
        setShowCompNames(true)
      } else {
        setShowCompNames(false)
      }

      // Show load feedback
      setLoadFeedback(true)
      setTimeout(() => setLoadFeedback(false), 2000)
    } catch (e) {
      console.error('Error loading preset:', e)
    }
  }, [selectedPreset, evalScript, updateResolutionDisplay, updateFpsDisplay])

  const handleDeletePreset = useCallback(async () => {
    if (!selectedPreset || selectedPreset === 'Select Preset...') {
      await evalScript('showPresetSelectionAlert("delete")')
      return
    }

    const confirmResult = await evalScript(
      `confirm("Are you sure you want to delete the preset '${selectedPreset}'?")`,
    )
    if (confirmResult === 'true') {
      const deleteResult = await evalScript(`deletePreset("${selectedPreset}")`)
      if (deleteResult === 'true') {
        await loadPresets()
        setSelectedPreset('')
      }
    }
  }, [selectedPreset, evalScript, loadPresets])

  const handleSavePreset = useCallback(async () => {
    if (!presetName) {
      await evalScript('alert("Please enter a name for the preset.")')
      return
    }

    // Check if preset already exists and ask for confirmation
    if (presets[presetName]) {
      const confirmResult = await evalScript(
        `confirm("A preset named '${presetName}' already exists. Do you want to overwrite it?")`,
      )
      if (confirmResult !== 'true') return
    }

    const settings: Record<string, unknown> = {
      width: parseInt(width),
      height: parseInt(height),
      fps: parseFloat(fps),
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0,
      seconds: parseInt(seconds) || 0,
      numComps: parseInt(numComps),
      folders: folders.split('\n').filter((f) => f.trim() !== ''),
    }

    if (showCompNames && compNames.length > 0) {
      settings.compNames = compNames.map((c) => c.name || `Comp`)
      settings.compFolders = compNames.map((c) => c.folder)
    }

    const settingsJSON = JSON.stringify(settings)
    const result = await evalScript(`savePreset("${presetName}", ${settingsJSON})`)
    if (result === 'true') {
      await loadPresets()
    }
  }, [presetName, width, height, fps, hours, minutes, seconds, numComps, folders, showCompNames, compNames, evalScript, loadPresets, presets])

  const handleRefreshPresets = useCallback(async () => {
    setSelectedPreset('')
    await loadPresets()
  }, [loadPresets])

  // Custom setup creation
  const handleCreateCustomSetup = useCallback(async () => {
    const settings: Record<string, unknown> = {
      width: parseInt(width),
      height: parseInt(height),
      fps: parseFloat(fps),
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0,
      seconds: parseInt(seconds) || 0,
      numComps: parseInt(numComps),
      folders: folders.split('\n').filter((f) => f.trim() !== ''),
    }

    if (showCompNames && compNames.length > 0) {
      settings.compNames = compNames.map((c) => c.name || 'Comp')
      settings.compFolders = compNames.map((c) => c.folder)
    }

    const settingsJSON = JSON.stringify(settings)
    await evalScript(`createCustomSetup(${settingsJSON})`)
    setShowCompNames(false)
    onClose()
  }, [width, height, fps, hours, minutes, seconds, numComps, folders, showCompNames, compNames, evalScript, onClose])

  // Reset to defaults
  const handleReset = useCallback(() => {
    setWidth('1920')
    setHeight('1080')
    setFps('30')
    setHours('0')
    setMinutes('1')
    setSeconds('0')
    setNumComps('3')
    setFolders('Comps\nMain Comps\nMaterials\nClips\nEpisodes')
    setPresetName('My Preset')
    setShowCompNames(false)
    setCompNames([])
    setResolutionDisplay('Custom')
    setFpsDisplay('Custom')
    updateResolutionDisplay('1920', '1080', '30')
    updateFpsDisplay('30')
  }, [updateResolutionDisplay, updateFpsDisplay])

  // Generate comp name entries
  const handleCustomizeComps = useCallback(() => {
    const count = parseInt(numComps) || 3
    const foldersList = folders.split('\n').filter((f) => f.trim() !== '')
    const entries: CompNameEntry[] = []

    for (let i = 0; i < count; i++) {
      entries.push({
        name: compNames[i]?.name || `Comp ${i + 1}`,
        folder: compNames[i]?.folder || '',
      })
    }

    setCompNames(entries)
    setShowCompNames(true)
    // Needed to ensure folder dropdown options are up to date
    void foldersList
  }, [numComps, folders, compNames])

  const updateCompName = (index: number, name: string) => {
    setCompNames((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], name }
      return next
    })
  }

  const updateCompFolder = (index: number, folder: string) => {
    setCompNames((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], folder }
      return next
    })
  }

  // Build option arrays for dropdowns
  const presetOptions = Object.keys(presets).map((name) => ({
    label: name,
    value: name,
  }))

  const resolutionOptions = RESOLUTION_PRESETS.map((r) => ({ label: r, value: r }))
  const fpsOptions = FPS_PRESETS.map((f) => ({ label: f, value: f }))

  const foldersList = folders.split('\n').filter((f) => f.trim() !== '')
  const folderOptions = [
    { label: 'None', value: '' },
    ...foldersList.map((f) => ({ label: f.trim(), value: f.trim() })),
  ]

  return (
    <ModalOverlay className={styles.overlay} isDismissable isOpen onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <Modal className={styles.modal}>
        <Dialog className={styles.dialog} aria-label="Custom Setup">
          {({ close }) => (
            <>
              <div className={styles.header}>
                <h2 className={styles.headerTitle}>Custom Setup</h2>
                <Button className={styles.closeBtn} onPress={close} aria-label="Close">
                  <span className="material-symbols-outlined">close</span>
                </Button>
              </div>

              <div className={styles.body}>
                {/* Preset Selection */}
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Load Preset:</div>
                  <div className={styles.presetControls}>
                    <Dropdown
                      options={presetOptions}
                      value={selectedPreset}
                      placeholder="Select Preset..."
                      searchPlaceholder="Search presets..."
                      showSearch
                      onChange={(value) => setSelectedPreset(value)}
                    />
                    <div className={styles.presetActions}>
                      <span title="Load the selected preset into the form">
                        <Button
                          className={styles.smallBtn}
                          onPress={handleLoadPreset}
                          isDisabled={loadFeedback}
                          aria-label="Load the selected preset"
                        >
                          {loadFeedback ? (
                            <>
                              <span
                                className="material-symbols-outlined btn-icon"
                                style={{ fontSize: 14, marginRight: 3, verticalAlign: 'text-bottom' }}
                              >
                                check
                              </span>
                              Loaded
                            </>
                          ) : (
                            'Load'
                          )}
                        </Button>
                      </span>
                      <span title="Delete the selected preset">
                        <Button
                          className={styles.smallBtn}
                          onPress={handleDeletePreset}
                          aria-label="Delete the selected preset permanently"
                        >
                          Delete
                        </Button>
                      </span>
                      <span title="Refresh presets list">
                        <Button
                          className="icon-btn"
                          onPress={handleRefreshPresets}
                          aria-label="Refresh the list of presets from file"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                        </Button>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Dimensions:</div>
                  <div className={styles.dimensionsControls}>
                    <div className={styles.dimensionRow}>
                      <div className={styles.dimensionGroup}>
                        <TextField
                          value={width}
                          onChange={handleWidthChange}
                        >
                          <Label>Width:</Label>
                          <Input />
                        </TextField>
                      </div>
                      <div className={styles.dimensionGroup}>
                        <TextField
                          value={height}
                          onChange={handleHeightChange}
                        >
                          <Label>Height:</Label>
                          <Input />
                        </TextField>
                      </div>
                    </div>
                    <Dropdown
                      options={resolutionOptions}
                      value={resolutionDisplay}
                      placeholder="Custom"
                      searchPlaceholder="Search resolutions..."
                      showSearch
                      onChange={(value) => handleResolutionSelect(value)}
                    />
                  </div>
                </div>

                {/* Frame Rate */}
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Frame Rate:</div>
                  <div className={styles.fpsControls}>
                    <div className={styles.fpsGroup}>
                      <TextField
                        value={fps}
                        onChange={handleFpsInputChange}
                      >
                        <Label>FPS:</Label>
                        <Input />
                      </TextField>
                    </div>
                    <Dropdown
                      options={fpsOptions}
                      value={fpsDisplay}
                      placeholder="Custom"
                      searchPlaceholder="Search FPS values..."
                      showSearch
                      onChange={(value) => handleFpsSelect(value)}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Duration:</div>
                  <div className={styles.durationControls}>
                    <div className={styles.durationGroup}>
                      <TextField
                        value={hours}
                        onChange={setHours}
                      >
                        <Label>Hours:</Label>
                        <Input />
                      </TextField>
                    </div>
                    <div className={styles.durationGroup}>
                      <TextField
                        value={minutes}
                        onChange={setMinutes}
                      >
                        <Label>Minutes:</Label>
                        <Input />
                      </TextField>
                    </div>
                    <div className={styles.durationGroup}>
                      <TextField
                        value={seconds}
                        onChange={setSeconds}
                      >
                        <Label>Seconds:</Label>
                        <Input />
                      </TextField>
                    </div>
                  </div>
                </div>

                {/* Number of Compositions */}
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Number of Compositions:</div>
                  <div className={styles.compsControls}>
                    <TextField
                      value={numComps}
                      onChange={setNumComps}
                      aria-label="Number of compositions to create"
                    >
                      <Input id="compsInput" />
                    </TextField>
                    <Button
                      className="icon-btn"
                      onPress={handleCustomizeComps}
                      aria-label="Customize comp names and folders"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </Button>
                  </div>
                </div>

                {/* Comp Names Section */}
                {showCompNames && (
                  <div className={styles.compNamesSection}>
                    <div className={styles.compNamesContainer}>
                      <div className={styles.compNamesHeader}>
                        <div className={styles.sectionTitle}>Comp Names & Folders:</div>
                        <Button
                          className={styles.closeCompNames}
                          onPress={() => setShowCompNames(false)}
                          aria-label="Close Comp Names & Folders section"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </Button>
                      </div>
                      {compNames.map((entry, index) => (
                        <div key={index} className={styles.compNameInput}>
                          <Label className={styles.compLabel}>Comp {index + 1}:</Label>
                          <div className={styles.compNameRow}>
                            <TextField
                              value={entry.name}
                              onChange={(value) => updateCompName(index, value)}
                              aria-label={`Name for composition ${index + 1}`}
                            >
                              <Input />
                            </TextField>
                            <Dropdown
                              options={folderOptions}
                              value={entry.folder}
                              placeholder="None"
                              onChange={(value) => updateCompFolder(index, value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Folders */}
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Custom Folders:</div>
                  <div className={styles.folderList}>
                    {folders.split('\n').filter((f) => f.trim() !== '').map((folder, index) => (
                      <div key={index} className={styles.folderItem}>
                        <TextField
                          value={folder}
                          onChange={(value) => {
                            const list = folders.split('\n').filter((f) => f.trim() !== '')
                            list[index] = value
                            setFolders(list.join('\n'))
                          }}
                          aria-label={`Folder ${index + 1}`}
                        >
                          <Input />
                        </TextField>
                        <Button
                          className={styles.folderRemoveBtn}
                          onPress={() => {
                            const list = folders.split('\n').filter((f) => f.trim() !== '')
                            list.splice(index, 1)
                            setFolders(list.join('\n'))
                          }}
                          aria-label={`Remove folder ${folder}`}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                        </Button>
                      </div>
                    ))}
                    <Button
                      className={styles.folderAddBtn}
                      onPress={() => {
                        const list = folders.split('\n').filter((f) => f.trim() !== '')
                        list.push('New Folder')
                        setFolders(list.join('\n'))
                      }}
                      aria-label="Add a new folder"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                      Add Folder
                    </Button>
                  </div>
                </div>

                {/* Save as Preset */}
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Save as Preset:</div>
                  <div className={styles.savePresetControls}>
                    <TextField
                      value={presetName}
                      onChange={setPresetName}
                      aria-label="Enter a name for your preset"
                    >
                      <Input id="presetNameInput" />
                    </TextField>
                    <span title="Save current settings as a reusable preset">
                      <Button onPress={handleSavePreset} aria-label="Save current settings as a new preset">
                        Save Preset
                      </Button>
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.footer}>
                <span title="Reset all fields to default values">
                  <Button onPress={handleReset} aria-label="Reset all settings to default values">
                    Reset to Default
                  </Button>
                </span>
                <span title="Create project with current settings">
                  <Button className="primary-btn" onPress={handleCreateCustomSetup} aria-label="Create project setup with current settings">
                    Create Custom Setup
                  </Button>
                </span>
                <span title="Close without creating">
                  <Button onPress={close} aria-label="Close this window">
                    Close
                  </Button>
                </span>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
