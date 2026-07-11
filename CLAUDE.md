# Agent Notes

This repository packages one Agent Skill, `interactive-showcase-site`, for Claude Code plugin marketplace installs and Agent Skills CLI installs.

## Project Layout

- `.claude-plugin/plugin.json`: Claude Code plugin manifest.
- `.claude-plugin/marketplace.json`: marketplace catalog; plugin source is `./`.
- `skills/interactive-showcase-site/SKILL.md`: router, shared contract, and scaffold workflow.
- `skills/interactive-showcase-site/references/`: per-archetype authoring APIs and checklists.
- `skills/interactive-showcase-site/shared/kernel/`: source of truth for synced token/theme/lang/layout files.
- `skills/interactive-showcase-site/templates/{explainer,scrollytelling,cards,wiki}/`: complete, independently buildable Astro + React scaffolds.
- `skills/interactive-showcase-site/scripts/`: kernel sync and validation scripts.
- `README.md` and `README.zh.md`: human-facing docs only. Keep them to two sections: intent and installation.

## Development Rules

- Keep every scaffold under `skills/interactive-showcase-site/templates/<archetype>/`; standalone skill installers may copy only the selected skill directory.
- In `SKILL.md`, refer to scaffold resources via `${CLAUDE_SKILL_DIR}/templates/<archetype>/`.
- Do not reintroduce `${CLAUDE_SKILL_DIR}/template/`.
- Treat template components, styles, config, lockfiles, package metadata, and the shared kernel as skill-level contracts. Per-output content generation should edit only copied output projects.
- When changing a template behavior, update the matching `references/<archetype>.md` authoring rules and verification checklist in the same change.
- Kernel files are edited in `shared/kernel/`, then synced with `scripts/sync-kernel.sh`. Do not hand-edit synced copies in only one template.
- Each template owns its own `package.json` and `bun.lock`; dependency differences are intentional.

## Verification

Run these before calling the package ready:

```shell
bun test skills/interactive-showcase-site/scripts/lib/template-library-contracts.test.mjs
sh skills/interactive-showcase-site/scripts/sync-kernel.sh
git diff --exit-code -- skills/interactive-showcase-site/shared/kernel skills/interactive-showcase-site/templates
bun skills/interactive-showcase-site/scripts/validate-template-library.mjs
for t in explainer scrollytelling cards wiki; do
  (cd "skills/interactive-showcase-site/templates/$t" && \
    bun install --frozen-lockfile && \
    bun run typecheck && \
    bun run build)
done
claude plugin validate .
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
```

Expected non-blocking output: Astro/Zod deprecation hints from `astro check` and a Vite chunk-size warning from Mermaid-heavy explainer builds.

Measured production JS (gzip, `dist/**/*.js`): cards ≈ 63 KB, scrollytelling ≈ 63 KB, wiki ≈ 122 KB (react-dom + @xyflow/react), explainer ≈ 1 MB (Mermaid-dominated). React's react-dom client is ≈ 58 KB gzip of the fixed baseline; it is non-blocking (Astro server-renders all content — islands only add interactivity).

## CSS Delivery: Aggregated, Not Scoped

React has no scoped styles, so every component's CSS lives in `src/styles/components/<name>.css` and is `@import`ed by the template's `src/styles/site.css`, which `BaseLayout` imports once. Because component CSS is always reachable through a page-level static import, it can never orphan into an island-only chunk — the failure mode that the deleted `check-svelte-css.mjs` used to guard is now structurally impossible. `validate-template-library.mjs`'s `checkStylesAggregated` asserts every component stylesheet is imported by `site.css`.

Two rules keep this working:
- Selectors inside a component stylesheet are namespaced under the component's root class (Svelte's scope hash is gone); bare element selectors (`svg`, `pre`, `a`) would otherwise leak page-wide.
- `global.css`'s `@media print` rule and MDX descendant rules target components by **bare class name**, so component markup keeps plain `className`s (never CSS Modules, which would rename them and silently break print styles).

## Preview Screenshots

When refreshing `docs/preview/` screenshots, serve the built template, not the dev server. The Astro dev toolbar must not appear in published previews.

```shell
cd skills/interactive-showcase-site/templates/<archetype>
bun run build && bun run preview
```

Take EN and ZH screenshots at 1920x1080, light theme, visible viewport only. The planned names are:

- `docs/preview/explainer-{en,zh}.png`
- `docs/preview/scrollytelling-{en,zh}.png`
- `docs/preview/cards-{en,zh}.png`
- `docs/preview/wiki-{en,zh}.png`
