/**
 * Composition presets and the matching that keeps the dropdowns in sync with
 * the typed width / height / frame rate.
 *
 * Pure functions, no React and no CEP: the modal used to hold this inline,
 * which made it untestable.
 */

export const RESOLUTION_PRESETS = [
  'HD • 1920x1080 • 24 fps',
  'HD • 1920x1080 • 25 fps',
  'HD • 1920x1080 • 29.97 fps',
  'HD • 1920x1080 • 30 fps',
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

export const FPS_PRESETS = [
  '8', '12', '15', '23.976', '24', '25', '29.97', '30', '50', '59.94', '60', '120',
]

/** Shown when the typed values match no preset. */
export const CUSTOM = 'Custom'

/** Frame rates are compared with a tolerance: 29.97 is stored as 29.97, not 30. */
const FPS_TOLERANCE = 0.01

export interface PresetSpec {
  width: number
  height: number
  fps: number
}

/** Pulls the dimensions and frame rate out of a preset label. */
export function parsePreset(label: string): PresetSpec | null {
  const dimensions = label.match(/(\d+)x(\d+)/)
  const fps = label.match(/(\d+(?:\.\d+)?)\s*fps/)
  if (!dimensions || !fps) return null
  return {
    width: parseInt(dimensions[1], 10),
    height: parseInt(dimensions[2], 10),
    fps: parseFloat(fps[1]),
  }
}

/**
 * The preset label matching these values, or `CUSTOM`. Several presets share a
 * resolution and frame rate (HD 1920x1080 30fps and Social Media Landscape HD),
 * in which case the first listed wins — the dropdown can only show one.
 */
export function matchResolution(width: string, height: string, fps: string): string {
  const w = parseInt(width, 10)
  const h = parseInt(height, 10)
  const f = parseFloat(fps)
  if (isNaN(w) || isNaN(h) || isNaN(f)) return CUSTOM

  for (const label of RESOLUTION_PRESETS) {
    const spec = parsePreset(label)
    if (spec && spec.width === w && spec.height === h && Math.abs(spec.fps - f) < FPS_TOLERANCE) {
      return label
    }
  }
  return CUSTOM
}

/** The frame rate preset matching this value, or `CUSTOM`. */
export function matchFps(fps: string): string {
  const f = parseFloat(fps)
  if (isNaN(f)) return CUSTOM
  for (const preset of FPS_PRESETS) {
    if (Math.abs(parseFloat(preset) - f) < FPS_TOLERANCE) return preset
  }
  return CUSTOM
}
