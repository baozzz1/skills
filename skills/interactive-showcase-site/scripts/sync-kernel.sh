#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
KERNEL="$ROOT/shared/kernel"
TEMPLATES="$ROOT/templates"

for template in explainer scrollytelling cards wiki; do
  dest="$TEMPLATES/$template"
  mkdir -p "$dest/src/styles" "$dest/src/layouts" "$dest/src/i18n" "$dest/src/components"
  cp "$KERNEL/.gitignore" "$dest/.gitignore"
  cp "$KERNEL/tsconfig.json" "$dest/tsconfig.json"
  cp "$KERNEL/src/styles/tokens.css" "$dest/src/styles/tokens.css"
  cp "$KERNEL/src/styles/global.css" "$dest/src/styles/global.css"
  cp "$KERNEL/src/layouts/BaseLayout.astro" "$dest/src/layouts/BaseLayout.astro"
  cp "$KERNEL/src/i18n/lang.svelte.ts" "$dest/src/i18n/lang.svelte.ts"
  cp "$KERNEL/src/components/ThemeToggle.svelte" "$dest/src/components/ThemeToggle.svelte"
  cp "$KERNEL/src/components/LangToggle.svelte" "$dest/src/components/LangToggle.svelte"
done
