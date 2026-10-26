import { site } from '../content/site'
import './Rsvp.css'

/** The RSVP call to action. Renders nothing until `site.rsvp.url` is set. */
export function Rsvp({ className = '' }: { className?: string }) {
  const { url, label } = site.rsvp
  if (!url) return null
  return (
    <a
      className={`rsvp ${className}`}
      href={url}
      {...(url.startsWith('#') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
    >
      <span className="rec-dot" aria-hidden />
      {label}
      <span className="rsvp__sub">November 15</span>
    </a>
  )
}
