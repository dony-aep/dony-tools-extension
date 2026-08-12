import { Input, Label, TextField } from 'react-aria-components'
import styles from './ValueField.module.css'

interface ValueFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** Fixed suffix shown inside the field, e.g. "%" or "fps" or "px". */
  unit?: string
  id?: string
}

/**
 * Numeric field: eyebrow label inside the frame, value set large and tabular,
 * unit pinned to the right edge. The whole frame is the label's hit area.
 */
export function ValueField({ label, value, onChange, unit, id }: ValueFieldProps) {
  return (
    <TextField value={value} onChange={onChange} className={styles.field}>
      <Label className={styles.label}>{label}</Label>
      <div className={styles.row}>
        <Input id={id} className={styles.input} inputMode="decimal" autoComplete="off" />
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </TextField>
  )
}
