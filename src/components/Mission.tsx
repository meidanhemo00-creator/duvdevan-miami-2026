import { site } from '../content/site'
import { stagger } from '../lib/style'
import { MissionMap } from './MissionMap'
import './Mission.css'

export function Mission() {
  const { mission } = site
  return (
    <section className="mission" id="mission" aria-labelledby="mission-title">
      <div className="wrap scene-head">
        <span className="tick" data-reveal="line" aria-hidden />
        <h2 id="mission-title" className="display display--m" data-reveal>
          {mission.heading}
        </h2>
        <p className="lead" data-reveal style={stagger(1)}>
          {mission.intro}
        </p>
      </div>
      <div className="mission__stage" data-reveal style={stagger(2)}>
        <div className="mission__display">
          <MissionMap stops={mission.stops} />
          <span className="brackets mission__brackets" aria-hidden />
          <span className="hud mission__label mission__label--tl" aria-hidden>
            Theater: Continental U.S.
          </span>
          <span className="hud mission__label mission__label--br" aria-hidden>
            <span className="rec-dot" />
            Live
          </span>
        </div>
        {mission.stops.length > 0 && (
          <ul className="mission__stops micro" aria-label="Cities on the mission">
            {mission.stops.map((s) => (
              <li key={s.name}>{s.name}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
