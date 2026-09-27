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

Raw footage is **not** committed. Web-encoded films (`public/media/video/*-720.mp4`,
about 10 MB or less each, see "Preparing a film") are committed and deploy with
the site. Larger films can be hosted externally and referenced by URL instead.

### Preparing a film

Films live in `public/media/video/` and are referenced from
`src/content/site.ts`. Encode each one for the web before use: 720p H.264 with
fast start keeps a one-minute film under ~10 MB.

```bash
ffmpeg -i input.mov -vf "scale=-2:720" -c:v libx264 -preset slow -crf 26 \
  -maxrate 1800k -bufsize 3600k -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 2 -movflags +faststart public/media/video/name-720.mp4
```

## Publish

The live site is on GitHub Pages:
https://meidanhemo00-creator.github.io/duvdevan-miami-2026/

After committing changes, run `npm run deploy`. It builds the site and pushes
the result to the `gh-pages` branch, which Pages serves.
