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

### Preparing a film

Films live in `public/media/video/` locally (git-ignored) and are referenced from
`src/content/site.ts`. Encode each one for the web before use: 720p H.264 with
fast start keeps a one-minute film under ~10 MB.

```bash
ffmpeg -i input.mov -vf "scale=-2:720" -c:v libx264 -preset slow -crf 26 \
  -maxrate 1800k -bufsize 3600k -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 2 -movflags +faststart public/media/video/name-720.mp4
```
