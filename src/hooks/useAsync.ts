import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { toAppError, type AppError } from '@/services/supabase/errors'

interface AsyncState<T> {
  data: T | undefined
  error: AppError | null
  loading: boolean
  reload: () => void
  setData: (updater: T | ((prev: T | undefined) => T)) => void
}

const sameDeps = (a: DependencyList, b: DependencyList) =>
  a.length === b.length && a.every((value, i) => Object.is(value, b[i]))

interface Result<T> {
  token: object
  data: T | undefined
  error: AppError | null
}

/**
 * Small data-loading hook with cancellation of stale responses.
 * Keeps previous data while reloading (no flicker on pagination / filters).
 *   const { data, loading, error, reload } = useAsync(() => api.list(), [])
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)

  // A new token identifies every request (deps change or manual reload).
  // Derived during render (React's "store previous props" pattern).
  const [tracked, setTracked] = useState(() => ({ deps, nonce, token: {} as object }))
  let token = tracked.token
  if (tracked.nonce !== nonce || !sameDeps(tracked.deps, deps)) {
    token = {}
    setTracked({ deps, nonce, token })
  }

  useEffect(() => {
    let cancelled = false
    loader()
      .then((data) => {
        if (!cancelled) setResult({ token, data, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) setResult((prev) => ({ token, data: prev?.data, error: toAppError(err) }))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setResult((prev) => {
      const current = prev?.data
      const next = typeof updater === 'function' ? (updater as (p: T | undefined) => T)(current) : updater
      return { token: prev?.token ?? {}, data: next, error: null }
    })
  }, [])

  const settled = result?.token === token
  return {
    data: result?.data,
    error: settled ? (result?.error ?? null) : null,
    loading: !settled,
    reload,
    setData,
  }
}
