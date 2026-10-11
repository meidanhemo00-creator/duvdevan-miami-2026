import { site } from '../content/site'
import { LogoMark } from './LogoMark'
import './EventTitle.css'

type Props = {
  as?: 'h1' | 'h2'
  id?: string
  size?: 'hero' | 'closing'
  priority?: boolean
}

/**
 * "THE DUVDEVAN MISSION / ACROSS THE UNITED STATES", the page's one title,
 * used to open and close it. The logo stands in for "Duvdevan": its height is
 * exactly one cap height of the display face, on the same baseline as the
 * words around it. A band of light passes across the words now and then.
 */
export function EventTitle({ as: Tag = 'h1', id, size = 'hero', priority = false }: Props) {
  const { event } = site
  return (
    <Tag id={id} className={`event-title event-title--${size}`}>
      <span className="event-title__line" data-intro>
        <span className="event-title__word event-title__word--lit">{event.before} </span>
        <span className="event-title__word event-title__word--logo">
          <LogoMark labelled priority={priority} />
        </span>
        <span className="event-title__word event-title__word--lit event-title__word--last"> {event.after}</span>
      </span>
      <span className="event-title__month" data-intro>
        <span className="event-title__rule" aria-hidden />
        <span className="event-title__month-text">
          {event.tagline.split(' · ').map((part, i) => (
            <span key={part} className="event-title__part">
              {i > 0 && <span className="event-title__dot"> · </span>}
              {part}
            </span>
          ))}
        </span>
        <span className="event-title__rule" aria-hidden />
      </span>
    </Tag>
  )
}
