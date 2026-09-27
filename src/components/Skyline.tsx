/**
 * Downtown Miami from Watson Island (Dori, CC BY-SA 3.0, credited in the footer).
 * Landscape frames for wide screens, a tower-centred portrait crop for phones.
 */
const BASE = '/media/skyline'
const land = (ext: string) =>
  [1280, 1920, 2560].map((w) => `${BASE}/skyline-${w}.${ext} ${w}w`).join(', ')
const port = (ext: string) =>
  [750, 1125].map((w) => `${BASE}/skyline-portrait-${w}.${ext} ${w}w`).join(', ')
const PORTRAIT = '(max-aspect-ratio: 4/5)'

type Props = { priority?: boolean; className?: string }

export function Skyline({ priority = false, className = '' }: Props) {
  return (
    <picture>
      <source media={PORTRAIT} type="image/avif" srcSet={port('avif')} sizes="100vw" />
      <source media={PORTRAIT} type="image/webp" srcSet={port('webp')} sizes="100vw" />
      <source media={PORTRAIT} srcSet={port('jpg')} sizes="100vw" />
      <source type="image/avif" srcSet={land('avif')} sizes="100vw" />
      <source type="image/webp" srcSet={land('webp')} sizes="100vw" />
      <img
        className={className}
        src={`${BASE}/skyline-1920.jpg`}
        srcSet={land('jpg')}
        sizes="100vw"
        width={1920}
        height={1280}
        alt="The downtown Miami skyline at night, its towers lit above Biscayne Bay and the MacArthur Causeway."
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  )
}
