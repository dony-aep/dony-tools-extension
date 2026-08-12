import { Component, type ReactNode } from 'react'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('dony Tools crashed:', error, info.componentStack)
  }

  handleReload = () => {
    location.reload()
  }

  handleDismiss = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.screen} role="alert">
          <Icon name="error" size={32} className={styles.icon} />
          <div className={styles.title}>Something went wrong</div>
          <div className={styles.detail}>
            {this.state.error?.message || 'The panel hit an unexpected error.'}
          </div>
          <div className={styles.actions}>
            <Button variant="key" onPress={this.handleReload}>
              Reload panel
            </Button>
            <Button onPress={this.handleDismiss}>Dismiss</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
