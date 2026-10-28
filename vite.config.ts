import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { editions } from './src/content/editions'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Fills the %ED_*% placeholders in index.html from the chosen edition (VITE_EDITION). */
function editionHead(key: string): Plugin {
  const e = editions[key]
  if (!e) throw new Error(`Unknown VITE_EDITION "${key}"`)
  const map: Record<string, string> = {
    ED_TITLE: e.html.title,
    ED_DESCRIPTION: e.html.description,
    ED_OG_TITLE: e.html.ogTitle,
    ED_OG_DESCRIPTION: e.html.ogDescription,
    ED_OG_IMAGE_ALT: e.html.ogImageAlt,
    ED_SLUG: e.slug,
  }
  return {
    name: 'edition-head',
    transformIndexHtml: (html) => html.replace(/%(ED_[A-Z_]+)%/g, (m, k) => (k in map ? esc(map[k]) : m)),
  }
}

export default defineConfig(({ mode }) => {
  // loadEnv also picks up VITE_EDITION from the shell environment.
  const key = loadEnv(mode, '.', 'VITE_').VITE_EDITION || 'la'
  return {
    // Relative base: the build works at a domain root or under a sub-path
    // (e.g. duvdevanmission.com/la/ or GitHub Pages).
    base: './',
    plugins: [react(), editionHead(key)],
  }
})
