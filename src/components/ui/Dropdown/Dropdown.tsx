import { useState, useCallback } from 'react'
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components'
import type { Key } from 'react-aria-components'
import { Icon } from '../Icon'
import styles from './Dropdown.module.css'

interface DropdownOption {
  label: string
  value: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  placeholder?: string
  searchPlaceholder?: string
  showSearch?: boolean
  onChange: (value: string, label: string) => void
  id?: string
  /** Visible label, linked to the control. Prefer this over `aria-label`. */
  label?: string
  /** Place the label beside the control instead of above it. */
  inlineLabel?: boolean
  'aria-label'?: string
}

export function Dropdown({
  options,
  value,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  showSearch = false,
  onChange,
  id,
  label,
  inlineLabel = false,
  'aria-label': ariaLabel,
}: DropdownProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = searchTerm
    ? options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (key === null) return
      const keyStr = String(key)
      const option = options.find((o) => o.value === keyStr)
      if (option) {
        onChange(option.value, option.label)
      }
      setSearchTerm('')
    },
    [options, onChange],
  )

  return (
    <Select
      className={inlineLabel ? `${styles.select} ${styles.inline}` : styles.select}
      selectedKey={value || null}
      onSelectionChange={handleSelectionChange}
      onOpenChange={(isOpen) => { if (!isOpen) setSearchTerm('') }}
      id={id}
      aria-label={label ? undefined : ariaLabel}
    >
      {label && <Label className={styles.label}>{label}</Label>}
      <Button className={styles.trigger}>
        <SelectValue className={styles.triggerValue}>
          {({ selectedText }) => (
            <span className={selectedText ? undefined : styles.placeholder}>
              {selectedText || placeholder}
            </span>
          )}
        </SelectValue>
        <Icon name="expand_more" size={20} className={styles.triggerIcon} />
      </Button>
      <Popover className={styles.popover} offset={4}>
        {showSearch && (
          <div className={styles.search}>
            <Icon name="search" size={18} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        )}
        {filteredOptions.length > 0 ? (
          <ListBox className={styles.listbox} items={filteredOptions}>
            {(item) => (
              <ListBoxItem key={item.value} id={item.value} className={styles.option} textValue={item.label}>
                {item.label}
              </ListBoxItem>
            )}
          </ListBox>
        ) : (
          <div className={styles.noResults}>No results found</div>
        )}
      </Popover>
    </Select>
  )
}
