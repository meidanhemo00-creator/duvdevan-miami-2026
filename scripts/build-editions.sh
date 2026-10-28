#!/usr/bin/env bash
# Build duvdevanmission.com with two editions into dist/:
#   dist/      → "The Duvdevan Mission", from the git tag `mission-v1`
#   dist/la/      → Duvdevan in Los Angeles   (VITE_EDITION=la)
#   dist/tucson/  → Duvdevan in Tucson        (VITE_EDITION=tucson)
# Vercel runs this on every push (see vercel.json). Works locally too: npm run build:editions
set -euo pipefail
cd "$(dirname "$0")/.."
root="$PWD"
tag="mission-v1"
src="$(mktemp -d)/mission"
mkdir -p "$src"

# The tagged edition's source: from local git when the tag is present, else GitHub's tarball
# (Vercel clones shallowly, without tags).
if git rev-parse -q --verify "refs/tags/$tag" >/dev/null 2>&1; then
  git archive "$tag" | tar -x -C "$src"
else
  curl -fsSL "https://codeload.github.com/meidanhemo00-creator/duvdevan-miami-2026/tar.gz/refs/tags/$tag" \
    | tar -xz -C "$src" --strip-components=1
fi
ln -s "$root/node_modules" "$src/node_modules"

rm -rf dist
(cd "$src" && npx vite build --outDir "$root/dist" --emptyOutDir)
npx tsc -b
# One folder per edition (src/content/editions.ts). Each keeps only its own link-preview image.
for ed in la tucson; do
  VITE_EDITION=$ed npx vite build --outDir "dist/$ed" --emptyOutDir
  find "dist/$ed/media/og" -name '*-og.jpg' ! -name "$ed-og.jpg" -delete
done
echo "Built: / (mission-v1), /la/ and /tucson/"
