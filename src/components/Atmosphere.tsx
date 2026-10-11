import { Dust } from './Dust'
import './Atmosphere.css'

type Props = { className?: string; seed?: number; density?: number }

/**
 * The air of a battlefield, on film: smoke rolling low across the frame,
 * dust and ash drifting, scratches and flicker on the print. Decorative.
 */
export function Atmosphere({ className = '', seed, density }: Props) {
  return (
    <div className={`atmos ${className}`} aria-hidden>
      <div className="atmos__smoke">
        <span className="atmos__puff atmos__puff--1" />
        <span className="atmos__puff atmos__puff--2" />
        <span className="atmos__puff atmos__puff--3" />
        <span className="atmos__puff atmos__puff--4" />
      </div>
      <Dust seed={seed} density={density} />
      <div className="atmos__scratches" />
      <div className="atmos__flicker" />
    </div>
  )
}
