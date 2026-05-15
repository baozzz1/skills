# Agent Notes

This repository packages one Agent Skill, `interactive-showcase-site`, for Claude Code plugin marketplace installs and Agent Skills CLI installs.

## Project Layout

- `.claude-plugin/plugin.json`: Claude Code plugin manifest.
- `.claude-plugin/marketplace.json`: marketplace catalog; plugin source is `./`.
- `skills/interactive-showcase-site/SKILL.md`: the skill instructions agents load.
- `skills/interactive-showcase-site/template/`: frozen Astro + Svelte scaffold copied by the skill.
- `README.md` and `README.zh.md`: human-facing docs only. Keep them to two sections: intent and installation.

## Development Rules

- Keep `template/` inside `skills/interactive-showcase-site/`; standalone skill installers may copy only the selected skill directory.
- In `SKILL.md`, refer to scaffold resources via `${CLAUDE_SKILL_DIR}/template/`.
- Treat template components, styles, config, lockfile, and package metadata as skill-level contracts. Per-output content generation should edit only copied output projects.
- When changing template behavior, update `SKILL.md` authoring rules and verification checklist in the same change.

## Verification

Run these before calling the package ready:

```shell
claude plugin validate .
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
cd skills/interactive-showcase-site/template
pnpm typecheck && pnpm build
# Also load the built artifact once — dev mode hides CSS-bundling bugs.
pnpm preview     # then visit http://127.0.0.1:4321/ in a browser
```

Expected non-blocking output: Astro/Zod deprecation hints from `astro check` and a Vite chunk-size warning from Mermaid.

## Known gotcha: Svelte CSS orphaned in MDX islands

**Symptom.** `pnpm dev` looks perfect, `pnpm preview` (and GitHub Pages) renders Lifecycle / Mermaid / Tabs as **unstyled flowing text** — the 6-step cards collapse into one line, Mermaid stays on "渲染中…", Tabs show all panels stacked.

**Cause.** Astro 6 + Svelte 5 puts the scoped CSS of Svelte components that MDX uses with `client:visible` into a **separate CSS chunk**, and then the generated `index.html` never emits a `<link rel="stylesheet">` for that chunk. Only `client:load` components rendered directly from `.astro` files (Hero, SectionNav, …) reach the page's main CSS. Dev mode masks the bug because Vite injects scoped styles at runtime — only the production build is broken.

**Fix.** Side-effect-import every interactive Svelte component once in the page entry so its CSS is force-pulled into the main page bundle:

```astro
// src/pages/index.astro (frontmatter)
import '@/components/Lifecycle.svelte';
import '@/components/Mermaid.svelte';
import '@/components/Tabs.svelte';
import '@/components/CodeBlock.svelte';
```

**Rules of thumb.**

- Any new Svelte component added to the MDX authoring API **must** be registered in that side-effect block. `SKILL.md` "Authoring API" calls this out — keep both in sync.
- Don't leave unused Svelte imports in MDX. They don't break the page on their own, but they end up naming the orphan CSS chunk and make this bug harder to spot.
- Never sign off on a template change with only `pnpm dev`. Always re-verify with `pnpm build && pnpm preview` (and ideally diff svelte hash classes — see below).

**Quick diff check** after `pnpm build`:

```shell
cd skills/interactive-showcase-site/template
diff \
  <(grep -oE 'svelte-[a-z0-9]+' dist/index.html              | sort -u) \
  <(grep -oE 'svelte-[a-z0-9]+' dist/_astro/index.*.css      | sort -u)
```

The diff must be empty. Any hash that appears in HTML but not in the CSS file is a missing-style regression — re-check the side-effect imports in `index.astro`.

## Preview screenshots

When refreshing `docs/preview/preview-{en,zh}.png` (or any screenshot that
ships in the repo), serve the **built** template, not the dev server. The
Astro dev toolbar floats at the bottom of every page in `astro dev` and
must NOT appear in published previews.

```shell
cd skills/interactive-showcase-site/template
pnpm build && pnpm preview     # http://127.0.0.1:4321/ — no dev toolbar
```

Other ways to guarantee the toolbar is hidden:

- Toggle the eye icon in the toolbar UI ("Hide toolbar"), persists per origin.
- Pass `--devToolbar=false` to `astro dev`, or set `devToolbar: { enabled: false }`
  in `astro.config.mjs` for the screenshot session only — revert before commit.

Take both `preview-en.png` and `preview-zh.png` at 1920×1080 (the spec
target), with theme = light. Trim to the visible viewport; do not pad.
