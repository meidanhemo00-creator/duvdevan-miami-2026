import { useRef, useState, type KeyboardEvent } from 'react'
import { site } from '../content/site'
import { stagger } from '../lib/style'
import { FilmPlayer, pauseAllFilms } from './FilmPlayer'
import './Impact.css'

/** Where each chapter's slate sits in the out-of-focus city. */
const slateX = ['18%', '62%', '88%', '40%', '8%']

export function Impact() {
  const { impact } = site
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const count = impact.chapters.length

  const select = (i: number) => {
    if (i === active) return
    pauseAllFilms()
    setActive(i)
  }

  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: (active + 1) % count,
      ArrowLeft: (active - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }
    if (!(e.key in keys)) return
    e.preventDefault()
    const next = keys[e.key]
    select(next)
    tabs.current[next]?.focus()
  }

  return (
    <section className="impact" id="impact" aria-labelledby="impact-title">
      <div className="wrap scene-head">
        <span className="tick" data-reveal="line" aria-hidden />
        <h2 id="impact-title" className="display display--m" data-reveal>
          {impact.heading}
        </h2>
      </div>

      <div className="wrap impact__intro">
        <p className="impact__statement" data-reveal>
          {impact.statement}
        </p>
        <p className="lead" data-reveal style={stagger(1)}>
          {impact.intro}
        </p>
      </div>

      <div className="reel">
        <div className="wrap">
          <div className="reel__tabs" role="tablist" aria-label="Impact films" onKeyDown={onKey} data-reveal>
            {impact.chapters.map((ch, i) => (
              <button
                key={ch.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`reel-tab-${ch.id}`}
                aria-selected={i === active}
                aria-controls={`reel-panel-${ch.id}`}
                tabIndex={i === active ? 0 : -1}
                className="reel__tab"
                onClick={() => select(i)}
              >
                {ch.title}
              </button>
            ))}
          </div>
        </div>

        <div className="reel__stage" data-reveal="frame">
          {impact.chapters.map((ch, i) => (
            <div
              key={ch.id}
              role="tabpanel"
              id={`reel-panel-${ch.id}`}
              aria-labelledby={`reel-tab-${ch.id}`}
              className="reel__panel"
              data-active={i === active || undefined}
              inert={i !== active}
              style={{ ['--slate-x' as string]: slateX[i % slateX.length] }}
            >
              <FilmPlayer film={ch.film} tone="city" />
              <p className="reel__body">{ch.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
