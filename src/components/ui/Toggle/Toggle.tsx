import { Checkbox } from 'react-aria-components'
import styles from './Toggle.module.css'

interface ToggleProps {
  label: string
  isSelected: boolean
  onChange: (isSelected: boolean) => void
}

export function Toggle({ label, isSelected, onChange }: ToggleProps) {
  return (
    <Checkbox
      className={styles.toggle}
      isSelected={isSelected}
      onChange={onChange}
    >
      <span className={styles.box}>
        <svg className={styles.check} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1.5 5.2 L3.9 7.5 L8.5 2.5" />
        </svg>
      </span>
      {label}
    </Checkbox>
  )
}
