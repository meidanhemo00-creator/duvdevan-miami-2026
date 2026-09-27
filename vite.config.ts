import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base: the build works at a domain root or under a sub-path
  // (e.g. GitHub Pages at /duvdevan-miami-2026/).
  base: './',
  plugins: [react()],
})
