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

/**
 * Checks the latest GitHub Release and compares it against the current version.
 * Silently fails on network errors or private repo (no UI disruption).
 * Compatible with Chrome 57 (no AbortController).
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

    fetch(API_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
      .then(function (res) {
        if (!res.ok) throw new Error('API ' + res.status)
        return res.json()
      })
      .then(function (data: { tag_name: string; html_url: string }) {
        if (cancelled) return
        const tag = data.tag_name
        setState({
          hasUpdate: isNewer(currentVersion, tag),
          latestVersion: tag.replace(/^v/, ''),
          releaseUrl: data.html_url,
          checking: false,
        })
      })
      .catch(function () {
        if (cancelled) return
        setState(function (prev) {
          return { ...prev, checking: false }
        })
      })

    return function () {
      cancelled = true
    }
  }, [currentVersion])

  return state
}
