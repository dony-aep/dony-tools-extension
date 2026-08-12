/**
 * The custom setup form: its shape, its defaults, and the translation between
 * what the form holds (strings, because they come from text fields) and what
 * the host expects (numbers).
 *
 * Pure — no React, no CEP — so the conversions can be tested directly. The
 * modal used to inline all of this.
 */

export interface CompEntry {
  name: string
  /** Empty string means "no folder". */
  folder: string
}

/** Every field is a string: these are text inputs mid-edit, not numbers yet. */
export interface SetupForm {
  width: string
  height: string
  fps: string
  hours: string
  minutes: string
  seconds: string
  numComps: string
  folders: string[]
}

/** What `createCustomSetup` / `savePreset` receive. */
export interface SetupSettings {
  width: number
  height: number
  fps: number
  hours: number
  minutes: number
  seconds: number
  numComps: number
  folders: string[]
  compNames?: string[]
  compFolders?: string[]
}

export const DEFAULT_FORM: SetupForm = {
  width: '1920',
  height: '1080',
  fps: '30',
  hours: '0',
  minutes: '1',
  seconds: '0',
  numComps: '3',
  folders: ['Comps', 'Main Comps', 'Materials', 'Clips', 'Episodes'],
}

/** Blank and whitespace-only folder names never reach the host. */
export function cleanFolders(folders: string[]): string[] {
  const out: string[] = []
  for (const folder of folders) {
    const trimmed = folder.trim()
    if (trimmed !== '') out.push(trimmed)
  }
  return out
}

const toInt = (value: string, fallback = 0): number => {
  const n = parseInt(value, 10)
  return isNaN(n) ? fallback : n
}

const toFloat = (value: string, fallback = 0): number => {
  const n = parseFloat(value)
  return isNaN(n) ? fallback : n
}

/**
 * Converts the form into the host payload. `comps` is only included when the
 * user opened the names editor; otherwise the host names the comps itself.
 */
export function buildSettings(form: SetupForm, comps?: CompEntry[]): SetupSettings {
  const settings: SetupSettings = {
    width: toInt(form.width),
    height: toInt(form.height),
    fps: toFloat(form.fps),
    hours: toInt(form.hours),
    minutes: toInt(form.minutes),
    seconds: toInt(form.seconds),
    numComps: toInt(form.numComps),
    folders: cleanFolders(form.folders),
  }

  if (comps && comps.length > 0) {
    settings.compNames = comps.map((c) => c.name || 'Comp')
    settings.compFolders = comps.map((c) => c.folder)
  }

  return settings
}

/** Rebuilds the form from a preset as stored by the host. */
export function formFromPreset(stored: Partial<SetupSettings> | null | undefined): SetupForm {
  if (!stored) return { ...DEFAULT_FORM }
  return {
    width: String(stored.width ?? DEFAULT_FORM.width),
    height: String(stored.height ?? DEFAULT_FORM.height),
    fps: String(stored.fps ?? DEFAULT_FORM.fps),
    hours: String(stored.hours ?? 0),
    minutes: String(stored.minutes ?? 0),
    seconds: String(stored.seconds ?? 0),
    numComps: String(stored.numComps ?? DEFAULT_FORM.numComps),
    folders: Array.isArray(stored.folders) ? [...stored.folders] : [...DEFAULT_FORM.folders],
  }
}

/** Rebuilds the comp-name rows from a preset, pairing names with folders. */
export function compsFromPreset(stored: Partial<SetupSettings> | null | undefined): CompEntry[] {
  const names = stored?.compNames
  if (!Array.isArray(names) || names.length === 0) return []
  const folders = Array.isArray(stored?.compFolders) ? stored.compFolders : []
  return names.map((name, i) => ({
    name: name || `Comp ${i + 1}`,
    folder: folders[i] || '',
  }))
}

/**
 * Grows or shrinks the comp rows to `count`, keeping whatever the user already
 * typed in the rows that survive.
 */
export function resizeComps(existing: CompEntry[], count: number): CompEntry[] {
  const total = count > 0 ? count : 1
  const out: CompEntry[] = []
  for (let i = 0; i < total; i++) {
    out.push({
      name: existing[i]?.name || `Comp ${i + 1}`,
      folder: existing[i]?.folder || '',
    })
  }
  return out
}
