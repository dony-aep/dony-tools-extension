interface IconProps {
  /** Material Symbols glyph name, e.g. "arrow_back". Must be in the subset
      listed in src/styles/fonts.css. */
  name: string
  /** Font size in px (Material Symbols are square). */
  size?: number
  className?: string
}

/**
 * Material Symbols glyph. Always decorative — the interactive parent carries
 * the accessible name, so the glyph is hidden from assistive technology.
 */
export function Icon({ name, size = 18, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={className ? `material-symbols-outlined ${className}` : 'material-symbols-outlined'}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  )
}
