import './Searchlights.css'

type Props = { className?: string }

/**
 * Searchlight beams raking a night sky from below the frame, with ground haze
 * where they start. Decorative, pure CSS; still beams for reduced motion.
 */
export function Searchlights({ className = '' }: Props) {
  return (
    <div className={`searchlights ${className}`} aria-hidden>
      <span className="searchlights__beam searchlights__beam--1" />
      <span className="searchlights__beam searchlights__beam--2" />
      <span className="searchlights__beam searchlights__beam--3" />
      <span className="searchlights__haze" />
    </div>
  )
}
