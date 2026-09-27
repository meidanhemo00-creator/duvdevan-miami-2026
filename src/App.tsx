import { Closing } from './components/Closing'
import { Evening } from './components/Evening'
import { Hero } from './components/Hero'
import { Impact } from './components/Impact'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { Unit } from './components/Unit'
import { useReveal } from './lib/useReveal'

export default function App() {
  useReveal()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Evening />
        <Impact />
        <Unit />
        <Closing />
      </main>
      <SiteFooter />
    </>
  )
}
