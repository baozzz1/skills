# Agent Notes

This repository packages one Agent Skill, `interactive-showcase-site`, for Claude Code plugin marketplace installs and Agent Skills CLI installs.

## Project Layout

- `.claude-plugin/plugin.json`: Claude Code plugin manifest.
- `.claude-plugin/marketplace.json`: marketplace catalog; plugin source is `./`.
- `skills/interactive-showcase-site/SKILL.md`: router, shared contract, and scaffold workflow.
- `skills/interactive-showcase-site/references/`: per-archetype authoring APIs and checklists.
- `skills/interactive-showcase-site/shared/kernel/`: source of truth for synced token/theme/lang/layout files.
- `skills/interactive-showcase-site/templates/{explainer,scrollytelling,cards,wiki}/`: complete, independently buildable Astro + Svelte scaffolds.
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
    bun run build && \
    bun ../../scripts/check-svelte-css.mjs .)
done
claude plugin validate .
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
```

Expected non-blocking output: Astro/Zod deprecation hints from `astro check`, a Vite chunk-size warning from Mermaid-heavy explainer builds, and Svelte Flow's unused `handleConnectionChange` warning in the wiki build.

## Known Gotcha: Svelte CSS Orphaned In Islands

Astro 6 + Svelte 5 can put scoped CSS for Svelte components used from MDX or hydrated islands into a separate CSS chunk that production HTML does not link. Dev mode can look correct while `bun run build && bun run preview` renders unstyled components.

Every interactive Svelte component used from MDX or a route must be side-effect imported in that route entry:

```astro
import '@/components/SomeIsland.svelte';
```

After `bun run build`, run:

```shell
bun ../../scripts/check-svelte-css.mjs .
```

from the template directory. The check must pass for every generated route; wiki has multiple HTML routes.

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
