# Duvdevan in Miami — November 2026

Event landing page for Friends of Duvdevan. React + TypeScript + Vite.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Content

All event details, video sources, poster images and CTA links will live in a single
content file (`src/content/site.ts`). Placeholders render intentionally until real
values are supplied — nothing is invented.

## Media

Large video files are **not** committed (see `.gitignore`). Host them externally
(Vimeo/Mux/Cloudflare Stream/S3/CDN) and paste the URL into the content file.
