import { Button as AriaButton } from 'react-aria-components'
import type { ButtonProps as AriaButtonProps } from 'react-aria-components'
import styles from './Button.module.css'

interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style'> {
  /* Buttons say what they do in their own label — nothing here is explained by
     a hover-only tooltip. Anything that needs more words gets a visible
     <Section description>. */
  /** `key` is the single primary action on a screen; `quiet` is for chrome
      (back, close, refresh); `default` is everything else. */
  variant?: 'default' | 'key' | 'quiet'
  /** Square button whose only content is an icon. Needs an aria-label. */
  iconOnly?: boolean
  /** Fill the width of its container. */
  block?: boolean
  className?: string
}

export function Button({
  variant = 'default',
  iconOnly = false,
  block = false,
  className,
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant]]
  if (iconOnly) classes.push(styles.iconOnly)
  if (block) classes.push(styles.block)
  if (className) classes.push(className)

  return <AriaButton {...props} className={classes.join(' ')} />
}
