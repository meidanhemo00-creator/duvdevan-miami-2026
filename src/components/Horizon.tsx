import './Horizon.css'

type Props = { className?: string }

/**
 * The curve of the earth at first light: a dark planet whose rim carries a
 * thin line of warm light, brightest at the centre where the sun is about to
 * rise. Decorative, pure CSS.
 */
export function Horizon({ className = '' }: Props) {
  return (
    <div className={`horizon ${className}`} aria-hidden>
      <div className="horizon__atmosphere" />
      <div className="horizon__planet" />
      <div className="horizon__sun" />
    </div>
  )
}
