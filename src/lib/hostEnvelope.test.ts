import { describe, it, expect } from 'vitest'
import { HOST_NOT_LOADED, parseHostEnvelope, wrapHostCall } from './hostEnvelope'

const NS = 'com_dony_tools'

describe('wrapHostCall', () => {
  it('calls the function inside the namespace and returns it wrapped', () => {
    const script = wrapHostCall(NS, 'loadPresets()')
    expect(script).toContain('var ns=$.global.com_dony_tools;')
    expect(script).toContain('r=ns.loadPresets();')
    expect(script).toContain('return ns.envelope(r);')
  })

  it('answers with the sentinel when the namespace is missing', () => {
    expect(wrapHostCall(NS, 'loadPresets()')).toContain(`if(!ns)return "${HOST_NOT_LOADED}"`)
  })

  it('turns a throw that escaped the tool into a reported message', () => {
    expect(wrapHostCall(NS, 'resetAnchorPoint()')).toContain(
      'catch(e){ns.report("error","Host call failed: "+e.toString());r="";}',
    )
  })

  it('leaves an already escaped argument untouched', () => {
    // escapeForEval ran at the call site: the wrapper must not re-escape or re-quote it.
    const script = wrapHostCall(NS, 'deletePreset("A \\" quote")')
    expect(script).toContain('r=ns.deletePreset("A \\" quote");')
  })
})

describe('parseHostEnvelope', () => {
  it('splits the result from the queued messages', () => {
    const raw = JSON.stringify({
      r: 'true',
      m: [
        { kind: 'success', message: 'Preset saved' },
        { kind: 'warning', message: 'Two layers were skipped' },
      ],
    })
    expect(parseHostEnvelope(raw)).toEqual({
      result: 'true',
      messages: [
        { kind: 'success', message: 'Preset saved' },
        { kind: 'warning', message: 'Two layers were skipped' },
      ],
    })
  })

  it('keeps a JSON result as the string the caller will parse itself', () => {
    const inner = JSON.stringify({ installed: true, variant: 'pro' })
    const { result } = parseHostEnvelope(JSON.stringify({ r: inner, m: [] }))
    expect(JSON.parse(result)).toEqual({ installed: true, variant: 'pro' })
  })

  it('reads a void return as an empty result', () => {
    expect(parseHostEnvelope(JSON.stringify({ r: '', m: [] }))).toEqual({
      result: '',
      messages: [],
    })
  })

  it('degrades to an empty envelope instead of throwing', () => {
    for (const raw of ['', 'EvalScript error.', '{"r":', 'null', '"a string"', '42']) {
      expect(parseHostEnvelope(raw)).toEqual({ result: '', messages: [] })
    }
  })

  it('drops entries that carry no message and keeps the rest', () => {
    const raw = JSON.stringify({
      r: '',
      m: [{ kind: 'info' }, null, { kind: 'info', message: '' }, { kind: 'error', message: 'Boom' }],
    })
    expect(parseHostEnvelope(raw).messages).toEqual([{ kind: 'error', message: 'Boom' }])
  })

  it('survives a result that is not a string and messages that are not an array', () => {
    expect(parseHostEnvelope(JSON.stringify({ r: 7, m: 'nope' }))).toEqual({
      result: '',
      messages: [],
    })
  })
})
