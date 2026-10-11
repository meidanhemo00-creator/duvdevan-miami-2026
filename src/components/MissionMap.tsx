import { useEffect, useRef } from 'react'
import './MissionMap.css'

type Stop = { name: string; lon: number; lat: number }

/**
 * Outline of the contiguous United States (lon, lat), simplified by hand.
 * Stylised on purpose: at dot-matrix resolution only the silhouette matters.
 */
const US: [number, number][] = [
  [-124.7, 48.4], [-123.9, 46.2], [-124.1, 42.0], [-124.4, 40.4], [-123.0, 38.0], [-122.4, 37.2],
  [-120.6, 34.6], [-118.5, 34.0], [-117.1, 32.5], [-114.7, 32.7], [-111.0, 31.3], [-108.2, 31.3],
  [-106.5, 31.8], [-104.5, 29.6], [-103.0, 29.0], [-101.4, 29.8], [-99.5, 27.5], [-97.4, 25.9],
  [-97.3, 27.8], [-95.0, 29.3], [-93.8, 29.7], [-91.0, 29.2], [-89.4, 29.0], [-89.6, 30.2],
  [-88.0, 30.4], [-86.5, 30.4], [-84.3, 30.0], [-83.0, 29.0], [-82.6, 27.5], [-81.8, 26.0],
  [-81.0, 25.1], [-80.4, 25.2], [-80.1, 26.5], [-80.6, 28.5], [-81.4, 30.7], [-80.9, 32.0],
  [-79.0, 33.5], [-77.9, 34.0], [-75.5, 35.3], [-76.0, 37.0], [-75.0, 38.8], [-74.0, 40.5],
  [-72.0, 41.0], [-70.0, 41.7], [-70.6, 42.6], [-70.2, 43.6], [-67.0, 44.8], [-67.8, 47.1],
  [-69.2, 47.4], [-71.5, 45.0], [-74.9, 45.0], [-76.5, 44.2], [-79.0, 43.3], [-79.1, 42.8],
  [-82.5, 41.6], [-83.4, 42.0], [-82.4, 43.0], [-82.5, 45.3], [-84.8, 46.5], [-87.0, 46.5],
  [-89.6, 48.0], [-95.2, 49.0], [-123.0, 49.0], [-123.2, 48.3],
]

const LON0 = -96
/** Sinusoidal projection around the centre of the country: a gentle curve. */
const project = (lon: number, lat: number) => [(lon - LON0) * Math.cos((lat * Math.PI) / 180), -lat] as const

const PROJ = US.map(([lo, la]) => project(lo, la))
const xs = PROJ.map((p) => p[0])
const ys = PROJ.map((p) => p[1])
const BOX = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
export const MAP_RATIO = (BOX.x1 - BOX.x0) / (BOX.y1 - BOX.y0)

