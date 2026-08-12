import type { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  title: string
  /** One line explaining what the controls below do. */
  description?: string
  children: ReactNode
}

/** A titled group of controls. Sections separate themselves with a hairline. */
export function Section({ title, description, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.body}>{children}</div>
    </section>
  )
}
