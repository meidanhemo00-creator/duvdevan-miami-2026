import { Closing } from './components/Closing'
import { Evening } from './components/Evening'
import { Hero } from './components/Hero'
import { Field } from './components/Field'
import { Impact } from './components/Impact'
import { Mission } from './components/Mission'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { Unit } from './components/Unit'
import { useReveal } from './lib/useReveal'

export default function App() {
  useReveal()
  return (
    <>
      {/* Worn-stencil texture for the big type (used as filter: url(#grit)). */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
        <filter id="grit" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="11" result="wear" />
          <feColorMatrix
            in="wear"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4.2 0 0 0 3.45"
            result="holes"
          />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
      </svg>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Mission />
        <Evening />
        <Impact />
        <Unit />
        <Field />
        <Closing />
      </main>
      <SiteFooter />
    </>
  )
}
