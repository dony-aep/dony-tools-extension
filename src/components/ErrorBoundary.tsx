import { Component, type ReactNode } from 'react'

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
        <div style={{
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          height: '100%',
          textAlign: 'center',
          color: '#7a7a7a',
          fontFamily: 'Google Sans, system-ui, sans-serif',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#f44336' }}>
            error
          </span>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ededed' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: '11px', lineHeight: 1.4, maxWidth: '260px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={this.handleReload} style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#ffffff',
              color: '#0c0c0c',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}>
              Reload Panel
            </button>
            <button onClick={this.handleDismiss} style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 500,
              background: '#1e1e1e',
              color: '#ededed',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}>
              Dismiss
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
