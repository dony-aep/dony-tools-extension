import { Button } from '../../ui/Button'
import { Dropdown } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import styles from './CustomSetupModal.module.css'

interface PresetBarProps {
  names: string[]
  selected: string
  onSelect: (name: string) => void
  onLoad: () => void
  onDelete: () => void
  onRefresh: () => void
  /** Shows "Loaded" for a moment after a successful load. */
  justLoaded: boolean
}

/** Pick a saved preset and load, delete or re-read it. */
export function PresetBar({
  names,
  selected,
  onSelect,
  onLoad,
  onDelete,
  onRefresh,
  justLoaded,
}: PresetBarProps) {
  const options = names.map((name) => ({ label: name, value: name }))

  return (
    <div className={styles.stack}>
      <Dropdown
        options={options}
        value={selected}
        placeholder="Select Preset..."
        searchPlaceholder="Search presets..."
        showSearch
        onChange={onSelect}
        aria-label="Saved preset"
      />
      <div className={styles.presetActions}>
        <Button onPress={onLoad} isDisabled={justLoaded} aria-label="Load the selected preset">
          {justLoaded ? (
            <>
              <Icon name="check" size={16} />
              Loaded
            </>
          ) : (
            'Load'
          )}
        </Button>
        <Button onPress={onDelete} aria-label="Delete the selected preset permanently">
          Delete
        </Button>
        <Button
          iconOnly
          onPress={onRefresh}
          aria-label="Refresh the list of presets from file"
        >
          <Icon name="refresh" size={18} />
        </Button>
      </div>
    </div>
  )
}
