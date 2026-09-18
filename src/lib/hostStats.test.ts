import { describe, it, expect } from 'vitest'
import { createHostStats, hostCallName, recordCall } from './hostStats'
import { wrapHostCall } from './hostEnvelope'

describe('hostCallName', () => {
  it('reads the name out of the expression wrapHostCall builds', () => {
    expect(hostCallName(wrapHostCall('com_dony_tools', 'loadPresets()'))).toBe('loadPresets')
  })

  it('reads it when the call carries arguments', () => {
    const script = wrapHostCall('com_dony_tools', 'deletePreset("My preset")')
    expect(hostCallName(script)).toBe('deletePreset')
  })

  it('returns "other" for anything that is not a wrapped host call', () => {
    expect(hostCallName('app.project.file')).toBe('other')
  })
})

describe('createHostStats / recordCall', () => {
  it('starts empty with the given timestamp', () => {
    expect(createHostStats(123)).toEqual({ since: 123, byName: {} })
  })

  it('creates the entry on the first call', () => {
    const stats = createHostStats(0)
    recordCall(stats, 'getTwixtorInfo', 12, false)
    expect(stats.byName.getTwixtorInfo).toEqual({
      calls: 1,
      totalMs: 12,
      maxMs: 12,
      lastMs: 12,
      empty: 0,
    })
  })

  it('accumulates calls, total, max, last and empty results', () => {
    const stats = createHostStats(0)
    recordCall(stats, 'x', 10, false)
    recordCall(stats, 'x', 30, true)
    recordCall(stats, 'x', 20, false)
    expect(stats.byName.x).toEqual({ calls: 3, totalMs: 60, maxMs: 30, lastMs: 20, empty: 1 })
  })
})
