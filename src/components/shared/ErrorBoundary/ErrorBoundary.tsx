import { Component, type ErrorInfo, type ReactNode } from 'react'
import { getDictionary } from '@/locales'
import { Button, EmptyState } from '@/components/ui'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render errors in a subtree and shows a friendly fallback. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const t = getDictionary()
    return (
      <div style={{ padding: '4rem 1rem' }}>
        <EmptyState
          icon={<AlertTriangle />}
          title={t.errors.boundaryTitle}
          text={t.errors.boundaryText}
          action={<Button onClick={() => window.location.reload()}>{t.errors.reload}</Button>}
        />
      </div>
    )
  }
}
