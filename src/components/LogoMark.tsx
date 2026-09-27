import { site } from '../content/site'
import './LogoMark.css'

type Props = {
  className?: string
  /** Pass true where the logo stands in for the word "Duvdevan" in a heading. */
  labelled?: boolean
  priority?: boolean
}

/**
 * The official Duvdevan logo, or a clearly marked placeholder if none is set.
 * The artwork is used as supplied: never redrawn, recoloured or approximated.
 */
export function LogoMark({ className = '', labelled = false, priority = false }: Props) {
  const { logo } = site
  const alt = labelled ? logo.alt : ''

  if (!logo.src) {
    return (
      <span className={`logo-slot ${className}`} role={labelled ? 'img' : undefined} aria-label={labelled ? logo.alt : undefined} aria-hidden={labelled ? undefined : true}>
        <span className="logo-slot__label">Logo placeholder</span>
      </span>
    )
  }

  return (
    <picture className={`logo-mark ${className}`}>
      <source srcSet={logo.src} type="image/webp" />
      <img
        src={logo.fallback}
        width={logo.width}
        height={logo.height}
        alt={alt}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  )
}
