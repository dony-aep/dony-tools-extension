import { useState, useEffect } from 'react'

const GITHUB_OWNER = 'dony-aep'
const GITHUB_REPO = 'dony-tools-extension'
const API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`

export interface UpdateInfo {
  hasUpdate: boolean
  latestVersion: string | null
  releaseUrl: string | null
  checking: boolean
}

/**
 * Compare two semver strings. Returns true if `latest` is newer than `current`.
 */
function isNewer(current: string, latest: string): boolean {
  const c = current.replace(/^v/, '').split('.').map(Number)
  const l = latest.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const cv = c[i] || 0
    const lv = l[i] || 0
    if (lv > cv) return true
    if (lv < cv) return false
  }
  return false
}

const TIMEOUT_MS = 8000

/**
 * The answer, kept for the whole panel session.
 *
 * This hook lives in the About tab, which App.tsx unmounts on every tab change, so without
 * the cache each visit was another request. GitHub allows 60 unauthenticated requests per
 * hour and per IP, and there is nothing to gain from spending them on a version number
 * that cannot change while the panel is open.
 */
let pending: Promise<UpdateInfo> | null = null

function fetchLatest(currentVersion: string): Promise<UpdateInfo> {
  const settled: UpdateInfo = {
    hasUpdate: false,
    latestVersion: null,
    releaseUrl: null,
    checking: false,
  }

  // A hung request would otherwise leave the tab showing "checking" for as long as the
  // panel stays open. AbortController is Chromium 66 and the floor here is 88.
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)

  return fetch(API_URL, {
    headers: { Accept: 'application/vnd.github.v3+json' },
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) throw new Error('API ' + res.status)
      return res.json()
    })
    .then((data: { tag_name: string; html_url: string }) => {
      window.clearTimeout(timer)
      return {
        hasUpdate: isNewer(currentVersion, data.tag_name),
        latestVersion: data.tag_name.replace(/^v/, ''),
        releaseUrl: data.html_url,
        checking: false,
      }
    })
    .catch(() => {
      // Offline, rate-limited or a private repo. The panel says nothing about it, and the
      // next visit to the tab is allowed to try again.
      window.clearTimeout(timer)
      pending = null
      return settled
    })
}

/**
 * Checks the latest GitHub Release and compares it against the current version.
 * Fails silently on network errors or a private repo, and never disrupts the panel.
 */
export function useUpdateChecker(currentVersion: string): UpdateInfo {
  const [state, setState] = useState<UpdateInfo>({
    hasUpdate: false,
    latestVersion: null,
    releaseUrl: null,
    checking: true,
  })

  useEffect(() => {
    let cancelled = false
    if (!pending) pending = fetchLatest(currentVersion)
    pending.then((info) => {
      if (!cancelled) setState(info)
    })

    return () => {
      cancelled = true
    }
  }, [currentVersion])

  return state
}
