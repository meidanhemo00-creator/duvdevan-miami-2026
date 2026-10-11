import { Atmosphere } from './Atmosphere'
import { EventTitle } from './EventTitle'
import { HeroReel } from './HeroReel'
import { Timecode } from './Timecode'
import './Hero.css'

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden>
        <div className="hero__shake">
          <HeroReel />
          <Atmosphere className="hero__atmos" />
        </div>
      </div>

      {/* Viewfinder overlay: corners, REC and timecode, a map reference. */}
      <div className="hero__hud" aria-hidden>
        <span className="brackets" />
        <span className="hud hero__rec">
          <span className="rec-dot" />
          REC <Timecode />
        </span>
        <span className="hud hero__ref">39°50′N 98°35′W</span>
        <span className="hud hero__op">Op. Coast to Coast</span>
        <span className="hud hero__fmt">16 mm · Reel 01</span>
      </div>

      <div className="hero__content">
        <div className="hero__lockup">
          <EventTitle id="hero-title" priority />
        </div>
        <a className="hero__cue" href="#mission">
          <span className="micro">Move out</span>
          <span className="hero__cue-line" aria-hidden />
        </a>
      </div>
    </section>
  )
}
