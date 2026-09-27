import { site } from '../content/site'
import './SiteFooter.css'

export function SiteFooter() {
  const { skyline } = site.credits
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <p className="site-footer__org">{site.organisation}</p>
        <p className="site-footer__credit">
          <a href={skyline.source} target="_blank" rel="noopener noreferrer">
            {skyline.text}
          </a>
          , licensed{' '}
          <a href={skyline.licenseUrl} target="_blank" rel="noopener noreferrer">
            {skyline.license}
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
