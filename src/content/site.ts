/**
 * ───────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT: the one file to edit.
 *
 *  Event details, film sources, poster images, CTA links and copy all live
 *  here. Nothing elsewhere in the codebase should need to change when real
 *  assets arrive.
 *
 *  Rules the page follows:
 *   • An event detail (date, venue, RSVP link…) is shown publicly ONLY when
 *     its `confirmed` flag is true AND it has a value.
 *   • A film with `source: null` renders an intentional "coming soon" frame,
 *     never an empty or broken player.
 *   • `logo.src` empty → a clearly marked logo placeholder is shown.
 *
 *  Preview mode: in `npm run dev`, or on any deployed URL with `?slots` added,
 *  unconfirmed slots are drawn as dashed outlines so you can see where each
 *  detail will appear.
 * ───────────────────────────────────────────────────────────────────────────
 */

/** An event detail that is hidden until someone confirms it. */
export type Slot = {
  value: string
  confirmed: boolean
}

/**
 * Where a film plays from. Large video files are never committed to Git.
 *  • `file`  : a hosted MP4/WebM URL (S3, Cloudflare R2/Stream MP4, Mux MP4, CDN…)
 *  • `embed` : a player URL (Vimeo `https://player.vimeo.com/video/ID`,
 *              YouTube `https://www.youtube-nocookie.com/embed/ID`)
 */
export type FilmSource =
  | { kind: 'file'; src: string; type?: 'video/mp4' | 'video/webm' }
  | { kind: 'embed'; src: string }

export type Film = {
  /** Stable id, used for analytics hooks and to pause other films. */
  id: string
  title: string
  /** e.g. "4:12". Shown next to the play button when present. */
  duration?: string
  source: FilmSource | null
  /**
   * Poster frame, 16:9. Recommended: a 1920×1080 still from the film in
   * /public/media/posters/. The page tones every poster to monochrome.
   * Until real posters exist, graded stills of the Miami skyline stand in.
   */
  poster?: { src: string; alt: string }
  /** Optional WebVTT captions file (strongly recommended). */
  captions?: { src: string; label: string; srclang: string }
}

export type SupportChapter = {
  id: string
  title: string
  body: string
  film: Film
}

// Helper so empty slots read clearly below.
const unconfirmed = (value = ''): Slot => ({ value, confirmed: false })

export const site = {
  meta: {
    title: 'Duvdevan in Miami | November 2026',
    description:
      'An evening with Friends of Duvdevan in Miami, November 2026, in support of the soldiers, veterans and bereaved families of the unit.',
  },

  organisation: 'Friends of Duvdevan',

  /**
   * Official Duvdevan logo (supplied). Transparent, off-white artwork trimmed
   * to its edges; an SVG can replace it later with the same aspect ratio.
   * Set `src` to '' to fall back to the marked placeholder.
   */
  logo: {
    src: '/media/brand/duvdevan-logo.webp',
    fallback: '/media/brand/duvdevan-logo.png',
    width: 1896,
    height: 686,
    /** Read by screen readers wherever the logo stands in for the word. */
    alt: 'Duvdevan',
  },

  event: {
    city: 'Miami',
    month: 'November 2026',
    /** e.g. 'Thursday, November 12, 2026 · 7:00 PM' */
    date: unconfirmed(),
    /** e.g. 'Venue name, Miami Beach' */
    venue: unconfirmed(),
    /** Registration / ticketing URL. When confirmed, all CTAs point here. */
    rsvpUrl: unconfirmed(),
    /**
     * Fallback "receive details" link (a form URL or mailto:) used while RSVP
     * is not yet open. When neither link is confirmed, CTAs scroll to the
     * invitation section instead of pointing anywhere broken.
     */
    detailsUrl: unconfirmed(),
  },

  /** One CTA intent per state, used identically everywhere on the page. */
  cta: {
    rsvpLabel: 'RSVP',
    detailsLabel: 'Receive details',
    fallbackLabel: 'Save the date',
  },

  evening: {
    heading: 'The evening',
    // DRAFT COPY
    intro:
      'Each year, friends of the unit gather in one room to honor its soldiers and stand with the families who carry its story. This is what that night looks like.',
    film: {
      id: 'evening',
      title: 'In their own words',
      source: null,
      poster: { src: '/media/stills/evening-1600.webp', alt: 'City lights reflected in Biscayne Bay at night.' },
    } satisfies Film,
  },

  impact: {
    heading: 'What your support makes possible',
    // DRAFT COPY. No figures or promises; add verified ones only.
    statement:
      'Service does not end when the uniform comes off. It stays with the soldier, with the family, and with everyone who stands beside them.',
    intro:
      'Funds raised at our events go to the soldiers, veterans and bereaved families of the unit, across three areas of work.',
    chapters: [
      {
        id: 'resilience',
        title: 'Resilience and recovery',
        body: 'Service leaves marks that are not always visible. Your support helps soldiers and veterans reach the care, the time and the people they need to recover.',
        film: {
          id: 'resilience',
          title: 'Resilience and recovery',
          source: null,
          poster: { src: '/media/stills/resilience-1600.webp', alt: 'Downtown Miami towers above the causeway at night.' },
        },
      },
      {
        id: 'education',
        title: 'Education and career',
        body: 'After service, a new chapter begins. Your support helps veterans of the unit return to their studies and build the working lives they choose.',
        film: {
          id: 'education',
          title: 'Education and career',
          source: null,
          poster: { src: '/media/stills/education-1600.webp', alt: 'Lit towers of downtown Miami against the night sky.' },
        },
      },
      {
        id: 'remembrance',
        title: 'Remembrance and support for bereaved families',
        body: 'We remember every name. Your support keeps the foundation beside bereaved families, on the days of remembrance and on the ordinary days in between.',
        film: {
          id: 'remembrance',
          title: 'Remembrance and support for bereaved families',
          source: null,
          poster: { src: '/media/stills/remembrance-1600.webp', alt: 'A single tower in the Miami night sky.' },
        },
      },
    ] satisfies SupportChapter[],
  },

  unit: {
    heading: 'The unit',
    // DRAFT COPY. Deliberately contains no operational detail.
    lines: ['Most of their work is never seen.', 'Few ever meet them.', 'This is a glimpse.'],
    film: { id: 'unit', title: 'The unit', source: null } satisfies Film,
  },

  closing: {
    // DRAFT COPY
    lead: 'Join us for one evening, and stand with the soldiers, veterans and bereaved families of the unit.',
    tba: 'Date, venue and invitations will be announced here.',
  },

  credits: {
    skyline: {
      text: 'Skyline photograph: Downtown Miami from Watson Island by Dori, cropped and toned',
      source: 'https://commons.wikimedia.org/wiki/File:Night_Panorama_Miami_Florida_5462.jpg',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
} as const

export type Site = typeof site
