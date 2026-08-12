import { useCallback, useState } from 'react'
import { Dialog, Input, Modal, ModalOverlay, TextField } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import { toEvalLiteral } from '../../../hooks/useCSInterface'
import { usePresets } from '../../../hooks/usePresets'
import { useSetupForm } from '../../../hooks/useSetupForm'
import { buildSettings } from '../../../lib/setup'
import { FPS_PRESETS, RESOLUTION_PRESETS } from '../../../lib/presets'
import { Button } from '../../ui/Button'
import { useConfirm } from '../../ui/ConfirmDialog/useConfirm'
import { Dropdown } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import { ValueField } from '../../ui/ValueField'
import { CompNamesEditor } from './CompNamesEditor'
import { FolderList } from './FolderList'
import { PresetBar } from './PresetBar'
import styles from './CustomSetupModal.module.css'

const NO_PRESET = ''
const LOADED_FEEDBACK_MS = 2000

const resolutionOptions = RESOLUTION_PRESETS.map((r) => ({ label: r, value: r }))
const fpsOptions = FPS_PRESETS.map((f) => ({ label: f, value: f }))

interface CustomSetupModalProps {
  onClose: () => void
}

export function CustomSetupModal({ onClose }: CustomSetupModalProps) {
  const { evalHostScript, notify } = useApp()
  const { confirm, dialog: confirmDialog } = useConfirm()
  const presets = usePresets()
  const setup = useSetupForm()

  const [selectedPreset, setSelectedPreset] = useState(NO_PRESET)
  const [presetName, setPresetName] = useState('My Preset')
  const [justLoaded, setJustLoaded] = useState(false)

  const { form, comps, compsForHost } = setup

  // ── Presets ──
  const handleLoadPreset = useCallback(async () => {
    if (!selectedPreset) {
      notify('Pick a preset to load.', 'warning')
      return
    }
    const stored = await presets.get(selectedPreset)
    if (!stored) {
      notify(`"${selectedPreset}" is no longer in the presets file.`, 'error')
      return
    }
    setup.loadFromPreset(stored)
    setPresetName(selectedPreset)
    setJustLoaded(true)
    window.setTimeout(() => setJustLoaded(false), LOADED_FEEDBACK_MS)
  }, [selectedPreset, presets, setup, notify])

  const handleDeletePreset = useCallback(async () => {
    if (!selectedPreset) {
      notify('Pick a preset to delete.', 'warning')
      return
    }
    const confirmed = await confirm(`Delete the preset "${selectedPreset}"?`, 'Delete')
    if (!confirmed) return

    if (await presets.remove(selectedPreset)) {
      setSelectedPreset(NO_PRESET)
      notify(`Deleted "${selectedPreset}".`, 'success')
    }
  }, [selectedPreset, presets, confirm, notify])

  const handleRefreshPresets = useCallback(async () => {
    setSelectedPreset(NO_PRESET)
    await presets.reload()
  }, [presets])

  const handleSavePreset = useCallback(async () => {
    const name = presetName.trim()
    if (!name) {
      notify('Name the preset before saving it.', 'warning')
      return
    }
    if (presets.presets[name]) {
      const confirmed = await confirm(`A preset named "${name}" exists. Overwrite it?`, 'Overwrite')
      if (!confirmed) return
    }
    if (await presets.save(name, buildSettings(form, compsForHost))) {
      notify(`Saved "${name}".`, 'success')
    }
  }, [presetName, presets, confirm, form, compsForHost, notify])

  // ── Create ──
  const handleCreate = useCallback(async () => {
    const settings = buildSettings(form, compsForHost)
    await evalHostScript(`createCustomSetup(${toEvalLiteral(settings)})`)
    setup.closeCompEditor()
    onClose()
  }, [form, compsForHost, evalHostScript, setup, onClose])

  return (
    <ModalOverlay
      className={styles.overlay}
      isDismissable
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <Modal className={styles.modal}>
        <Dialog className={styles.dialog} aria-label="Custom setup">
          {({ close }) => (
            <>
              <div className={styles.header}>
                <h2 className={styles.headerTitle}>Custom setup</h2>
                <Button variant="quiet" iconOnly onPress={close} aria-label="Close custom setup">
                  <Icon name="close" size={20} />
                </Button>
              </div>

              <div className={styles.body}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Load preset</h3>
                  <PresetBar
                    names={presets.names}
                    selected={selectedPreset}
                    onSelect={setSelectedPreset}
                    onLoad={handleLoadPreset}
                    onDelete={handleDeletePreset}
                    onRefresh={handleRefreshPresets}
                    justLoaded={justLoaded}
                  />
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Dimensions</h3>
                  <div className={styles.stack}>
                    <div className={styles.fieldGrid}>
                      <ValueField
                        label="Width"
                        value={form.width}
                        onChange={(v) => setup.setField('width', v)}
                        unit="px"
                      />
                      <ValueField
                        label="Height"
                        value={form.height}
                        onChange={(v) => setup.setField('height', v)}
                        unit="px"
                      />
                    </div>
                    <Dropdown
                      options={resolutionOptions}
                      value={setup.resolutionDisplay}
                      placeholder="Custom"
                      searchPlaceholder="Search resolutions..."
                      showSearch
                      onChange={setup.applyResolutionPreset}
                      aria-label="Resolution preset"
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Frame rate</h3>
                  <div className={styles.stack}>
                    <ValueField
                      label="Frame rate"
                      value={form.fps}
                      onChange={(v) => setup.setField('fps', v)}
                      unit="fps"
                    />
                    <Dropdown
                      options={fpsOptions}
                      value={setup.fpsDisplay}
                      placeholder="Custom"
                      searchPlaceholder="Search FPS values..."
                      showSearch
                      onChange={setup.applyFpsPreset}
                      aria-label="Frame rate preset"
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Duration</h3>
                  <div className={styles.fieldGrid}>
                    <ValueField
                      label="Hours"
                      value={form.hours}
                      onChange={(v) => setup.setField('hours', v)}
                      unit="h"
                    />
                    <ValueField
                      label="Minutes"
                      value={form.minutes}
                      onChange={(v) => setup.setField('minutes', v)}
                      unit="m"
                    />
                    <ValueField
                      label="Seconds"
                      value={form.seconds}
                      onChange={(v) => setup.setField('seconds', v)}
                      unit="s"
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Compositions</h3>
                  <div className={styles.row}>
                    <ValueField
                      label="How many"
                      value={form.numComps}
                      onChange={(v) => setup.setField('numComps', v)}
                    />
                    <Button
                      iconOnly
                      onPress={setup.openCompEditor}
                      aria-label="Name the compositions and choose their folders"
                    >
                      <Icon name="add" size={20} />
                    </Button>
                  </div>

                  {setup.showComps && (
                    <CompNamesEditor
                      comps={comps}
                      folders={form.folders}
                      onChange={setup.setCompField}
                      onClose={setup.closeCompEditor}
                    />
                  )}
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Project folders</h3>
                  <FolderList
                    folders={form.folders}
                    onRename={setup.renameFolder}
                    onRemove={setup.removeFolder}
                    onAdd={setup.addFolder}
                  />
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Save as preset</h3>
                  <div className={styles.stack}>
                    <TextField
                      className={styles.textField}
                      value={presetName}
                      onChange={setPresetName}
                      aria-label="Preset name"
                    >
                      <Input className={styles.textInput} autoComplete="off" />
                    </TextField>
                    <Button block onPress={handleSavePreset}>
                      Save preset
                    </Button>
                  </div>
                </div>
              </div>

              <div className={styles.footer}>
                <Button variant="key" block onPress={handleCreate}>
                  Create setup
                </Button>
                <div className={styles.footerSecondary}>
                  <Button onPress={setup.reset}>Reset</Button>
                  <Button onPress={close}>Close</Button>
                </div>
              </div>

              {confirmDialog}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
