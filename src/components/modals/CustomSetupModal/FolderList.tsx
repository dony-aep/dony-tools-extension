import { Button as AriaButton, Input, TextField } from 'react-aria-components'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import styles from './CustomSetupModal.module.css'

interface FolderListProps {
  folders: string[]
  onRename: (index: number, name: string) => void
  onRemove: (index: number) => void
  onAdd: () => void
}

/** The project folders the setup will create, editable in place. */
export function FolderList({ folders, onRename, onRemove, onAdd }: FolderListProps) {
  return (
    <div className={styles.folders}>
      {folders.map((folder, index) => (
        <div key={index} className={styles.folderRow}>
          <TextField
            className={styles.textField}
            value={folder}
            onChange={(value) => onRename(index, value)}
            aria-label={`Folder ${index + 1}`}
          >
            <Input className={styles.textInput} autoComplete="off" />
          </TextField>
          <Button
            variant="quiet"
            iconOnly
            onPress={() => onRemove(index)}
            aria-label={`Remove folder ${folder}`}
          >
            <Icon name="close" size={16} />
          </Button>
        </div>
      ))}
      <AriaButton className={styles.addFolder} onPress={onAdd}>
        <Icon name="add" size={16} />
        Add folder
      </AriaButton>
    </div>
  )
}
