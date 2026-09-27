import './MiamiSkyline.css'

/**
 * The event's own Miami skyline artwork (supplied), off-white on transparency.
 * Shown at low opacity over black so the city emerges from the dark rather
 * than sitting on the page as a bright block. Phones get a tighter crop of
 * the central towers so the silhouette keeps its presence.
 */
type Props = {
  className?: string
  /** Show the whole skyline on phones too, instead of the tighter crop. */
  full?: boolean
}

export function MiamiSkyline({ className = '', full = false }: Props) {
  return (
    <picture className={`miami ${className}`} aria-hidden>
      {!full && (
        <>
          <source media="(max-width: 720px)" srcSet="media/miami/skyline-silhouette-narrow.webp" type="image/webp" />
          <source media="(max-width: 720px)" srcSet="media/miami/skyline-silhouette-narrow.png" />
        </>
      )}
      <source srcSet="media/miami/skyline-silhouette.webp" type="image/webp" />
      <img src="media/miami/skyline-silhouette.png" width={1911} height={379} alt="" decoding="async" />
    </picture>
  )
}
