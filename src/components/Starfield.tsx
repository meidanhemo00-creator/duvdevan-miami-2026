import { useEffect, useRef } from 'react'
import './Starfield.css'

type Star = {
  x: number // 0..1 of width
  y: number // 0..1 of height
  r: number // radius in CSS px
  depth: number // 0.15 (far) .. 1 (near)
  base: number // base alpha
  amp: number // twinkle amplitude 0..1
  speed: number // radians per second: very slow
  phase: number
  tint: 0 | 1 // 0 warm white, 1 faint wine
}

type Props = {
  /** Roughly how many stars per 10,000 CSS px² of canvas. */
  density?: number
  /** Share of the canvas height (from the top) the stars occupy. */
  horizon?: number
  seed?: number
  className?: string
}

/** Deterministic PRNG so the sky is the same on every visit. */
function prng(seed: number) {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function makeStars(count: number, horizon: number, seed: number): Star[] {
  const r = prng(seed)
  return Array.from({ length: count }, () => {
    const layer = r()
    // 72% far and faint, 21% middle, 7% near and brighter.
    const depth = layer < 0.72 ? 0.15 + r() * 0.15 : layer < 0.93 ? 0.4 + r() * 0.2 : 0.8 + r() * 0.2
    return {
      x: r(),
      // Denser toward the top: city light washes out the low sky.
      y: Math.pow(r(), 1.5) * horizon,
      r: depth < 0.35 ? 0.35 + r() * 0.35 : depth < 0.7 ? 0.6 + r() * 0.4 : 0.9 + r() * 0.7,
      depth,
      base: depth < 0.35 ? 0.25 + r() * 0.35 : 0.45 + r() * 0.45,
      amp: 0.15 + r() * 0.5,
      speed: 0.12 + r() * 0.45,
      phase: r() * Math.PI * 2,
      tint: r() < 0.06 ? 1 : 0,
    }
  })
}

/** Soft round sprite, drawn once and stamped for every star. */
function makeSprite(rgb: string) {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(${rgb},1)`)
  grad.addColorStop(0.18, `rgba(${rgb},0.85)`)
  grad.addColorStop(0.4, `rgba(${rgb},0.18)`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

/**
 * The night sky over the hero. Canvas 2D, one rAF loop that only runs while
 * the sky is on screen and the tab is visible. Pointer and scroll parallax
 * are eased toward their targets (no snapping). Reduced motion: one still frame.
 */
export function Starfield({ density = 1.6, horizon = 0.62, seed = 20261101, className = '' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const sprites = [makeSprite('246,240,232'), makeSprite('214,150,156')]

    let w = 0
    let h = 0
    let dpr = 1
    let stars: Star[] = []
    let raf = 0
    let running = false
    let visible = true
    const start = performance.now()

    // Parallax state: targets are set by input, current values ease toward them.
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let drift = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const count = Math.round(((w * h) / 10000) * density)
      stars = makeStars(Math.min(count, 520), horizon, seed)
      if (!running) draw(performance.now())
    }

    const draw = (now: number) => {
      const t = (now - start) / 1000
      // Stars arrive over ~2.4s on first paint (they are atmosphere, not content).
      const intro = reduce ? 1 : Math.min(1, t / 2.4)
      const ease = 1 - Math.pow(1 - intro, 3)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const tw = reduce ? 1 : 1 - s.amp + s.amp * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        const a = s.base * tw * ease
        if (a < 0.02) continue
        // Parallax: nearer stars move more. Drift wraps horizontally.
        let x = s.x * w + current.x * s.depth + drift * s.depth
        x = ((x % w) + w) % w
        const y = s.y * h + current.y * s.depth
        const d = s.r * 6 // sprite core is ~1/6 of its box
        ctx.globalAlpha = a
        ctx.drawImage(sprites[s.tint], x - d / 2, y - d / 2, d, d)
      }
      ctx.globalAlpha = 1
    }

    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      drift += dt * 1.6 // px/s at depth 1: barely perceptible
      target.y = -Math.min(window.scrollY, h) * 0.18
      const k = 1 - Math.pow(0.02, dt) // frame-rate independent easing
      current.x += (target.x - current.x) * k
      current.y += (target.y - current.y) * k
      draw(now)
      raf = requestAnimationFrame(loop)
    }

    const play = () => {
      if (running || reduce || !visible || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * -28
    }
    const onVisibility = () => (document.hidden ? pause() : play())

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) play()
      else pause()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)
    if (finePointer && !reduce) window.addEventListener('pointermove', onPointer, { passive: true })

    resize()
    play()

    return () => {
      pause()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [density, horizon, seed])

  return <canvas ref={ref} className={`starfield ${className}`} aria-hidden />
}
