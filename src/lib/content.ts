import { site, type Slot } from '../content/site'

/** A slot is public only when confirmed and non-empty. */
export const isPublic = (slot: Slot) => slot.confirmed && slot.value.trim().length > 0

/**
 * Preview mode draws unconfirmed slots as labelled outlines.
 * On in `npm run dev`; on a deployed build, add `?slots` to the URL.
 */
export const previewSlots =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('slots'))

export type Cta = { label: string; href: string; external: boolean }

/** Resolve the single primary CTA from whatever is confirmed. */
export function primaryCta(): Cta {
  const { rsvpUrl, detailsUrl } = site.event
  if (isPublic(rsvpUrl)) return { label: site.cta.rsvpLabel, href: rsvpUrl.value, external: true }
  if (isPublic(detailsUrl))
    return {
      label: site.cta.detailsLabel,
      href: detailsUrl.value,
      external: !detailsUrl.value.startsWith('mailto:'),
    }
  return { label: site.cta.fallbackLabel, href: '#invitation', external: false }
}
