import { useEffect } from 'react'

/**
 * One shared IntersectionObserver for every `[data-reveal]` element.
 * Reveals are one-shot: once an element has entered, it stays revealed,
 * so scrolling back up never replays motion.
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('reveal-ready')

    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-inview', ''))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-inview', '')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
