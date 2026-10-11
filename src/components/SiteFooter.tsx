import { site } from '../content/site'
import './SiteFooter.css'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <p className="site-footer__org">{site.organisation}</p>
        <p className="site-footer__credit">The Duvdevan Mission · United States · 2026</p>
      </div>
    </footer>
  )
}
