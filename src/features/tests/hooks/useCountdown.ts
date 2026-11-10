import { useEffect, useRef, useState } from 'react'

/**
 * Seconds left until `expiresAt`, corrected by the server clock offset.
 * Calls onExpire exactly once when the time runs out.
 */
export const useCountdown = (expiresAt: string | undefined, clockOffset: number, onExpire: () => void) => {
  const compute = () =>
    expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - (Date.now() + clockOffset)) / 1000)) : 0

  const [remaining, setRemaining] = useState(compute)
  const firedRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    if (!expiresAt) return
    firedRef.current = false
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - (Date.now() + clockOffset)) / 1000),
      )
      setRemaining(left)
      if (left === 0 && !firedRef.current) {
        firedRef.current = true
        onExpireRef.current()
      }
    }
    tick()
    const id = window.setInterval(tick, 500)
    return () => window.clearInterval(id)
  }, [expiresAt, clockOffset])

  return remaining
}
