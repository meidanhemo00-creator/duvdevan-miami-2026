#!/usr/bin/env bash
# Build the site and publish it to the gh-pages branch (GitHub Pages).
# Usage: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
remote=$(git remote get-url origin)
tmp=$(mktemp -d)
cp -R dist/. "$tmp/"
touch "$tmp/.nojekyll" # serve files as-is, no Jekyll processing

cd "$tmp"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" \
    -c user.email="$(git -C "$OLDPWD" config user.email)" \
    commit -q -m "Deploy $(git -C "$OLDPWD" rev-parse --short HEAD)"
git push -q -f "$remote" gh-pages
rm -rf "$tmp"
echo "Deployed to gh-pages."
