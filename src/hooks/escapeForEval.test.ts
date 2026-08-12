import { describe, it, expect } from 'vitest'
import { escapeForEval, toEvalLiteral } from './useCSInterface'

// Built via fromCharCode so this source file stays pure ASCII (no invisible literals).
const LS = String.fromCharCode(0x2028) // U+2028 line separator
const PS = String.fromCharCode(0x2029) // U+2029 paragraph separator

describe('escapeForEval', () => {
  it('passes plain text through untouched, spaces included', () => {
    expect(escapeForEval('H.264 - Match Render Settings - 15 Mbps')).toBe(
      'H.264 - Match Render Settings - 15 Mbps',
    )
  })

  // Regression: an output module template named `H.264 "High"` produced a
  // malformed script, and After Effects answers that with a modal dialog that
  // blocks its scripting engine until the user dismisses it.
  it('escapes double quotes', () => {
    expect(escapeForEval('H.264 "High"')).toBe('H.264 \\"High\\"')
  })

  it('escapes single quotes, so either quote style is safe at the call site', () => {
    expect(escapeForEval("Dony's preset")).toBe("Dony\\'s preset")
  })

  // Regression: a backslash was consumed as an escape, so the host silently
  // looked up a different name and reported "not found".
  it('escapes backslashes', () => {
    expect(escapeForEval('back\\slash')).toBe('back\\\\slash')
  })

  it('escapes both in the same value', () => {
    expect(escapeForEval('quote"and\\both')).toBe('quote\\"and\\\\both')
  })

  it('escapes newlines and carriage returns', () => {
    expect(escapeForEval('line1\nline2\rline3')).toBe('line1\\nline2\\rline3')
  })

  it('escapes U+2028 / U+2029, which terminate an ExtendScript literal', () => {
    expect(escapeForEval('a' + LS + 'b')).toBe('a\\u2028b')
    expect(escapeForEval('a' + PS + 'b')).toBe('a\\u2029b')
  })

  it('leaves an empty string alone', () => {
    expect(escapeForEval('')).toBe('')
  })

  it('produces output that survives a round trip through a JS parser', () => {
    // The host embeds the result inside "..."; evaluating it must give the
    // original string back.
    for (const value of ['H.264 "High"', 'back\\slash', "Dony's", 'a' + LS + 'b']) {
      const source = '"' + escapeForEval(value) + '"'
      expect(JSON.parse(source.replace(/\\'/g, "'"))).toBe(value)
    }
  })
})

describe('toEvalLiteral', () => {
  it('serialises objects as JSON', () => {
    expect(toEvalLiteral({ width: 1920, height: 1080 })).toBe('{"width":1920,"height":1080}')
  })

  it('leaves quotes and backslashes to JSON, which already escapes them', () => {
    expect(toEvalLiteral({ name: 'a"b\\c' })).toBe('{"name":"a\\"b\\\\c"}')
  })

  // JSON.stringify leaves these raw; ExtendScript treats them as line
  // terminators, so a folder name pasted from the web would break the call.
  it('escapes U+2028 / U+2029 that JSON.stringify leaves raw', () => {
    expect(toEvalLiteral({ folder: 'a' + LS + 'b' })).toBe('{"folder":"a\\u2028b"}')
    expect(toEvalLiteral({ folder: 'a' + PS + 'b' })).toBe('{"folder":"a\\u2029b"}')
  })

  it('handles arrays of folder names', () => {
    expect(toEvalLiteral(['Comps', 'Main Comps'])).toBe('["Comps","Main Comps"]')
  })
})
