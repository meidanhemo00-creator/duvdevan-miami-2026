import { site } from '../content/site'
import { stagger } from '../lib/style'
import { EventTitle } from './EventTitle'
import { Atmosphere } from './Atmosphere'
import { Rsvp } from './Rsvp'
import './Closing.css'

export function Closing() {
  const { closing } = site

  return (
    <section className="closing" id="invitation" aria-labelledby="closing-title">
      <Atmosphere className="closing__atmos" seed={1126} density={0.8} />

      <div className="closing__content wrap">
        <div className="closing__title" data-reveal>
          <EventTitle as="h2" id="closing-title" size="closing" />
        </div>

        <p className="lead closing__lead" data-reveal style={stagger(3)}>
          {closing.lead}
        </p>
        <div id="rsvp" className="closing__rsvp">
          <Rsvp />
        </div>
      </div>

    </section>
  )
}
