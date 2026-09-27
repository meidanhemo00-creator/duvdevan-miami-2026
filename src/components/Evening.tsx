import { site } from '../content/site'
import { stagger } from '../lib/style'
import { FilmPlayer } from './FilmPlayer'
import './Evening.css'

export function Evening() {
  const { evening } = site
  return (
    <section className="evening" id="evening" aria-labelledby="evening-title">
      <div className="wrap scene-head">
        <span className="tick" data-reveal="line" aria-hidden />
        <h2 id="evening-title" className="display display--m" data-reveal>
          {evening.heading}
        </h2>
        <p className="lead" data-reveal style={stagger(1)}>
          {evening.intro}
        </p>
      </div>
      <div className="evening__stage" data-reveal="frame">
        <FilmPlayer film={evening.film} tone="city" />
      </div>
    </section>
  )
}
