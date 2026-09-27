import type { CSSProperties } from 'react'
import { site } from '../content/site'
import './HeroReel.css'

/**
 * Graded Duvdevan photographs crossfading slowly behind the Miami skyline.
 * Pure CSS: every image runs the same keyframes, offset by its index.
 * Reduced motion shows the first image, still.
 */
export function HeroReel() {
  const { images, opacity, secondsPerImage } = site.heroReel
  const style = {
    '--reel-opacity': opacity,
    '--reel-step': `${secondsPerImage}s`,
    '--reel-count': images.length,
  } as CSSProperties

  return (
    <div className="hero-reel" style={style} aria-hidden>
      {images.map((img, i) => {
        const set = (ext: string) => img.sizes.map((w) => `media/unit/${img.name}-${w}.${ext} ${w}w`).join(', ')
        return (
          <picture key={img.name} className="hero-reel__slide" style={{ '--i': i } as CSSProperties}>
            <source type="image/avif" srcSet={set('avif')} sizes="100vw" />
            <source type="image/webp" srcSet={set('webp')} sizes="100vw" />
            <img
              src={`media/unit/${img.name}-${img.sizes[0]}.jpg`}
              alt=""
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{ objectPosition: img.position }}
            />
          </picture>
        )
      })}
    </div>
  )
}
