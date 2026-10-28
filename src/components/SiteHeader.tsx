import { site } from '../content/site'
import { LogoMark } from './LogoMark'
import './SiteHeader.css'

const links: { href: string; label: string }[] = [
  { href: '#mission', label: 'The mission' },
  { href: '#evening', label: site.evening.heading },
  { href: '#impact', label: 'The impact' },
  { href: '#unit', label: 'The unit' },
  { href: '#field', label: 'In the field' },
  { href: '#invitation', label: 'Invitation' },
  ...(site.rsvp.url ? [{ href: site.rsvp.url, label: site.rsvp.label }] : []),
]

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__org" href="#top" aria-label={site.organisation}>
          <span className="site-header__org-text" aria-hidden>
            {site.organisation}
          </span>
          <span className="site-header__org-logo" aria-hidden>
            <LogoMark />
          </span>
        </a>
        <nav className="site-header__nav" aria-label="Scenes">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} {...(l.href.startsWith('#') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <span className="site-header__progress" aria-hidden />
    </header>
  )
}
