import { site } from '../content/site'
import './SiteFooter.css'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <p className="site-footer__org">{site.organisation}</p>
        <p className="site-footer__credit">Duvdevan in Los Angeles · Beverly Hills · November 15, 2026</p>
      </div>
    </footer>
  )
}
