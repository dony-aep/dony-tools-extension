import { useState, useCallback } from 'react'
import { Button, Input, TextField, Label } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import styles from './AnchorPointTab.module.css'

// Map anchor positions to Material Symbols icon names
const ANCHOR_ICONS: Record<string, string> = {
  topLeft: 'north_west',
  top: 'north',
  topRight: 'north_east',
  left: 'west',
  center: 'filter_center_focus',
  right: 'east',
  bottomLeft: 'south_west',
  bottom: 'south',
  bottomRight: 'south_east',
}

type AnchorPosition = keyof typeof ANCHOR_ICONS

const ANCHOR_POSITIONS: AnchorPosition[] = [
  'topLeft', 'top', 'topRight',
  'left', 'center', 'right',
  'bottomLeft', 'bottom', 'bottomRight',
]

export function AnchorPointTab() {
  const [offsetX, setOffsetX] = useState('0')
  const [offsetY, setOffsetY] = useState('0')
  const { evalScript } = useApp()

  const isNumeric = (value: string) => !isNaN(parseFloat(value)) && isFinite(Number(value))

  const handleAnchorClick = useCallback(
    async (position: AnchorPosition) => {
      if (!isNumeric(offsetX) || !isNumeric(offsetY)) {
        await evalScript('showOffsetAlert()')
        setOffsetX('0')
        setOffsetY('0')
        return
      }

      const validationResult = await evalScript(
        `validateOffsetValues(${offsetX}, ${offsetY})`,
      )
      if (validationResult === 'valid') {
        const result = await evalScript(
          `moveAnchorPoint("${position}", ${offsetX}, ${offsetY})`,
        )
        console.log('Move anchor result:', result)
      }
    },
    [offsetX, offsetY, evalScript],
  )

  const handleResetAnchor = useCallback(async () => {
    const result = await evalScript('resetAnchorPoint()')
    console.log('Reset anchor result:', result)
  }, [evalScript])

  const handleResetOffset = useCallback(() => {
    setOffsetX('0')
    setOffsetY('0')
  }, [])

  const handleNumericInput = useCallback(
    async (value: string, setter: (v: string) => void, defaultVal: string) => {
      if (value !== '' && !isNumeric(value)) {
        await evalScript('showNumericAlert()')
        setter(defaultVal)
        return
      }
      setter(value)
    },
    [evalScript],
  )

  return (
    <div className={styles.tab} id="anchor">
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Move Anchor Point</h3>
        <div className={styles.grid}>
          {ANCHOR_POSITIONS.map((position) => (
            <Button
              key={position}
              className={styles.anchorBtn}
              onPress={() => handleAnchorClick(position)}
              aria-label={`Move anchor to ${position.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            >
              <span className={`material-symbols-outlined ${styles.anchorIcon}`}>{ANCHOR_ICONS[position]}</span>
            </Button>
          ))}
        </div>

        <div className={styles.offsetControls}>
          <div className={styles.offsetGroup} title="Horizontal offset in pixels from the anchor position">
            <TextField
              value={offsetX}
              onChange={(value) => handleNumericInput(value, setOffsetX, '0')}
              aria-label="Horizontal offset in pixels"
            >
              <Label className={styles.offsetLabel}>Offset X:</Label>
              <Input />
            </TextField>
          </div>
          <div className={styles.offsetGroup} title="Vertical offset in pixels from the anchor position">
            <TextField
              value={offsetY}
              onChange={(value) => handleNumericInput(value, setOffsetY, '0')}
              aria-label="Vertical offset in pixels"
            >
              <Label className={styles.offsetLabel}>Offset Y:</Label>
              <Input />
            </TextField>
          </div>
        </div>

        <div className={styles.controls}>
          <span title="Reset X and Y offset values to 0">
            <Button onPress={handleResetOffset}>
              Reset Offset
            </Button>
          </span>
          <span title="Reset anchor point to the layer's center">
            <Button onPress={handleResetAnchor}>
              Reset Anchor
            </Button>
          </span>
        </div>
      </div>
    </div>
  )
}
