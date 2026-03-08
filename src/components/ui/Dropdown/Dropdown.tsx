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
  label?: string
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
      className={styles.select}
      selectedKey={value || null}
      onSelectionChange={handleSelectionChange}
      onOpenChange={(isOpen) => { if (!isOpen) setSearchTerm('') }}
      id={id}
      aria-label={ariaLabel}
    >
      {label && <Label>{label}</Label>}
      <Button className={styles.trigger}>
        <SelectValue className={styles.triggerValue}>
          {({ selectedText }) => (
            <span className={selectedText ? undefined : styles.placeholder}>
              {selectedText || placeholder}
            </span>
          )}
        </SelectValue>
        <span className={`material-symbols-outlined ${styles.triggerIcon}`}>expand_more</span>
      </Button>
      <Popover className={styles.popover} offset={4}>
        {showSearch && (
          <div className={styles.search}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
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
