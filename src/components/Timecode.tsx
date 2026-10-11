import { useEffect, useRef } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

/** A camera timecode (HH:MM:SS:FF at 24 fps) counting from page load. */
export function Timecode() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t0 = performance.now()
    const id = window.setInterval(() => {
      const t = (performance.now() - t0) / 1000
      const f = Math.floor((t % 1) * 24)
      const s = Math.floor(t)
      if (ref.current)
        ref.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`
    }, 1000 / 24)
    return () => window.clearInterval(id)
  }, [])
  return <span ref={ref}>00:00:00:00</span>
}
