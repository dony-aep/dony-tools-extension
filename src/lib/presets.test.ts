import { describe, it, expect } from 'vitest'
import {
  CUSTOM,
  FPS_PRESETS,
  RESOLUTION_PRESETS,
  matchFps,
  matchResolution,
  parsePreset,
} from './presets'

describe('parsePreset', () => {
  it('reads dimensions and frame rate from a label', () => {
    expect(parsePreset('HD • 1920x1080 • 29.97 fps')).toEqual({
      width: 1920,
      height: 1080,
      fps: 29.97,
    })
  })

  it('ignores the pixel aspect ratio in parentheses', () => {
    expect(parsePreset('HDV • 1440x1080 (1.33) • 25 fps')).toEqual({
      width: 1440,
      height: 1080,
      fps: 25,
    })
  })

  it('returns null for a label with no spec', () => {
    expect(parsePreset('Custom')).toBeNull()
  })

  it('parses every shipped preset', () => {
    for (const label of RESOLUTION_PRESETS) {
      expect(parsePreset(label), label).not.toBeNull()
    }
  })
})

describe('matchResolution', () => {
  it('matches a preset exactly', () => {
    expect(matchResolution('3840', '2160', '25')).toBe('UHD (4K) • 3840x2160 • 25 fps')
  })

  it('matches fractional frame rates within tolerance', () => {
    expect(matchResolution('1920', '1080', '29.97')).toBe('HD • 1920x1080 • 29.97 fps')
    expect(matchResolution('7680', '4320', '23.976')).toBe('UHD (8K) • 7680x4320 • 23.976 fps')
  })

  it('does not confuse 29.97 with 30', () => {
    // Same resolution, different rate: these are separate presets and picking
    // the wrong one would silently build the comp at the wrong frame rate.
    expect(matchResolution('1920', '1080', '30')).toBe('HD • 1920x1080 • 30 fps')
    expect(matchResolution('1920', '1080', '29.97')).toBe('HD • 1920x1080 • 29.97 fps')
  })

  it('labels the default 1920x1080 at 30 fps as HD, not as a social preset', () => {
    // Without a plain HD 30 entry the default form matched "Social Media
    // Landscape HD", which reads as a mistake to anyone building a normal comp.
    expect(matchResolution('1920', '1080', '30')).toContain('HD •')
    expect(matchResolution('1920', '1080', '30')).not.toContain('Social')
  })

  it('falls back to Custom when nothing matches', () => {
    expect(matchResolution('1234', '567', '30')).toBe(CUSTOM)
    expect(matchResolution('1920', '1080', '48')).toBe(CUSTOM)
  })

  it('falls back to Custom for non-numeric or empty input', () => {
    expect(matchResolution('', '1080', '30')).toBe(CUSTOM)
    expect(matchResolution('abc', '1080', '30')).toBe(CUSTOM)
    expect(matchResolution('1920', '1080', '')).toBe(CUSTOM)
  })

  it('round-trips every preset back to itself', () => {
    for (const label of RESOLUTION_PRESETS) {
      const spec = parsePreset(label)!
      const matched = matchResolution(String(spec.width), String(spec.height), String(spec.fps))
      // Presets sharing a spec collapse onto the first listed, so compare specs
      // rather than labels.
      expect(parsePreset(matched), label).toEqual(spec)
    }
  })
})

describe('matchFps', () => {
  it('matches whole and fractional rates', () => {
    expect(matchFps('30')).toBe('30')
    expect(matchFps('23.976')).toBe('23.976')
    expect(matchFps('59.94')).toBe('59.94')
  })

  it('keeps 29.97 and 30 distinct', () => {
    expect(matchFps('29.97')).toBe('29.97')
    expect(matchFps('30')).toBe('30')
  })

  it('falls back to Custom for unlisted or invalid rates', () => {
    expect(matchFps('48')).toBe(CUSTOM)
    expect(matchFps('')).toBe(CUSTOM)
    expect(matchFps('abc')).toBe(CUSTOM)
  })

  it('round-trips every shipped rate', () => {
    for (const rate of FPS_PRESETS) {
      expect(matchFps(rate)).toBe(rate)
    }
  })
})
