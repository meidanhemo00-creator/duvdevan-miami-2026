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
 * "DUVDEVAN IN MIAMI / NOVEMBER 2026", the event's one title, used to open
 * and close the page. The logo stands in for the first word: its height is
 * exactly one cap height of the display face, on the same baseline as
 * IN and MIAMI, so the three words read as a single line of type.
 */
export function EventTitle({ as: Tag = 'h1', id, size = 'hero', priority = false }: Props) {
  const { event } = site
  return (
    <Tag id={id} className={`event-title event-title--${size}`}>
      <span className="event-title__line" data-intro>
        <span className="event-title__word event-title__word--logo">
          <LogoMark labelled priority={priority} />
        </span>
        <span className="event-title__word"> in</span>
        <span className="event-title__word event-title__word--last"> {event.city}</span>
      </span>
      <span className="event-title__month" data-intro>
        <span className="event-title__rule" aria-hidden />
        <span className="event-title__month-text">{event.month}</span>
        <span className="event-title__rule" aria-hidden />
      </span>
    </Tag>
  )
}
