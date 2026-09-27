import { site } from '../content/site'
import { isPublic, previewSlots, primaryCta } from '../lib/content'
import { stagger } from '../lib/style'
import { CtaButton } from './CtaButton'
import { EventTitle } from './EventTitle'
import { MiamiSkyline } from './MiamiSkyline'
import { SlotPreview } from './SlotPreview'
import { Starfield } from './Starfield'
import './Closing.css'

export function Closing() {
  const { event, closing } = site
  const facts = [
    { label: 'Date', slot: event.date },
    { label: 'Venue', slot: event.venue },
  ]
  const confirmed = facts.filter((f) => isPublic(f.slot))
  const pendingFacts = facts.filter((f) => !isPublic(f.slot)).map((f) => f.label)
  // The fallback CTA points at this very section, so only repeat a real link here.
  const hasLink = primaryCta().href !== '#invitation'

  return (
    <section className="closing" id="invitation" aria-labelledby="closing-title">
      <div className="closing__sky" aria-hidden>
        <Starfield density={1.2} horizon={0.9} seed={1126} />
      </div>

      <div className="closing__content wrap">
        <div className="closing__title" data-reveal>
          <EventTitle as="h2" id="closing-title" size="closing" />
        </div>

        <p className="lead closing__lead" data-reveal style={stagger(3)}>
          {closing.lead}
        </p>

        {confirmed.length > 0 ? (
          <dl className="closing__facts" data-reveal style={stagger(4)}>
            {confirmed.map((f) => (
              <div key={f.label}>
                <dt className="micro">{f.label}</dt>
                <dd>{f.slot.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="closing__tba" data-reveal style={stagger(4)}>
            {closing.tba}
          </p>
        )}

        {previewSlots && pendingFacts.length > 0 && (
          <div className="closing__slots" aria-label="Preview: details awaiting confirmation">
            {pendingFacts.map((label) => (
              <SlotPreview key={label} label={label} />
            ))}
          </div>
        )}

        {hasLink ? (
          <div data-reveal style={stagger(5)}>
            <CtaButton />
          </div>
        ) : (
          previewSlots && <SlotPreview label="RSVP button" note="Appears once the RSVP link is confirmed" variant="cta" />
        )}
      </div>

      {/* The skyline returns as the base of the final frame, beneath the words. */}
      <MiamiSkyline className="closing__city" />
    </section>
  )
}
