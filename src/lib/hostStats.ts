/**
 * Counters for the panel's calls into the host.
 *
 * Every `evalScript` occupies After Effects' main thread, so the number of calls and how
 * long the host takes to answer are the two numbers worth watching before changing
 * anything in the bridge. They are read from outside with `shared/diagnostics/cdp-eval.mjs`
 * over the port in `public/.debug`.
 */
export interface HostCallStat {
  calls: number
  totalMs: number
  maxMs: number
  lastMs: number
  /** Calls that came back empty: an ExtendScript error, or running outside CEP. */
  empty: number
}

export interface HostStats {
  since: number
  byName: Record<string, HostCallStat>
}

/** Matches `r=ns.<name>(` inside the expression wrapHostCall builds. */
const HOST_CALL = /r=ns\.([A-Za-z0-9_]+)\(/

/** The host function's name ("loadPresets", "getTwixtorInfo"...), or "other". */
export function hostCallName(script: string): string {
  const match = HOST_CALL.exec(script)
  return match ? match[1] : 'other'
}

export function createHostStats(now: number): HostStats {
  return { since: now, byName: {} }
}

// Mutates on purpose: these are diagnostic counters, not React state.
export function recordCall(stats: HostStats, name: string, ms: number, empty: boolean): void {
  const stat =
    stats.byName[name] ??
    (stats.byName[name] = { calls: 0, totalMs: 0, maxMs: 0, lastMs: 0, empty: 0 })
  stat.calls += 1
  stat.totalMs += ms
  stat.lastMs = ms
  if (ms > stat.maxMs) stat.maxMs = ms
  if (empty) stat.empty += 1
}