function inside(x: number, y: number) {
  let hit = false
  for (let i = 0, j = PROJ.length - 1; i < PROJ.length; j = i++) {
    const [xi, yi] = PROJ[i]
    const [xj, yj] = PROJ[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

type Dot = { x: number; y: number; u: number; v: number; seed: number }

/** Canvas x/y (0..1) back to longitude/latitude, for the crosshair readout. */
function unproject(u: number, v: number) {
  const x = BOX.x0 + u * (BOX.x1 - BOX.x0)
  const lat = -(BOX.y0 + v * (BOX.y1 - BOX.y0))
  return [x / Math.cos((lat * Math.PI) / 180) + LON0, lat] as const
}
const fmt = (deg: number, pos: string, neg: string) => {
  const a = Math.abs(deg)
  return `${Math.floor(a)}°${String(Math.floor((a % 1) * 60)).padStart(2, '0')}′${deg >= 0 ? pos : neg}`
}

/**
 * The country as a tactical display: a field of points over a lat/long grid.
 * A scan line sweeps it west to east, the pointer gets a crosshair with a
 * live coordinate readout, and each confirmed stop is a red blip.
 * Canvas 2D, runs only while on screen.
 */
export function MissionMap({ stops = [] }: { stops?: readonly Stop[] }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let dots: Dot[] = []
    let raf = 0
    let running = false
    const pointer = { x: -1e4, y: -1e4, a: 0, ta: 0 }
    const t0 = performance.now()
    let seen = 0 // time the map first came on screen

    const toCanvas = (u: number, v: number) => [u * w, v * h] as const
    const stopUV = stops.map((s) => {
      const [x, y] = project(s.lon, s.lat)
      return { ...s, u: (x - BOX.x0) / (BOX.x1 - BOX.x0), v: (y - BOX.y0) / (BOX.y1 - BOX.y0) }
    })

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      // Hex grid; spacing scales with the width so phones aren't a blur.
      const step = Math.max(6, w / 120)
      dots = []
      let row = 0
      for (let y = step / 2; y < h; y += step * 0.866, row++) {
        for (let x = (row % 2) * (step / 2) + step / 2; x < w; x += step) {
          const u = x / w
          const v = y / h
          if (inside(BOX.x0 + u * (BOX.x1 - BOX.x0), BOX.y0 + v * (BOX.y1 - BOX.y0))) {
            dots.push({ x, y, u, v, seed: Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1 })
          }
        }
      }
      if (!running) draw(performance.now())
    }

    const draw = (now: number) => {
      const t = (now - t0) / 1000
      const since = seen ? (now - seen) / 1000 : 0
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const r0 = Math.max(1.25, w / 900)
      const pr = Math.max(70, w * 0.08) // pointer light radius
      // Lighting up: the country fills in from west to east on arrival.
      const fill = reduce ? 2 : since * 0.7
      // The scan line: one pass every ~7s, with a fading trail behind it.
      const scan = reduce ? -1 : ((t * 0.15) % 1.3) - 0.15

      // Graticule: every 5° of longitude and latitude, very faint.
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(200,188,150,0.08)'
      ctx.beginPath()
      for (let lon = -125; lon <= -65; lon += 5) {
        for (let lat = 24; lat <= 50; lat += 0.5) {
          const [x, y] = project(lon, lat)
          const px = ((x - BOX.x0) / (BOX.x1 - BOX.x0)) * w
          const py = ((y - BOX.y0) / (BOX.y1 - BOX.y0)) * h
          if (lat === 24) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
      }
      for (let lat = 25; lat <= 50; lat += 5) {
        const py = ((-lat - BOX.y0) / (BOX.y1 - BOX.y0)) * h
        ctx.moveTo(0, py)
        ctx.lineTo(w, py)
      }
      ctx.stroke()

      for (const d of dots) {
        const arrive = Math.min(1, Math.max(0, (fill - d.u) * 4))
        if (arrive <= 0) continue
        // Scan line: bright at the leading edge, a trail decaying behind it.
        let wave = 0
        if (!reduce) {
          const behind = scan - d.u
          if (behind >= 0 && behind < 0.35) wave = behind < 0.012 ? 1 : Math.pow(1 - behind / 0.35, 3) * 0.55
        }
        const twinkle = reduce ? 0 : 0.08 * Math.sin(t * 1.3 + d.seed * 40)
        const dx = d.x - pointer.x
        const dy = d.y - pointer.y
        const lit = pointer.a * Math.exp(-(dx * dx + dy * dy) / (pr * pr * 0.35))
        const a = Math.min(1, (0.3 + twinkle + wave * 0.7 + lit * 0.9) * arrive)
        const glow = wave * 0.8 + lit
        ctx.globalAlpha = a
        // Hard white where the scan or the pointer is, cold steel elsewhere.
        ctx.fillStyle = glow > 0.4 ? '#efe7d3' : glow > 0.12 ? '#b9ab88' : '#7d7458'
        const r = r0 * (1 + glow * 0.9)
        ctx.beginPath()
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // The scan line itself.
      if (scan > 0 && scan < 1) {
        const sx = scan * w
        const g = ctx.createLinearGradient(sx - w * 0.08, 0, sx, 0)
        g.addColorStop(0, 'rgba(232,224,204,0)')
        g.addColorStop(1, 'rgba(232,224,204,0.08)')
        ctx.fillStyle = g
        ctx.fillRect(sx - w * 0.08, 0, w * 0.08, h)
        ctx.fillStyle = 'rgba(239,231,211,0.5)'
        ctx.fillRect(sx, 0, 1, h)
      }

      // Crosshair and readout under the pointer.
      if (pointer.a > 0.02) {
        ctx.globalAlpha = pointer.a
        ctx.strokeStyle = 'rgba(239,231,211,0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, Math.round(pointer.y) + 0.5)
        ctx.lineTo(w, Math.round(pointer.y) + 0.5)
        ctx.moveTo(Math.round(pointer.x) + 0.5, 0)
        ctx.lineTo(Math.round(pointer.x) + 0.5, h)
        ctx.stroke()
        const rr = Math.max(10, w * 0.018)
        ctx.strokeStyle = 'rgba(229,53,43,0.95)'
        ctx.strokeRect(pointer.x - rr, pointer.y - rr, rr * 2, rr * 2)
        const [lon, lat] = unproject(pointer.x / w, pointer.y / h)
        ctx.font = `500 ${Math.max(10, w / 95)}px ui-monospace, Menlo, monospace`
        ctx.fillStyle = 'rgba(239,231,211,0.9)'
        const label = `${fmt(lat, 'N', 'S')}  ${fmt(lon, 'E', 'W')}`
        const lx = pointer.x + rr + 8
        ctx.textAlign = lx + 160 > w ? 'right' : 'left'
        ctx.fillText(label, ctx.textAlign === 'right' ? pointer.x - rr - 8 : lx, pointer.y - rr - 6)
        ctx.textAlign = 'left'
        ctx.globalAlpha = 1
      }

      // Confirmed stops: red blips with a ring that keeps pinging outward.
      ctx.globalCompositeOperation = 'lighter'
      for (const [i, s] of stopUV.entries()) {
        const arrive = Math.min(1, Math.max(0, (fill - s.u) * 3))
        if (arrive <= 0) continue
        const [x, y] = toCanvas(s.u, s.v)
        const g = ctx.createRadialGradient(x, y, 0, x, y, r0 * 22)
        g.addColorStop(0, 'rgba(255,120,110,0.95)')
        g.addColorStop(0.25, 'rgba(229,53,43,0.4)')
        g.addColorStop(1, 'rgba(229,53,43,0)')
        ctx.globalAlpha = arrive
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r0 * 22, 0, Math.PI * 2)
        ctx.fill()
        if (!reduce) {
          const ph = (t * 0.45 + i * 0.37) % 1
          ctx.globalAlpha = arrive * (1 - ph) * 0.8
          ctx.strokeStyle = '#e5352b'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(x, y, r0 * (3 + ph * 26), 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      pointer.a += (pointer.ta - pointer.a) * (1 - Math.pow(0.002, dt))
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    const play = () => {
      if (!seen) seen = performance.now()
      if (running || reduce || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      pointer.ta = 1
    }
    const onLeave = () => (pointer.ta = 0)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play()
          if (reduce) draw(performance.now())
        } else pause()
      },
      { threshold: 0.2 },
    )
    io.observe(canvas)
    const onVis = () => (document.hidden ? pause() : null)
    document.addEventListener('visibilitychange', onVis)
    canvas.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('pointerdown', onMove, { passive: true })
    canvas.addEventListener('pointerleave', onLeave)
    resize()

    return () => {
      pause()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [stops])

  return (
    <div className="mission-map" style={{ aspectRatio: MAP_RATIO }}>
      <canvas ref={ref} className="mission-map__canvas" aria-hidden />
      {stops.length > 0 && (
        <ul className="sr-only">
          {stops.map((s) => (
            <li key={s.name}>{s.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
