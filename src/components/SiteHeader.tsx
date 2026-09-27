import { site } from '../content/site'
import { CtaButton } from './CtaButton'
import { LogoMark } from './LogoMark'
import './SiteHeader.css'

const links = [
  { href: '#evening', label: 'The evening' },
  { href: '#impact', label: 'The impact' },
  { href: '#unit', label: 'The unit' },
  { href: '#invitation', label: 'Invitation' },
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
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__cta">
          <CtaButton variant="quiet" />
        </div>
      </div>
    </header>
  )
}
