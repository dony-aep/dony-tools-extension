import { useEffect } from 'react'
import { deriveTheme, THEME_VARS, type HostSkin } from '../lib/theme'

/**
 * Paints the panel with After Effects' own UI greys and keeps them in sync with
 * the host's brightness slider.
 *
 * Outside CEP (the Vite preview) nothing is applied and the defaults in
 * tokens.css stand, so the panel still renders in a browser.
 */
export function useHostTheme() {
  useEffect(() => {
    // `CSInterface` alone is not enough of a test: index.html loads the library
    // as a plain script, so the class exists in the Vite preview too. What it
    // needs underneath is the native bridge, and without it `addEventListener`
    // below throws and takes the whole panel down with it.
    if (typeof CSInterface === 'undefined' || !('__adobe_cep__' in window)) return

    let cs: CSInterface
    try {
      cs = new CSInterface()
    } catch {
      return
    }

    const apply = () => {
      let skinInfo
      try {
        skinInfo = cs.getHostEnvironment()?.appSkinInfo
      } catch {
        return
      }
      const panel = skinInfo?.panelBackgroundColor?.color
      if (!panel) return

      const highlight = skinInfo.systemHighlightColor as HostSkin | undefined
      const theme = deriveTheme(panel as HostSkin, highlight)

      const root = document.documentElement
      for (const key of Object.keys(THEME_VARS) as (keyof typeof THEME_VARS)[]) {
        root.style.setProperty(THEME_VARS[key], theme[key])
      }
    }

    apply()

    // After Effects fires this when the user moves the UI brightness slider.
    const onThemeChange = () => apply()
    cs.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onThemeChange)

    return () => {
      cs.removeEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onThemeChange)
    }
  }, [])
}
