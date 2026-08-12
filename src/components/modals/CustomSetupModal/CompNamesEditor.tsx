import { Input, TextField } from 'react-aria-components'
import { Button } from '../../ui/Button'
import { Dropdown } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import type { CompEntry } from '../../../lib/setup'
import styles from './CustomSetupModal.module.css'

interface CompNamesEditorProps {
  comps: CompEntry[]
  /** Project folders the comps can be filed into. */
  folders: string[]
  onChange: (index: number, key: keyof CompEntry, value: string) => void
  onClose: () => void
}

/** Names the compositions and picks the folder each one lands in. */
export function CompNamesEditor({ comps, folders, onChange, onClose }: CompNamesEditorProps) {
  const folderOptions = [
    { label: 'None', value: '' },
    ...folders.map((f) => ({ label: f.trim(), value: f.trim() })),
  ]

  return (
    <div className={styles.comps}>
      <div className={styles.compsHeader}>
        <h4 className={styles.sectionTitle}>Names &amp; folders</h4>
        <Button
          variant="quiet"
          iconOnly
          onPress={onClose}
          aria-label="Hide composition names and folders"
        >
          <Icon name="close" size={18} />
        </Button>
      </div>
      <div className={styles.compsList}>
        {comps.map((entry, index) => (
          <div key={index} className={styles.comp}>
            <span className={styles.compLabel}>Comp {index + 1}</span>
            <TextField
              className={styles.textField}
              value={entry.name}
              onChange={(value) => onChange(index, 'name', value)}
              aria-label={`Name for composition ${index + 1}`}
            >
              <Input className={styles.textInput} autoComplete="off" />
            </TextField>
            <Dropdown
              options={folderOptions}
              value={entry.folder}
              placeholder="None"
              onChange={(value) => onChange(index, 'folder', value)}
              aria-label={`Folder for composition ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
