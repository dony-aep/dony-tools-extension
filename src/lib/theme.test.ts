import { describe, it, expect } from 'vitest'
import { contrast, deriveTheme, luminance } from './theme'

/** After Effects' four UI brightness steps, as reported by appSkinInfo. */
const AE_BRIGHTNESS_STEPS = [25, 30, 50, 83]

/** A light host theme, to prove the ramp inverts rather than breaking. */
const LIGHT_HOST = 160

const AE_HIGHLIGHT = { red: 0, green: 120, blue: 212 }

const grey = (hex: string) => parseInt(hex.slice(1, 3), 16)
const themeFor = (level: number) =>
  deriveTheme({ red: level, green: level, blue: level }, AE_HIGHLIGHT)

describe('luminance / contrast', () => {
  it('matches known WCAG values', () => {
    expect(luminance(0)).toBe(0)
    expect(luminance(255)).toBeCloseTo(1, 5)
    // White on black is the canonical 21:1.
    expect(contrast(255, 0)).toBeCloseTo(21, 2)
    expect(contrast(0, 0)).toBe(1)
  })

  it('is symmetric', () => {
    expect(contrast(30, 200)).toBeCloseTo(contrast(200, 30), 10)
  })
})

describe('deriveTheme ink hierarchy', () => {
  // Regression: the first implementation searched inward from white, so every
  // level returned white and the four inks collapsed into one flat value.
  // Shipped that way until a contrast table exposed it.
  it.each([...AE_BRIGHTNESS_STEPS, LIGHT_HOST])(
    'keeps four distinct ink levels at host grey %i',
    (level) => {
      const t = themeFor(level)
      const inks = [t.inkHi, t.ink, t.inkLo, t.inkDim]
      expect(new Set(inks).size).toBe(4)
    },
  )

  it.each([...AE_BRIGHTNESS_STEPS, LIGHT_HOST])(
    'orders inks from loudest to quietest at host grey %i',
    (level) => {
      const t = themeFor(level)
      const ground = grey(t.ground)
      const ratios = [t.inkHi, t.ink, t.inkLo, t.inkDim].map((c) => contrast(grey(c), ground))
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i]).toBeLessThan(ratios[i - 1])
      }
    },
  )

  // Regression: the ink targets are capped by the headroom the surfaces have,
  // and the first version of that cap read its direction off the theme's own
  // `isDark` rather than per background. On a mid-grey host — where `ground`
  // and `control` land on opposite sides of the luminance midpoint — it capped
  // against the wrong extreme and returned inks that were not even in order,
  // with --ink-lo brighter than --ink-hi. Sampling only the brightness steps
  // After Effects reports never touches that band, so this sweeps all of them.
  it('keeps four ordered, distinct inks at every possible host grey', () => {
    const broken: string[] = []
    for (let level = 0; level <= 255; level++) {
      const t = themeFor(level)
      const ground = grey(t.ground)
      const inks = [t.inkHi, t.ink, t.inkLo, t.inkDim].map(grey)
      const ratios = inks.map((c) => contrast(c, ground))
      const ordered = ratios.every((r, i) => i === 0 || r < ratios[i - 1])
      if (new Set(inks).size !== 4 || !ordered) broken.push(`${level}: ${inks.join(',')}`)
    }
    expect(broken).toEqual([])
  })
})

describe('deriveTheme contrast guarantees', () => {
  it.each([...AE_BRIGHTNESS_STEPS, LIGHT_HOST])(
    'meets WCAG AA for text on both surfaces at host grey %i',
    (level) => {
      const t = themeFor(level)
      const ground = grey(t.ground)
      const control = grey(t.control)

      // Body and label ink sit on the panel and inside fields alike.
      for (const ink of [t.inkHi, t.ink, t.inkLo]) {
        expect(contrast(grey(ink), ground)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(grey(ink), control)).toBeGreaterThanOrEqual(4.5)
      }
    },
  )

  it.each([...AE_BRIGHTNESS_STEPS, LIGHT_HOST])(
    'meets the 3:1 non-text minimum at host grey %i',
    (level) => {
      const t = themeFor(level)
      const ground = grey(t.ground)
      const control = grey(t.control)

      // WCAG 1.4.11: the boundary that identifies an interactive control.
      expect(contrast(grey(t.edge), ground)).toBeGreaterThanOrEqual(3)
      // Decorative/disabled ink is never the sole carrier of information,
      // but still has to be perceivable.
      expect(contrast(grey(t.inkDim), control)).toBeGreaterThanOrEqual(3)
    },
  )

  it.each([...AE_BRIGHTNESS_STEPS, LIGHT_HOST])(
    'keeps the primary action legible at host grey %i',
    (level) => {
      const t = themeFor(level)
      expect(contrast(grey(t.keyInk), grey(t.key))).toBeGreaterThanOrEqual(4.5)
    },
  )
})

describe('deriveTheme host adoption', () => {
  it('follows the host brightness instead of painting a fixed colour', () => {
    const dark = themeFor(25)
    const light = themeFor(83)
    expect(grey(dark.ground)).toBeLessThan(grey(light.ground))
  })

  it('sinks below the host grey so the panel reads as its own surface', () => {
    // IDENTITY_OFFSET is negative on dark themes.
    expect(grey(themeFor(30).ground)).toBeLessThan(30)
  })

  it('raises surfaces above the ground on dark themes', () => {
    const t = themeFor(30)
    expect(grey(t.control)).toBeGreaterThan(grey(t.ground))
  })

  it('inverts that relationship on a light host theme', () => {
    const t = themeFor(LIGHT_HOST)
    expect(grey(t.control)).toBeLessThan(grey(t.ground))
  })

  it('adopts the host highlight for selection', () => {
    expect(themeFor(30).select).toBe('rgb(0, 120, 212)')
  })

  it('falls back to ink when the host reports no highlight', () => {
    const t = deriveTheme({ red: 30, green: 30, blue: 30 })
    expect(t.select).toBe(t.inkHi)
  })

  it('picks a tick colour the highlight can carry', () => {
    // AE's blue is dark enough to need a white tick.
    expect(themeFor(30).selectInk).toBe('#ffffff')
    // A pale highlight needs a dark one.
    const pale = deriveTheme(
      { red: 30, green: 30, blue: 30 },
      { red: 240, green: 240, blue: 120 },
    )
    expect(pale.selectInk).toBe('#000000')
  })
})
