import { site } from '../content/site'
import { isPublic } from '../lib/content'
import { stagger } from '../lib/style'
import { CtaButton } from './CtaButton'
import { EventTitle } from './EventTitle'
import { MiamiSkyline } from './MiamiSkyline'
import { Starfield } from './Starfield'
import './Hero.css'

export function Hero() {
  const { event } = site
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden>
        <Starfield />
        <MiamiSkyline className="hero__city miami--rise" />
      </div>

      <div className="hero__content">
        <div className="hero__lockup">
          <EventTitle id="hero-title" priority />
        </div>

        <div className="hero__foot" data-intro style={stagger(2)}>
          {isPublic(event.date) && <p className="hero__date micro">{event.date.value}</p>}
          <CtaButton />
        </div>
      </div>
    </section>
  )
}
