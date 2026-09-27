import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react'
import { primaryCta } from '../lib/content'
import './CtaButton.css'

type Props = { variant?: 'solid' | 'quiet'; className?: string }

export function CtaButton({ variant = 'solid', className = '' }: Props) {
  const cta = primaryCta()
  const Icon = cta.external ? ArrowUpRight : ArrowRight
  return (
    <a
      className={`cta cta--${variant} ${className}`}
      href={cta.href}
      {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span>{cta.label}</span>
      <Icon aria-hidden weight="regular" className="cta__icon" />
      {cta.external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}
