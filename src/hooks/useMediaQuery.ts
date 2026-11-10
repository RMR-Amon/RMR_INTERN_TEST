import { useSyncExternalStore } from 'react'

/** Subscribe to a CSS media query. */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
