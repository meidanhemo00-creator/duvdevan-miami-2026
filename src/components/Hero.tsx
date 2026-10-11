import { useEffect, useRef } from 'react'
import { EventTitle } from './EventTitle'
import { HeroReel } from './HeroReel'
import { Horizon } from './Horizon'
import { Starfield } from './Starfield'
import './Hero.css'

/**
 * A light moves through the dark sky and finds the unit's photographs in it.
 * It follows the pointer where there is one; on touch screens it drifts on
 * its own. The position is eased, written to CSS as --lx/--ly (percent).
 */
function useSearchlight(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const target = { x: 50, y: 34 }
    const cur = { x: 50, y: 34 }
    let pointerAt = 0
    let raf = 0
    let last = performance.now()
    const t0 = last

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width) * 100
      target.y = ((e.clientY - r.top) / r.height) * 100
      pointerAt = performance.now()
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // With no recent pointer, the light wanders a slow figure of eight.
      if (now - pointerAt > 2600) {
        const t = (now - t0) / 1000
        target.x = 50 + Math.sin(t * 0.23) * 30
        target.y = 34 + Math.sin(t * 0.46) * 12
      }
      const k = 1 - Math.pow(0.004, dt)
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k
      el.style.setProperty('--lx', `${cur.x.toFixed(2)}%`)
      el.style.setProperty('--ly', `${cur.y.toFixed(2)}%`)
      raf = requestAnimationFrame(loop)
    }

    let running = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(loop)
      } else if (!entry.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(el)
    if (fine) el.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointermove', onMove)
    }
  }, [ref])
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useSearchlight(ref)

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={ref}>
      <div className="hero__media" aria-hidden>
        <HeroReel />
        <div className="hero__beam" />
        <Starfield />
        <Horizon className="hero__horizon horizon--rise" />
      </div>

      <div className="hero__content">
        <div className="hero__lockup">
          <EventTitle id="hero-title" priority />
        </div>
        <a className="hero__cue" href="#mission">
          <span className="micro">Follow the light</span>
          <span className="hero__cue-line" aria-hidden />
        </a>
      </div>
    </section>
  )
}
