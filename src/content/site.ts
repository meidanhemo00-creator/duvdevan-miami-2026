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
  | {
      kind: 'file'
      src: string
      type?: 'video/mp4' | 'video/webm'
      /** Play only a section of the file, in seconds (e.g. one chapter of a longer film). */
      start?: number
      end?: number
    }
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
  poster?: Photo
  /** Optional WebVTT captions file (strongly recommended). */
  captions?: { src: string; label: string; srclang: string }
}

/**
 * A graded photograph. `src` is the JPEG fallback; `avif`/`webp` are optional
 * modern formats. Photos sit over black at `opacity` (0–1) so they emerge
 * from the dark; tune it per image so the subject stays readable.
 */
export type Photo = {
  src: string
  alt: string
  avif?: string
  webp?: string
  opacity?: number
  /** CSS object-position, to keep the subject in frame on narrow screens. */
  position?: string
}

/** Graded Duvdevan photographs in /public/media/unit (see README). */
const unitPhoto = (name: string, alt: string, opacity: number, position = '50% 50%'): Photo => ({
  src: `/media/unit/${name}-1600.jpg`,
  webp: `/media/unit/${name}-1600.webp`,
  avif: `/media/unit/${name}-1600.avif`,
  alt,
  opacity,
  position,
})

export type SupportChapter = {
  id: string
  title: string
  body: string
  film: Film
}

// Helper so empty slots read clearly below.
const unconfirmed = (value = ''): Slot => ({ value, confirmed: false })

/**
 * The 2026 impact film (3:19, English subtitles burned in). Each impact
 * chapter plays its own section, starting at the film's title card.
 * Local file for development (public/media/video is git-ignored): before
 * launch, host it and replace the URL here.
 */
const IMPACT_FILM = '/media/video/impact-720.mp4'
const impactSection = (start: number, end: number): FilmSource => ({
  kind: 'file',
  src: IMPACT_FILM,
  type: 'video/mp4',
  start,
  end,
})

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

  /**
   * Hero background: graded Duvdevan photographs that crossfade slowly
   * beneath the Miami skyline, at low opacity. Decorative (no alt text).
   * `name` refers to /public/media/unit/<name>-{960,1600}.{avif,webp,jpg}.
   */
  heroReel: {
    opacity: 0.13,
    secondsPerImage: 7,
    images: [
      { name: 'watch', position: '62% 45%', sizes: [1600, 2400] },
      { name: 'unit', position: '60% 40%', sizes: [960, 1600] },
      { name: 'education', position: '60% 40%', sizes: [960, 1600] },
      { name: 'remembrance', position: '55% 60%', sizes: [960, 1600] },
      { name: 'resilience', position: '50% 30%', sizes: [960, 1600] },
    ],
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
      duration: '0:13',
      /**
       * Local file for development (public/media/video is git-ignored).
       * Before going live, upload the MP4 to a host (Vimeo, Mux, S3/CDN) and
       * paste its URL here, or use { kind: 'embed', src: 'https://player.vimeo.com/video/ID' }.
       */
      source: { kind: 'file', src: '/media/video/evening-720.mp4', type: 'video/mp4' },
      poster: {
        src: '/media/posters/evening-1600.jpg',
        webp: '/media/posters/evening-1600.webp',
        avif: '/media/posters/evening-1600.avif',
        alt: 'Guests seated in a darkened hall, watching the screen at a Friends of Duvdevan evening.',
        opacity: 0.62,
      },
    } satisfies Film,
  },

  impact: {
    heading: 'What your support makes possible',
    // DRAFT COPY. No figures or promises; add verified ones only.
    statement:
      'Service does not end when the uniform comes off. It stays with the soldier, with the family, and with everyone who stands beside them.',
    intro:
      'Funds raised at our events go to the soldiers, veterans and bereaved families of the unit, across three areas of work.',
    /** Backdrop behind the statement: wide frame, and a phone crop on the subject. */
    backdrop: {
      wide: '/media/unit/watch',
      portrait: '/media/unit/watch-portrait-900',
      alt: 'Two soldiers of the unit under a concrete shelter, one sighting across the hills.',
    },
    chapters: [
      {
        id: 'resilience',
        title: 'Resilience and recovery',
        body: 'Service leaves marks that are not always visible. Your support helps soldiers and veterans reach the care, the time and the people they need to recover.',
        film: {
          id: 'resilience',
          title: 'Resilience and recovery',
          duration: '0:44',
          source: impactSection(32, 76),
          poster: unitPhoto('resilience', 'A soldier of the unit looks down as he pulls on his gloves.', 0.5, '50% 30%'),
        },
      },
      {
        id: 'education',
        title: 'Education and career',
        body: 'After service, a new chapter begins. Your support helps veterans of the unit return to their studies and build the working lives they choose.',
        film: {
          id: 'education',
          title: 'Education and career',
          duration: '0:53',
          source: impactSection(76, 129),
          poster: unitPhoto('education', 'A soldier of the unit looks through a spotting scope on a tripod.', 0.5, '60% 40%'),
        },
      },
      {
        id: 'remembrance',
        title: 'Remembrance and support for bereaved families',
        body: 'We remember every name. Your support keeps the foundation beside bereaved families, on the days of remembrance and on the ordinary days in between.',
        film: {
          id: 'remembrance',
          title: 'Remembrance and support for bereaved families',
          duration: '1:10',
          source: impactSection(129, 199),
          poster: unitPhoto('remembrance', 'Two soldiers of the unit stand beside their vehicles.', 0.45, '55% 60%'),
        },
      },
    ] satisfies SupportChapter[],
  },

  unit: {
    heading: 'The unit',
    // DRAFT COPY. Deliberately contains no operational detail.
    lines: ['Most of their work is never seen.', 'Few ever meet them.', 'This is a glimpse.'],
    film: {
      id: 'unit',
      title: 'The unit',
      duration: '0:22',
      // Local file for development (git-ignored); host it before launch.
      source: { kind: 'file', src: '/media/video/unit-720.mp4', type: 'video/mp4' },
      poster: unitPhoto('unit', 'A soldier of the unit in a concrete passage, looking up.', 0.42, '60% 40%'),
    } satisfies Film,
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
