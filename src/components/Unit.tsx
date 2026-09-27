import { site } from '../content/site'
import { stagger } from '../lib/style'
import { FilmPlayer } from './FilmPlayer'
import './Unit.css'

/**
 * The most intense scene: near-total black, three short lines arriving one
 * at a time while the stage holds, the title, then the film opens to full
 * width. No operational detail by design.
 */
export function Unit() {
  const { unit } = site
  return (
    <section className="unit" id="unit" aria-labelledby="unit-title">
      <div className="unit__track">
        <div className="unit__stage">
          <div className="unit__glow" aria-hidden />
          <div className="unit__copy">
            {unit.lines.map((line, i) => (
              <p key={line} className="unit__line" data-reveal style={stagger(i)}>
                {line}
              </p>
            ))}
            <h2 id="unit-title" className="unit__title display" data-reveal style={stagger(unit.lines.length)}>
              {unit.heading}
            </h2>
          </div>
        </div>
      </div>
      <div className="unit__film">
        <FilmPlayer film={unit.film} tone="night" slateTitle={false} />
      </div>
    </section>
  )
}
