import { site } from '../content/site'
import { stagger } from '../lib/style'
import { EventTitle } from './EventTitle'
import { MiamiSkyline } from './MiamiSkyline'
import { Starfield } from './Starfield'
import './Closing.css'

export function Closing() {
  const { closing } = site

  return (
    <section className="closing" id="invitation" aria-labelledby="closing-title">
      <div className="closing__sky" aria-hidden>
        <Starfield density={1.2} horizon={0.9} seed={1126} />
      </div>

      <div className="closing__content wrap">
        <div className="closing__title" data-reveal>
          <EventTitle as="h2" id="closing-title" size="closing" />
        </div>

        <p className="lead closing__lead" data-reveal style={stagger(3)}>
          {closing.lead}
        </p>
      </div>

      {/* The skyline returns as the base of the final frame, beneath the words. */}
      <MiamiSkyline className="closing__city" />
    </section>
  )
}
