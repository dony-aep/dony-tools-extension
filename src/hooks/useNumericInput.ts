import { useCallback } from 'react'
import { useApp } from '../context/AppContext'

/** True when the string parses as a finite number. Empty string is not numeric. */
export function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value))
}

/**
 * Shared handler for the panel's numeric fields: lets the field go empty while
 * the user is typing, but rejects anything non-numeric with a toast and snaps
 * the field back to its default. Validation is pure UI, so it no longer takes
 * a round trip through the host just to raise a dialog.
 *
 * Twixtor and Anchor Point had byte-identical copies of this.
 */
export function useNumericInput() {
  const { notify } = useApp()

  return useCallback(
    (value: string, setter: (v: string) => void, defaultValue: string) => {
      if (value !== '' && !isNumeric(value)) {
        notify(`"${value}" is not a number. Reset to ${defaultValue}.`, 'warning')
        setter(defaultValue)
        return
      }
      setter(value)
    },
    [notify],
  )
}
