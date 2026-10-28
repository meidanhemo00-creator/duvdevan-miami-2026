/**
 * ───────────────────────────────────────────────────────────────────────────
 *  EDITIONS: one site, one event per city.
 *
 *  Everything that changes from city to city lives here; the rest of the page
 *  (films, impact, the unit, the gallery) is shared through site.ts.
 *  Pick the edition at build time with VITE_EDITION (default: la).
 *    VITE_EDITION=tucson npx vite build   → the Tucson page
 *  scripts/build-editions.sh builds every edition into its own folder:
 *    /la/  /tucson/
 * ───────────────────────────────────────────────────────────────────────────
 */

export type Edition = {
  /** Folder on duvdevanmission.com, also used for the link-preview image name. */
  slug: string
  /** <head>: page title, descriptions and the link preview (absolute URLs). */
  html: {
    title: string
    description: string
    ogTitle: string
    ogDescription: string
    ogImageAlt: string
  }
  event: {
    /** The title reads: [before] [logo] [after] [city]. Empty parts are skipped. */
    before: string
    after: string
    city: string
    /** The line under the title (split at " · " onto two lines on phones). */
    tagline: string
    /** Viewfinder overlay in the hero. */
    hud: { ref: string; op: string }
  }
  /** Empty url → no RSVP buttons are shown. `short` is the small date on the button. */
  rsvp: { url: string; label: string; short: string }
  /** The city lit on the map. */
  stop: { name: string; lon: number; lat: number }
  closingLead: string
  footer: string
  /** The film section about the gathering itself (heading also used in the menu). */
  gathering: { heading: string; intro: string }
  /** The impact section. LA is framed around giving; Tucson describes the foundation's work. */
  impact: {
    heading: string
    intro: string
    /** Label of the section in the menu. */
    nav: string
    body: { resilience: string; education: string; remembrance: string }
  }
}

export const editions: Record<string, Edition> = {
  la: {
    slug: 'la',
    html: {
      title: 'Duvdevan in Los Angeles | November 15, 2026',
      description:
        'An evening with Friends of Duvdevan in Beverly Hills, Los Angeles, on November 15, 2026, in support of the soldiers, veterans and bereaved families of the unit.',
      ogTitle: 'Duvdevan in Los Angeles',
      ogDescription: 'An evening with Friends of Duvdevan. Sunday, November 15, 2026, Beverly Hills.',
      ogImageAlt: 'Duvdevan in Los Angeles. Sunday, November 15, 2026, Beverly Hills',
    },
    event: {
      before: '',
      after: 'In',
      city: 'Los Angeles',
      tagline: 'Sunday, November 15, 2026 · Beverly Hills',
      hud: { ref: '34°04′N 118°24′W', op: 'Beverly Hills · 11.15.26' },
    },
    rsvp: { url: 'https://luma.com/8dcclift', label: 'RSVP', short: 'November 15' },
    stop: { name: 'Beverly Hills, Los Angeles · November 15', lon: -118.4, lat: 34.07 },
    closingLead:
      'Join us in Beverly Hills on November 15, and stand with the soldiers, veterans and bereaved families of the unit.',
    footer: 'Duvdevan in Los Angeles · Beverly Hills · November 15, 2026',
    gathering: {
      heading: 'The evening',
      intro:
        'Each year, friends of the unit gather in one room to honor its soldiers and stand with the families who carry its story. This is what that night looks like.',
    },
    impact: {
      heading: 'What your support makes possible',
      intro:
        'Funds raised at our events go to the soldiers, veterans and bereaved families of the unit, across three areas of work.',
      nav: 'The impact',
      body: {
        resilience:
          'Service leaves marks that are not always visible. Your support helps soldiers and veterans reach the care, the time and the people they need to recover.',
        education:
          'After service, a new chapter begins. Your support helps veterans of the unit return to their studies and build the working lives they choose.',
        remembrance:
          'We remember every name. Your support keeps the foundation beside bereaved families, on the days of remembrance and on the ordinary days in between.',
      },
    },
  },

  tucson: {
    slug: 'tucson',
    html: {
      title: 'Duvdevan in Tucson | November 11, 2026',
      description:
        'Lunch with Friends of Duvdevan in Tucson on November 11, 2026: meet the operators of Duvdevan and learn about the foundation that stands beside the soldiers, veterans and bereaved families of the unit.',
      ogTitle: 'Duvdevan in Tucson',
      ogDescription: 'Lunch with Friends of Duvdevan. Wednesday, November 11, 2026, at 12 noon.',
      ogImageAlt: 'Duvdevan in Tucson. Lunch, Wednesday, November 11, 2026, at 12 noon',
    },
    event: {
      before: '',
      after: 'In',
      city: 'Tucson',
      tagline: 'Wednesday, November 11, 2026 · Lunch at 12 noon',
      hud: { ref: '32°13′N 110°58′W', op: 'Tucson · 11.11.26' },
    },
    rsvp: { url: 'https://luma.com/dmug6b3b', label: 'RSVP', short: 'November 11' },
    stop: { name: 'Tucson · November 11', lon: -110.97, lat: 32.22 },
    closingLead:
      'Join us for lunch in Tucson on November 11, and stand with the soldiers, veterans and bereaved families of the unit.',
    footer: 'Duvdevan in Tucson · Lunch · November 11, 2026, 12 noon',
    gathering: {
      heading: 'The event',
      intro:
        'Each year, friends of the unit gather in one room to honor its soldiers and stand with the families who carry its story. This is what that gathering looks like.',
    },
    impact: {
      heading: 'What the foundation does',
      intro:
        'The Duvdevan Foundation stands beside the soldiers, veterans and bereaved families of the unit, across three areas of work.',
      nav: 'Our work',
      body: {
        resilience:
          'Service leaves marks that are not always visible. The foundation helps soldiers and veterans reach the care, the time and the people they need to recover.',
        education:
          'After service, a new chapter begins. The foundation helps veterans of the unit return to their studies and build the working lives they choose.',
        remembrance:
          'We remember every name. The foundation stays beside bereaved families, on the days of remembrance and on the ordinary days in between.',
      },
    },
  },
}
