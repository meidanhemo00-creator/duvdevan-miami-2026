import { useEffect, useRef, type PointerEvent as RPointerEvent } from 'react'
import { site } from '../content/site'
import { stagger } from '../lib/style'
import './Field.css'

/**
 * "In the field": the unit's soldiers, kept in the dark. Each photograph sits
 * dim and in black and white; light brings it up in colour. With a pointer the
 * light follows it; on touch screens the photograph in the middle of the
 * screen is lit as you scroll.
 */
export function Field() {
  const { field } = site
  const grid = useRef<HTMLDivElement>(null)

  // Touch: light whichever photograph crosses the centre band of the screen.
  useEffect(() => {
    const el = grid.current
    if (!el || window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute('data-lit', e.isIntersecting)
      },
      { rootMargin: '-38% 0px -38% 0px' },
    )
    el.querySelectorAll('.field__tile').forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  const onMove = (e: RPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--px', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--py', `${e.clientY - r.top}px`)
  }

  return (
    <section className="field" id="field" aria-labelledby="field-title">
      <div className="wrap scene-head">
        <span className="tick" data-reveal="line" aria-hidden />
        <h2 id="field-title" className="display display--m" data-reveal>
          {field.heading}
        </h2>
        <p className="lead" data-reveal style={stagger(1)}>
          {field.lead}
        </p>
      </div>

      <div className="field__grid wrap" ref={grid}>
        {field.photos.map((p, i) => {
          const base = `media/field/${p.name}-1400`
          const img = (cls: string, alt: string) => (
            <picture>
              <source srcSet={`${base}.avif`} type="image/avif" />
              <source srcSet={`${base}.webp`} type="image/webp" />
              <img className={cls} src={`${base}.jpg`} alt={alt} loading="lazy" decoding="async" />
            </picture>
          )
          return (
            <figure
              key={p.name}
              className="field__tile"
              style={{ aspectRatio: p.ratio, ...stagger(i % 3) }}
              data-reveal
              onPointerMove={onMove}
            >
              {img('field__dark', p.alt)}
              <div className="field__lit" aria-hidden>
                {img('field__lit-img', '')}
              </div>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
