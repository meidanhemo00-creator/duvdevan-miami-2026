import { useEffect, useRef } from 'react'
import './Dust.css'

type Mote = {
  x: number // 0..1
  y: number // 0..1
  r: number // px
  depth: number // 0.2 far .. 1 near
  a: number // base alpha
  vx: number // px/s at depth 1
  vy: number
  phase: number
  blur: boolean // near the lens: big and soft
}

function prng(seed: number) {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/** Soft disc sprite, drawn once, stamped for every mote. */
function sprite(soft: boolean) {
  const n = 64
  const c = document.createElement('canvas')
  c.width = c.height = n
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2)
  const col = '226,216,192'
  grad.addColorStop(0, `rgba(${col},1)`)
  grad.addColorStop(soft ? 0.35 : 0.5, `rgba(${col},${soft ? 0.5 : 0.9})`)
  grad.addColorStop(1, `rgba(${col},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, n, n)
  return c
}

/**
 * Dust and ash hanging in the air: fine specks drifting on a slow wind that
 * gusts now and then, and a few big out-of-focus motes close to the lens.
 * Canvas 2D, one rAF loop that runs only while on screen. Reduced motion:
 * one still frame.
 */
export function Dust({ density = 1, seed = 1948, className = '' }: { density?: number; seed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hard = sprite(false)
    const soft = sprite(true)

    let w = 0
    let h = 0
    let dpr = 1
    let motes: Mote[] = []
    let raf = 0
    let running = false
    const t0 = performance.now()

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const rand = prng(seed)
      const count = Math.min(420, Math.round(((w * h) / 6000) * density))
      motes = Array.from({ length: count }, () => {
        const blur = rand() < 0.035
        const depth = blur ? 1 : 0.2 + rand() * 0.7
        return {
          x: rand(),
          y: rand(),
          r: blur ? 6 + rand() * 14 : 0.4 + depth * 1.6 * rand() + 0.3,
          depth,
          a: blur ? 0.05 + rand() * 0.08 : 0.15 + rand() * 0.45,
          vx: 8 + rand() * 18,
          vy: -3 + rand() * 7,
          phase: rand() * Math.PI * 2,
          blur,
        }
      })
      if (!running) draw(performance.now())
    }

    const draw = (now: number) => {
      const t = (now - t0) / 1000
      // Wind: a steady drift with slow gusts.
      const gust = reduce ? 0 : 1 + 0.8 * Math.max(0, Math.sin(t * 0.21)) ** 3
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        const dx = reduce ? 0 : t * m.vx * m.depth * gust
        const dy = reduce ? 0 : t * m.vy * m.depth + Math.sin(t * 0.7 + m.phase) * 6 * m.depth
        const x = ((((m.x * w + dx) % (w + 40)) + w + 40) % (w + 40)) - 20
        const y = ((((m.y * h + dy) % (h + 40)) + h + 40) % (h + 40)) - 20
        const flicker = reduce ? 1 : 0.75 + 0.25 * Math.sin(t * 2.1 + m.phase * 3)
        const d = m.r * (m.blur ? 2 : 3)
        ctx.globalAlpha = m.a * flicker
        ctx.drawImage(m.blur ? soft : hard, x - d / 2, y - d / 2, d, d)
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    const play = () => {
      if (running || reduce || document.hidden) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const onVis = () => (document.hidden ? pause() : play())

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause()))
    io.observe(canvas)
    document.addEventListener('visibilitychange', onVis)
    resize()
    return () => {
      pause()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [density, seed])

  return <canvas ref={ref} className={`dust ${className}`} aria-hidden />
}
