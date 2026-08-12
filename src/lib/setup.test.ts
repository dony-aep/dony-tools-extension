import { describe, it, expect } from 'vitest'
import {
  DEFAULT_FORM,
  buildSettings,
  cleanFolders,
  compsFromPreset,
  formFromPreset,
  resizeComps,
} from './setup'

describe('cleanFolders', () => {
  it('drops blank and whitespace-only names', () => {
    expect(cleanFolders(['Comps', '', '   ', 'Clips'])).toEqual(['Comps', 'Clips'])
  })

  it('trims surrounding whitespace', () => {
    expect(cleanFolders(['  Comps  '])).toEqual(['Comps'])
  })

  it('keeps order and duplicates — the host decides what to do with them', () => {
    expect(cleanFolders(['A', 'B', 'A'])).toEqual(['A', 'B', 'A'])
  })
})

describe('buildSettings', () => {
  it('converts the form strings into numbers', () => {
    const settings = buildSettings(DEFAULT_FORM)
    expect(settings).toMatchObject({
      width: 1920,
      height: 1080,
      fps: 30,
      hours: 0,
      minutes: 1,
      seconds: 0,
      numComps: 3,
    })
  })

  it('keeps fractional frame rates', () => {
    expect(buildSettings({ ...DEFAULT_FORM, fps: '29.97' }).fps).toBe(29.97)
  })

  it('falls back to 0 rather than emitting NaN', () => {
    // NaN would serialise to `null` and the host would build a broken comp.
    const settings = buildSettings({ ...DEFAULT_FORM, width: '', hours: 'abc' })
    expect(settings.width).toBe(0)
    expect(settings.hours).toBe(0)
    expect(JSON.stringify(settings)).not.toContain('null')
  })

  it('parses decimals in integer fields as base ten', () => {
    // parseInt without a radix used to be used here.
    expect(buildSettings({ ...DEFAULT_FORM, width: '0800' }).width).toBe(800)
  })

  it('omits comp names when the editor was never opened', () => {
    const settings = buildSettings(DEFAULT_FORM)
    expect(settings.compNames).toBeUndefined()
    expect(settings.compFolders).toBeUndefined()
  })

  it('includes comp names and folders when provided', () => {
    const settings = buildSettings(DEFAULT_FORM, [
      { name: 'Intro', folder: 'Comps' },
      { name: 'Outro', folder: '' },
    ])
    expect(settings.compNames).toEqual(['Intro', 'Outro'])
    expect(settings.compFolders).toEqual(['Comps', ''])
  })

  it('names an unnamed comp rather than sending an empty string', () => {
    const settings = buildSettings(DEFAULT_FORM, [{ name: '', folder: '' }])
    expect(settings.compNames).toEqual(['Comp'])
  })
})

describe('formFromPreset', () => {
  it('restores every field as a string', () => {
    const form = formFromPreset({
      width: 3840,
      height: 2160,
      fps: 23.976,
      hours: 1,
      minutes: 2,
      seconds: 3,
      numComps: 5,
      folders: ['A', 'B'],
    })
    expect(form).toEqual({
      width: '3840',
      height: '2160',
      fps: '23.976',
      hours: '1',
      minutes: '2',
      seconds: '3',
      numComps: '5',
      folders: ['A', 'B'],
    })
  })

  it('falls back to defaults for a missing or empty preset', () => {
    expect(formFromPreset(null)).toEqual(DEFAULT_FORM)
    expect(formFromPreset({}).folders).toEqual(DEFAULT_FORM.folders)
  })

  it('keeps a zero duration instead of treating it as missing', () => {
    // `stored.hours ?? 0` must not collapse a real 0 into a default.
    expect(formFromPreset({ hours: 0, minutes: 0, seconds: 0 }).minutes).toBe('0')
  })

  it('copies the folder array so editing the form cannot mutate the preset', () => {
    const stored = { folders: ['A'] }
    const form = formFromPreset(stored)
    form.folders.push('B')
    expect(stored.folders).toEqual(['A'])
  })
})

describe('compsFromPreset', () => {
  it('pairs names with folders', () => {
    expect(compsFromPreset({ compNames: ['One', 'Two'], compFolders: ['Comps', ''] })).toEqual([
      { name: 'One', folder: 'Comps' },
      { name: 'Two', folder: '' },
    ])
  })

  it('tolerates a shorter folder list', () => {
    expect(compsFromPreset({ compNames: ['One', 'Two'], compFolders: ['Comps'] })).toEqual([
      { name: 'One', folder: 'Comps' },
      { name: 'Two', folder: '' },
    ])
  })

  it('returns nothing when the preset stored no comp names', () => {
    expect(compsFromPreset({})).toEqual([])
    expect(compsFromPreset({ compNames: [] })).toEqual([])
    expect(compsFromPreset(null)).toEqual([])
  })
})

describe('resizeComps', () => {
  it('grows with numbered placeholders', () => {
    expect(resizeComps([], 2)).toEqual([
      { name: 'Comp 1', folder: '' },
      { name: 'Comp 2', folder: '' },
    ])
  })

  it('keeps what the user already typed in surviving rows', () => {
    const existing = [{ name: 'Intro', folder: 'Comps' }]
    expect(resizeComps(existing, 2)[0]).toEqual({ name: 'Intro', folder: 'Comps' })
  })

  it('shrinks by dropping the tail', () => {
    const existing = [
      { name: 'A', folder: '' },
      { name: 'B', folder: '' },
    ]
    expect(resizeComps(existing, 1)).toEqual([{ name: 'A', folder: '' }])
  })

  it('never produces an empty editor', () => {
    expect(resizeComps([], 0)).toHaveLength(1)
    expect(resizeComps([], -3)).toHaveLength(1)
  })
})
