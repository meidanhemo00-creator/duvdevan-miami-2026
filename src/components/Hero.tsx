import { EventTitle } from './EventTitle'
import { HeroReel } from './HeroReel'
import { MiamiSkyline } from './MiamiSkyline'
import { Starfield } from './Starfield'
import './Hero.css'

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden>
        <HeroReel />
        <Starfield />
        <MiamiSkyline className="hero__city miami--rise" full />
      </div>

      <div className="hero__content">
        <div className="hero__lockup">
          <EventTitle id="hero-title" priority />
        </div>
      </div>
    </section>
  )
}
