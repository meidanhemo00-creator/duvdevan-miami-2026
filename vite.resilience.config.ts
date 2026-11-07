import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** duvdevanmission.com/resilience: the resilience programme page (its own root, own media). */
export default defineConfig({
  root: 'resilience',
  base: './',
  plugins: [react()],
  build: { outDir: '../dist/resilience', emptyOutDir: true },
  server: { port: 5181 },
})
