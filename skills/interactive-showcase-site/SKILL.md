---
name: interactive-showcase-site
description: Select and scaffold the right Astro + Svelte interactive documentation template for a project README, SDK, docs folder, concept collection, or technical narrative. Includes bilingual EN/ZH content, light/dark theme, and build verification.
---

# Interactive Showcase Site

This skill turns source material into a buildable, deployable interactive site.
It is now a **template library with intent-based routing**:

- **A Explainer**: one static project/system in 4-8 sections.
- **B Sticky-Stage Scrollytelling**: one subject evolving over 3-7 ordered phases.
- **C Holographic Collectible Cards**: 3-9 peer items that should feel premium and tactile.
- **D Knowledge-Wiki Diagram Atlas**: many interrelated concepts where topology and cross-linking matter.

The skill keeps one shared design kernel across all templates: warm editorial
tokens, self-hosted typography, live EN/ZH language toggle, light/dark theme,
reduced-motion support, print discipline, static Astro output, and Bun frozen
lockfile verification.

## When To Use

Use this skill when the user asks to turn a README, SDK, project docs folder,
technical design, system map, feature set, roadmap, or concept catalog into an
interactive documentation site.

Do not use it for:

- Single-file HTML artifacts for chat/PR attachment.
- Generic blogs or marketing landing pages with no technical explanation.
- Sites needing auth, backend APIs, runtime fetch, dashboards, or user data.
- Dense data tables where a normal docs/dashboard framework is clearer.

## Archetype Router

Before scaffolding, classify the request by how the reader should move through
the content:

| If the user says or implies | Pick |
|---|---|
| "Explain how this SDK / agent loop / pipeline works"; "turn this README/docs into one interactive page"; one static system with 4-8 sections | **A Explainer** |
| "Show the evolution of X"; "our journey"; "roadmap past to present to future"; "keep the diagram visible while the story advances" | **B Sticky-Stage Scrollytelling** |
| "Showcase these features/plans/tiers/team members as premium cards"; "collectible feel"; "launch hero, make each item feel special" | **C Holographic Collectible Cards** |
| "Document many interrelated parts"; "pattern catalog"; "taxonomy/dependency map"; "which one do I pick"; "30+ topics, each needs its own page" | **D Knowledge-Wiki Diagram Atlas** |

Anti-signals:

- Many unrelated steps with different visuals -> not B.
- Dense tables, dashboards, or legibility-first content -> not C.
- Fits in 4-8 sections -> usually not D.
- One subject with static structure -> A, not B.
- Many items with no relationships and delight matters -> C, not D.
- Many items with relationships/topology and reference use -> D, not C.

## Mandatory Gated Proposal

Do not scaffold immediately.

1. Name the selected archetype.
2. Give the routing reason in 2-4 sentences.
3. Name the template path: `${CLAUDE_SKILL_DIR}/templates/<archetype>/`.
4. Wait for explicit user confirmation.

Confirmation is mandatory for all archetypes. It is especially important for B
because forced-linear scrollytelling is expensive to unwind, and for D because
it is the only multi-page archetype.

When ambiguous, default to A and ask whether the user wants the single-page
explainer shape or a more specialized template.

## Load The Archetype Reference

After the user confirms, read exactly one reference file before planning the
site content:

- A: `${CLAUDE_SKILL_DIR}/references/explainer.md`
- B: `${CLAUDE_SKILL_DIR}/references/scrollytelling.md`
- C: `${CLAUDE_SKILL_DIR}/references/cards.md`
- D: `${CLAUDE_SKILL_DIR}/references/wiki.md`

The reference defines the authoring API, editable files, output shape, and
verification checklist for that archetype.

## Shared Contract

These rules apply to every template.

1. **Template is the contract.** Copy a complete scaffold from
   `${CLAUDE_SKILL_DIR}/templates/<archetype>/`. Do not assemble templates from
   parts during user-site generation.
2. **Token is the contract.** All colors, borders, radii, shadows, and fonts use
   variables from `src/styles/tokens.css`. No hex literals outside tokens, except
   the inline favicon SVG in `BaseLayout.astro`.
3. **Bilingual is non-optional.** Every content unit must exist in EN and ZH
   with matching `id` and `order` or matching object identity. UI strings must
   fill both `en` and `zh`.
4. **Theme and language are pre-paint.** `BaseLayout.astro` sets
   `data-theme`/`data-lang` before first paint. Do not remove the toggles.
5. **Reduced-motion, dark mode, and print are not optional.** Motion is gated by
   `prefers-reduced-motion`; print hides nav/toggles/copy controls and keeps the
   narrative readable.
6. **No AI-slop tropes.** No emoji decoration, aggressive gradients, left-border
   stripe callouts, Tailwind utility drift, system fonts, or SVG illustration
   slop. C's opt-in `holo` mode is the single sanctioned high-sheen exception.
7. **Static only.** Astro SSG, no backend, no auth, no runtime fetch.
8. **CSS-orphan discipline.** Every interactive Svelte component used from MDX
   or island content must be side-effect imported in the page entry, or Astro 6
   + Svelte 5 can emit unlinked scoped CSS in production.
9. **`.gitignore` ships and stays correct.** Keep exclusions for `node_modules/`,
   `dist/`, `.astro/`, `.env*`, `.DS_Store`, `log/`, `*.log`, and hosting
   metadata. Extend it when deploy tools create new generated directories.

## Output Flow

1. Receive source material: local docs folder, markdown file, repository URL, or
   natural-language description.
2. Route to an archetype and wait for confirmation.
3. Read the matching reference file.
4. Determine output path. If the target exists, is non-empty, and does not look
   like a previous output from this skill, stop and ask before overwriting.
5. Draft the first-screen story and content outline using the chosen archetype's
   shape. Wait for approval when the outline materially affects structure.
6. Scaffold:

```shell
cp -R "${CLAUDE_SKILL_DIR}/templates/<archetype>/" <output-path>
cd <output-path>
bun install --frozen-lockfile
```

If `bun` is unavailable, a local `npm`/`pnpm` install may be used only for the
copied output project; do not commit alternate lockfiles back to this skill
package unless the user explicitly changes package managers.

7. Generate bilingual content only in the editable areas named by the reference.
8. Verify:

```shell
bun run typecheck
bun run build
```

For skill-template development inside this repo, also run:

```shell
bun ../../scripts/check-svelte-css.mjs .
```

from the template directory.

## Shared Template Development Notes

The authoritative kernel lives in:

```text
skills/interactive-showcase-site/shared/kernel/
```

Sync it into every template with:

```shell
sh skills/interactive-showcase-site/scripts/sync-kernel.sh
```

Then assert no drift:

```shell
git diff --exit-code -- skills/interactive-showcase-site/shared/kernel skills/interactive-showcase-site/templates
```

Before declaring this skill package ready, run:

```shell
bun test skills/interactive-showcase-site/scripts/lib/template-library-contracts.test.mjs
sh skills/interactive-showcase-site/scripts/sync-kernel.sh
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

Expected non-blocking output: Astro/Zod deprecation hints from `astro check`
and a Vite chunk-size warning from Mermaid-heavy builds.

## Resources

- `engineering-artifact-design`: source visual language and anti-slop rules.
- Astro content collections: https://docs.astro.build/en/guides/content-collections/
- Svelte runes: https://svelte.dev/docs/svelte/$state
- Mermaid flowcharts: https://mermaid.js.org/syntax/flowchart.html
- Svelte Flow: https://svelteflow.dev/
