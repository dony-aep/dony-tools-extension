/**
 * One round trip per host call.
 *
 * Every `evalScript` runs on After Effects' main thread, which neither draws nor responds
 * until it returns. The panel used to pay that twice per action: once for the tool and
 * once for `takeMessages()` to collect the notices it queued. `envelope()` in
 * hostscript.jsx now returns both, and these helpers build the call and unpack the answer.
 */

/** A notice the host queued with `report()`. `kind` is validated by the toast layer. */
export interface HostMessage {
  kind: string
  message: string
}

export interface HostEnvelope {
  /** What the host function returned, as a string. Void returns arrive as ''. */
  result: string
  messages: HostMessage[]
}

/** Returned verbatim by the wrapper when the host JSX never loaded. */
export const HOST_NOT_LOADED = 'hostscript_not_loaded'

/**
 * Builds the ExtendScript expression for one host call.
 *
 * `call` is source text, not an argument list, so anything the user typed must already
 * have gone through `escapeForEval` or `toEvalLiteral` by the time it gets here.
 *
 * The `catch` is what the tools themselves do not cover: each one wraps its body, but a
 * throw that escapes anyway would otherwise reach the panel as an opaque CEP error string
 * and leave the user looking at a button that did nothing.
 */
export function wrapHostCall(namespace: string, call: string): string {
  return (
    `(function(){var ns=$.global.${namespace};` +
    `if(!ns)return "${HOST_NOT_LOADED}";` +
    `var r;try{r=ns.${call};}catch(e){ns.report("error","Host call failed: "+e.toString());r="";}` +
    `return ns.envelope(r);})()`
  )
}

/**
 * Unpacks what `wrapHostCall` produced.
 *
 * Anything unexpected degrades to an empty result with no messages: a malformed answer
 * must never take down the action that just ran, and the caller already treats '' as "the
 * host said nothing".
 */
export function parseHostEnvelope(raw: string): HostEnvelope {
  const empty: HostEnvelope = { result: '', messages: [] }
  if (!raw) return empty

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return empty
  }
  if (typeof parsed !== 'object' || parsed === null) return empty

  const { r, m } = parsed as { r?: unknown; m?: unknown }
  const messages = Array.isArray(m)
    ? m.filter(
        (entry): entry is HostMessage =>
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as HostMessage).message === 'string' &&
          (entry as HostMessage).message !== '',
      )
    : []

  return { result: typeof r === 'string' ? r : '', messages }
}
