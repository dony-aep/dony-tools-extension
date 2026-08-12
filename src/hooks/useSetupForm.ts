import { useCallback, useState } from 'react'
import { CUSTOM, matchFps, matchResolution } from '../lib/presets'
import {
  DEFAULT_FORM,
  compsFromPreset,
  formFromPreset,
  resizeComps,
  type CompEntry,
  type SetupForm,
  type SetupSettings,
} from '../lib/setup'

/**
 * State for the custom setup form.
 *
 * The two preset dropdowns are derived, not stored independently: typing a
 * width updates the resolution dropdown and vice versa, so they can never
 * disagree with the fields.
 */
export function useSetupForm() {
  const [form, setForm] = useState<SetupForm>({ ...DEFAULT_FORM })
  const [comps, setComps] = useState<CompEntry[]>([])
  const [showComps, setShowComps] = useState(false)

  const resolutionDisplay = matchResolution(form.width, form.height, form.fps)
  const fpsDisplay = matchFps(form.fps)

  const setField = useCallback(<K extends keyof SetupForm>(key: K, value: SetupForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  /** Picking a resolution preset fills width, height and frame rate at once. */
  const applyResolutionPreset = useCallback((label: string) => {
    const dimensions = label.match(/(\d+)x(\d+)/)
    const fps = label.match(/(\d+(?:\.\d+)?)\s*fps/)
    setForm((prev) => ({
      ...prev,
      width: dimensions ? dimensions[1] : prev.width,
      height: dimensions ? dimensions[2] : prev.height,
      fps: fps ? fps[1] : prev.fps,
    }))
  }, [])

  const applyFpsPreset = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, fps: value }))
  }, [])

  // ── Folders ──
  const addFolder = useCallback(() => {
    setForm((prev) => ({ ...prev, folders: [...prev.folders, 'New Folder'] }))
  }, [])

  const renameFolder = useCallback((index: number, name: string) => {
    setForm((prev) => {
      const folders = [...prev.folders]
      folders[index] = name
      return { ...prev, folders }
    })
  }, [])

  const removeFolder = useCallback((index: number) => {
    setForm((prev) => ({ ...prev, folders: prev.folders.filter((_, i) => i !== index) }))
  }, [])

  // ── Comp names ──
  const openCompEditor = useCallback(() => {
    setComps((prev) => resizeComps(prev, parseInt(form.numComps, 10) || 3))
    setShowComps(true)
  }, [form.numComps])

  const closeCompEditor = useCallback(() => setShowComps(false), [])

  const setCompField = useCallback((index: number, key: keyof CompEntry, value: string) => {
    setComps((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }, [])

  // ── Whole-form operations ──
  const loadFromPreset = useCallback((stored: Partial<SetupSettings>) => {
    setForm(formFromPreset(stored))
    const entries = compsFromPreset(stored)
    setComps(entries)
    setShowComps(entries.length > 0)
  }, [])

  const reset = useCallback(() => {
    setForm({ ...DEFAULT_FORM })
    setComps([])
    setShowComps(false)
  }, [])

  return {
    form,
    setField,
    resolutionDisplay,
    fpsDisplay,
    applyResolutionPreset,
    applyFpsPreset,
    addFolder,
    renameFolder,
    removeFolder,
    comps,
    showComps,
    openCompEditor,
    closeCompEditor,
    setCompField,
    loadFromPreset,
    reset,
    /** Comps to send to the host — none unless the editor is open. */
    compsForHost: showComps && comps.length > 0 ? comps : undefined,
    CUSTOM,
  }
}
