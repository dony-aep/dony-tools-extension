import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { escapeForEval, toEvalLiteral } from './useCSInterface'
import type { SetupSettings } from '../lib/setup'

export type PresetMap = Record<string, Partial<SetupSettings>>

/**
 * Saved composition presets, read from and written to the host's presets file.
 *
 * Names are user text and are escaped before they reach ExtendScript: an
 * unescaped quote there is a syntax error, and After Effects answers a
 * malformed script with a modal dialog.
 */
export function usePresets() {
  const { evalHostScript } = useApp()
  const [presets, setPresets] = useState<PresetMap>({})

  const reload = useCallback(async () => {
    const result = await evalHostScript('loadPresets()')
    try {
      setPresets(JSON.parse(result || '{}') as PresetMap)
    } catch {
      setPresets({})
    }
  }, [evalHostScript])

  useEffect(() => {
    reload()
  }, [reload])

  const get = useCallback(
    async (name: string): Promise<Partial<SetupSettings> | null> => {
      // Re-read rather than trusting the cache: the file may have changed
      // outside the panel.
      const result = await evalHostScript('loadPresets()')
      try {
        const all = JSON.parse(result || '{}') as PresetMap
        return all[name] ?? null
      } catch {
        return null
      }
    },
    [evalHostScript],
  )

  const save = useCallback(
    async (name: string, settings: SetupSettings): Promise<boolean> => {
      const result = await evalHostScript(
        `savePreset("${escapeForEval(name)}", ${toEvalLiteral(settings)})`,
      )
      if (result === 'true') {
        await reload()
        return true
      }
      return false
    },
    [evalHostScript, reload],
  )

  const remove = useCallback(
    async (name: string): Promise<boolean> => {
      const result = await evalHostScript(`deletePreset("${escapeForEval(name)}")`)
      if (result === 'true') {
        await reload()
        return true
      }
      return false
    },
    [evalHostScript, reload],
  )

  return { presets, names: Object.keys(presets), reload, get, save, remove }
}
