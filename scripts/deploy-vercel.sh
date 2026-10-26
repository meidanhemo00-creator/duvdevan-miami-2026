#!/usr/bin/env bash
# Deploy duvdevanmission.com on Vercel with two editions side by side:
#   /      → "The Duvdevan Mission" (frozen at the git tag `mission-v1`)
#   /la/   → the current branch (Duvdevan in Los Angeles)
# Both builds use relative asset paths (vite base './'), so each works in its folder.
# Usage: npm run deploy:vercel
set -euo pipefail
cd "$(dirname "$0")/.."
root="$PWD"
out="$root/.vercel-out"
wt="$(mktemp -d)/mission"
rm -rf "$out" && mkdir -p "$out"

# 1 · The main edition, from its tag, in a temporary worktree
git worktree add -q "$wt" mission-v1
ln -s "$root/node_modules" "$wt/node_modules"
(cd "$wt" && npx vite build --outDir "$out" --emptyOutDir >/dev/null)
git worktree remove --force "$wt"

# 2 · The Los Angeles edition, from the working tree
npx tsc -b
npx vite build --outDir "$out/la" --emptyOutDir >/dev/null

# 3 · Static deploy: no build on Vercel; /la always gets its trailing slash
cat > "$out/vercel.json" <<'JSON'
{
  "buildCommand": "",
  "installCommand": "",
  "outputDirectory": ".",
  "framework": null,
  "redirects": [{ "source": "/la", "destination": "/la/", "permanent": true }]
}
JSON
mkdir -p "$out/.vercel" && cp "$root/.vercel/project.json" "$out/.vercel/project.json"

(cd "$out" && npx --yes vercel@latest deploy --prod --yes)
