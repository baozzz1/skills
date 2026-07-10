#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
KERNEL="$ROOT/shared/kernel"
TEMPLATES="$ROOT/templates"

for template in explainer scrollytelling cards wiki; do
  dest="$TEMPLATES/$template"
  mkdir -p "$dest/src/styles/components" "$dest/src/layouts" "$dest/src/i18n" "$dest/src/components"
  cp "$KERNEL/.gitignore" "$dest/.gitignore"
  cp "$KERNEL/tsconfig.json" "$dest/tsconfig.json"
  cp "$KERNEL/src/styles/tokens.css" "$dest/src/styles/tokens.css"
  cp "$KERNEL/src/styles/global.css" "$dest/src/styles/global.css"
  cp "$KERNEL/src/styles/components/theme-toggle.css" "$dest/src/styles/components/theme-toggle.css"
  cp "$KERNEL/src/styles/components/lang-toggle.css" "$dest/src/styles/components/lang-toggle.css"
  cp "$KERNEL/src/layouts/BaseLayout.astro" "$dest/src/layouts/BaseLayout.astro"
  cp "$KERNEL/src/i18n/lang.ts" "$dest/src/i18n/lang.ts"
  cp "$KERNEL/src/components/ThemeToggle.tsx" "$dest/src/components/ThemeToggle.tsx"
  cp "$KERNEL/src/components/LangToggle.tsx" "$dest/src/components/LangToggle.tsx"
done

# site.css is deliberately NOT synced: each template @imports global.css plus a
# different set of component stylesheets, so its @import list is template-owned.
# checkStylesAggregated (validate-template-library.mjs) guards it instead.
