import { useState, useCallback } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import { isNumeric, useNumericInput } from '../../../hooks/useNumericInput'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { ValueField } from '../../ui/ValueField'
import styles from './AnchorPointTab.module.css'

// Each cell: the Material Symbols arrow that points at it, and the name used
// in its accessible label.
const ANCHOR_CELLS: { position: string; icon: string; label: string }[] = [
  { position: 'topLeft', icon: 'north_west', label: 'top left' },
  { position: 'top', icon: 'north', label: 'top' },
  { position: 'topRight', icon: 'north_east', label: 'top right' },
  { position: 'left', icon: 'west', label: 'left' },
  { position: 'center', icon: 'filter_center_focus', label: 'center' },
  { position: 'right', icon: 'east', label: 'right' },
  { position: 'bottomLeft', icon: 'south_west', label: 'bottom left' },
  { position: 'bottom', icon: 'south', label: 'bottom' },
  { position: 'bottomRight', icon: 'south_east', label: 'bottom right' },
]

export function AnchorPointTab() {
  const [offsetX, setOffsetX] = useState('0')
  const [offsetY, setOffsetY] = useState('0')
  const { evalHostScript, notify } = useApp()

  const handleNumericInput = useNumericInput()

  const handleAnchorClick = useCallback(
    async (position: string) => {
      if (!isNumeric(offsetX) || !isNumeric(offsetY)) {
        notify('Offsets need numbers. Both reset to 0.', 'warning')
        setOffsetX('0')
        setOffsetY('0')
        return
      }

      const validationResult = await evalHostScript(
        `validateOffsetValues(${offsetX}, ${offsetY})`,
      )
      if (validationResult === 'valid') {
        const result = await evalHostScript(
          `moveAnchorPoint("${position}", ${offsetX}, ${offsetY})`,
        )
        console.log('Move anchor result:', result)
      }
    },
    [offsetX, offsetY, evalHostScript, notify],
  )

  const handleResetAnchor = useCallback(async () => {
    const result = await evalHostScript('resetAnchorPoint()')
    console.log('Reset anchor result:', result)
  }, [evalHostScript])

  const handleResetOffset = useCallback(() => {
    setOffsetX('0')
    setOffsetY('0')
  }, [])


  return (
    <div className={styles.tab}>
      <Section title="Move anchor point">
        <div className={styles.pad}>
          {ANCHOR_CELLS.map((cell) => (
            <AriaButton
              key={cell.position}
              className={styles.target}
              onPress={() => handleAnchorClick(cell.position)}
              aria-label={`Move anchor point to ${cell.label}`}
            >
              <Icon name={cell.icon} size={20} />
            </AriaButton>
          ))}
        </div>
      </Section>

      <Section title="Offset" description="Applied when you pick a position above.">
        <div className={styles.offsets}>
          <ValueField
            label="X"
            value={offsetX}
            onChange={(value) => handleNumericInput(value, setOffsetX, '0')}
            unit="px"
          />
          <ValueField
            label="Y"
            value={offsetY}
            onChange={(value) => handleNumericInput(value, setOffsetY, '0')}
            unit="px"
          />
        </div>

        <div className={styles.actions}>
          <Button onPress={handleResetOffset}>Reset offset</Button>
          <Button onPress={handleResetAnchor}>Reset anchor</Button>
        </div>
      </Section>
    </div>
  )
}
