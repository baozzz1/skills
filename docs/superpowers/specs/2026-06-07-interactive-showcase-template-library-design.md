# Interactive Showcase Site → Template Library — Design Spec

- **Date:** 2026-06-07
- **Status:** Approved design, pending implementation plan
- **Skill:** `skills/interactive-showcase-site/`
- **Author:** brainstormed with the repo owner (baozzz1)

## 1. Problem & Goal

Today `interactive-showcase-site` scaffolds exactly **one** site shape: a
single-page, token-driven, bilingual Astro + Svelte **explainer** (scroll-spy
TOC, autoplaying Lifecycle, click-to-detail Mermaid, Tabs). It is highly
opinionated and "template is the contract."

That one shape does not express every scenario well. Three reference sites the
owner admires each embody a *different* interaction archetype:

- **Anthropic — Recursive Self-Improvement** (`/institute/recursive-self-improvement`):
  a pinned visual "stage" that progressively redraws as the reader scrolls
  through dated narrative steps → the **evolution of one subject over time**.
- **poke-holo** (`poke-holo.simey.me`): pointer-tracked holographic trading
  cards → a **premium, tactile collection of discrete items**.
- **multi-agent.wiki**: a navigable multi-topic reference whose every concept
  page is anchored by an interactive node graph → a **knowledge atlas of many
  interrelated concepts**.

**Goal:** evolve the skill from *one template* into a **template library with
intent-based routing**. The agent picks the archetype that best expresses the
user's scenario, confirms it, then scaffolds that template. All four archetypes
share one design kernel (tokens, fonts, theme, bilingual, build/verify gates).

**Decisions locked during brainstorming:**

1. **Form:** site-level template library + router (one skill, four whole-site
   templates), *not* new section components inside the single explainer.
2. **v1 scope:** build all three new archetypes now (B + C + D), alongside the
   existing explainer (A).
3. **Holo intensity (C):** `glint` is the default (restrained, token-built
   sheen + slight tilt); the full holographic spectacle is an opt-in
   `data-mode="holo"`.
4. **Wiki diagram engine (D):** full `@xyflow/svelte` (svelte-flow) port —
   pan/zoom/minimap/node-click/multi-view playback, closest to multi-agent.wiki.

## 2. The Four Archetypes

The disambiguating axis is **how the reader moves through the content**.

| Key | Archetype | The ONE scenario it uniquely serves | Defining interaction | Reading model | Pages |
|---|---|---|---|---|---|
| **A** | **Explainer** (existing) | Explain ONE project/SDK/system in 4–8 sections | scroll-spy TOC + click-to-detail Mermaid + autoplay Lifecycle + Tabs | non-linear within one page, hash-deep-linkable | single |
| **B** | **Sticky-Stage Scrollytelling** | Narrate the **evolution of ONE subject over time** (3–7 ordered phases) on a persistent shared canvas | pinned stage redraws/accumulates as dated steps scroll past | forced-linear, scroll-position-driven | single |
| **C** | **Holographic Collectible Cards** | Present a **peer collection of N discrete items** (3–9) that each deserve to feel premium | pointer-tracked 3D tilt + holo foil/glare per card, springs back on leave | no reading order — a set of objects | single |
| **D** | **Knowledge-Wiki Diagram Atlas** | Document a **system of many (>8) interrelated concepts** where topology is the point | sidebar tree + on-this-page rail + per-concept pan/zoom/click node graph | self-directed exploration, deep cross-linking | **multi-page** |

**Crisp routing rules:**

- One subject, *changing over time* → **B**. One subject, *static structure* → **A**.
- Many items, *no relationships*, want delight → **C**. Many items *with
  relationships*, want reference → **D**.
- Fits in ≤8 sections → A or B. Needs >8 URLs → **D** (the only multi-page archetype).
- "Collection" is the trap word: a collection you *read linearly* is A/B; one
  you *fondle* is C; one you *navigate by relationship* is D.

## 3. Architecture

### 3.1 Repository layout

```
skills/interactive-showcase-site/
├── SKILL.md                      ← slimmed to: router + shared contract + per-archetype pointers
├── references/
│   ├── explainer.md              ← per-archetype authoring API (loaded only when that archetype is chosen)
│   ├── scrollytelling.md
│   ├── cards.md
│   └── wiki.md
├── shared/
│   └── kernel/                   ← SINGLE SOURCE OF TRUTH for kernel files
│       ├── styles/{tokens.css,global.css}
│       ├── layouts/BaseLayout.astro
│       ├── i18n/lang.svelte.ts
│       ├── components/{ThemeToggle.svelte,LangToggle.svelte}
│       ├── tsconfig.json
│       └── .gitignore
├── scripts/
│   └── sync-kernel.sh            ← copies shared/kernel/* into every templates/<archetype>/; CI runs it then asserts `git diff` is empty
└── templates/
    ├── explainer/                ← current template/ moved here verbatim (archetype A)
    ├── scrollytelling/           ← new (archetype B)
    ├── cards/                    ← new (archetype C)
    └── wiki/                     ← new (archetype D, only multi-page)
```

**Migration note:** the existing `skills/interactive-showcase-site/template/`
moves to `skills/interactive-showcase-site/templates/explainer/` unchanged
(its kernel files then become the seed for `shared/kernel/`). All `SKILL.md`
references to `${CLAUDE_SKILL_DIR}/template/` become
`${CLAUDE_SKILL_DIR}/templates/<archetype>/`.

### 3.2 Kernel delivery: sync, not assemble-at-scaffold

**Decision:** each `templates/<archetype>/` is a **complete, independently
buildable scaffold** that already contains a synced copy of the kernel. The
agent's scaffold step stays one `cp -R templates/<archetype>/ <output>`.

DRY-ness of the kernel is enforced **at skill-development time**, not at
scaffold time:

- `shared/kernel/` is the authoritative copy of every byte-identical kernel file.
- `scripts/sync-kernel.sh` copies those files into each template.
- CI runs `sync-kernel.sh` then fails if `git diff` is non-empty (i.e. a
  template's kernel drifted from the source of truth).

**Rationale:** keeps the per-output flow trivial and lets each template be
built/verified independently in CI. The alternative (base + overlay assembled
at scaffold time) pushes complexity onto every generation and breaks
"one `cp -R`."

### 3.3 Shared kernel vs template-specific

**SHARED (in `shared/kernel/`, identical across all four templates):**

| Kernel piece | Files |
|---|---|
| Design tokens | `styles/tokens.css`, `styles/global.css` (OKLCH palette, clay accent, paper-warm neutrals; no hex outside tokens) |
| Theme + lang bootstrap | `layouts/BaseLayout.astro` (pre-paint `data-theme`/`data-lang`, no FOUC) |
| Reactive lang store | `i18n/lang.svelte.ts` |
| Theme/lang controls | `components/ThemeToggle.svelte`, `components/LangToggle.svelte` |
| Build config baseline | `tsconfig.json`, `.gitignore` |

**NOT in the kernel (template-specific):**

- `package.json` + `bun.lock` — deps differ per template (wiki adds
  `@xyflow/svelte`; cards/scrollytelling may drop `mermaid`). Each template
  pins its own lockfile.
- `astro.config.mjs` — shared baseline, but each template owns its copy (wiki
  may differ; explainer keeps Shiki dual-theme + mdx + svelte). Kept per-template
  for clarity; **not** synced (a drift here is intentional).
- `i18n/strings.ts` — base UI keys are common but each template adds its own
  (lifecycle labels for A, step labels for B, card a11y labels for C, graph
  controls for D). Per-template; the EN/ZH parity rule still applies within each.
- `src/components/*` signature components, `src/pages/*` (or routes), and
  content shape — the differentiating surface.

| | A Explainer | B Scrollytelling | C Cards | D Wiki |
|---|---|---|---|---|
| Signature components | Mermaid, Lifecycle, Tabs, SectionNav, Hero | `StickyStage.svelte` | `HoloCardGrid` + `HoloCard` | `Sidebar`, `FlowGraph` (svelte-flow), playback control, prev/next pager |
| Layout shell | 1 page + fixed right TOC | scroll section: sticky frame + steps column | hero + responsive card grid | 3-column shell, multi-page routing |
| Motion model | click + scroll-spy | scroll-position → discrete states | pointer → continuous tilt/foil | click/drag/zoom + optional playback |
| Routing | single hash route | single page | single page | **multi-page** |

## 4. Routing & Selection Mechanism (SKILL.md core)

### 4.1 Selection-signal table (lives in SKILL.md)

| If the user says (or implies)… | Pick |
|---|---|
| "Explain how our SDK / agent loop / pipeline works"; "turn this README/docs into one interactive page" | **A** (default) |
| "Show the evolution of X over time"; "our journey"; "roadmap past→present→future"; "how it grew, keep the diagram visible" | **B** |
| "Showcase our N features/plans/tiers/team as premium cards"; "collectible feel"; "launch hero, make it feel special" | **C** |
| "Document this system — many interrelated parts"; "pattern catalog"; "explorable taxonomy/dependency map"; "which-one-do-I-pick decision matrix"; "30+ topics each needs its own page" | **D** |

**Anti-signals:** "many steps with unrelated visuals" → NOT B; "dense
tables/dashboard, legibility matters" → NOT C; "fits in 4–8 sections" → NOT D.

### 4.2 Gated proposal (hard rule)

Before scaffolding, the agent MUST: **name the archetype + give the reasoning
+ wait for user confirmation.** Wrong picks for **B** (forced-linear) and **D**
(multi-page) are expensive to reverse, so confirmation is mandatory for those.
When the request is ambiguous or describes one static system, default to **A**.
This mirrors the existing ">8 sections → ask to compress/split" gate.

## 5. Shared Contract (all four templates inherit)

Refactored from the current SKILL.md hard rules into a cross-template contract:

1. **Token is the contract.** No hex literals outside `tokens.css`; every
   color/border/radius/shadow/font is `var(--…)`. Foil, graph nodes, and
   scrollytelling stages all read tokens so they theme automatically.
2. **Bilingual is non-optional.** Every content unit exists in EN and ZH with
   matching `id`/`order`; a missing language is a build error (Zod refinement).
   New UI strings fill both `en` and `zh` keys.
3. **Theme:** system default, `[data-theme]` override, persisted pre-paint.
   Theme-flip must re-render anything that bakes color (Mermaid today; node
   graphs and stages tomorrow).
4. **Reduced-motion + dark mode + print are not optional.** All animation wraps
   in `@media (prefers-reduced-motion: no-preference)`; print hides
   nav/toggles/copy buttons.
5. **No AI-slop tropes.** No aggressive gradients (the holo mode is the *single
   sanctioned exception*, opt-in only), no emoji decoration, no left-border-stripe
   callouts, no SVG-drawn imagery (placeholders only), self-hosted Source Serif 4
   / IBM Plex Sans / JetBrains Mono only, OKLCH `color-mix`.
6. **CSS-orphan discipline.** Every interactive Svelte component used from MDX /
   islands MUST be side-effect-imported in its page entry, or Astro 6 + Svelte 5
   orphans its scoped CSS chunk and it renders unstyled in `build`/`preview`
   (works in `dev`). This rule is template-agnostic and bites all four.
7. **Static only.** Astro SSG, no backend, no runtime fetch. Bun + frozen lockfile.
8. **Verification gate.** Per template: `bun run typecheck && bun run build`
   must exit 0, plus the svelte-hash CSS-orphan diff check, before "done."
9. **`.gitignore` ships and stays correct** (node_modules/, dist/, .astro/,
   .env*, .DS_Store, log/, *.log, hosting metadata). Extend, never narrow.

## 6. Archetype B — Sticky-Stage Scrollytelling

### 6.1 Layout

```
┌──────────── .scrollSection (tall) ─────────────┐
│ ┌── .stickyFrame (pins) ──┐  ┌─ .steps column ─┐│
│ │  <svg> .stage            │  │ 2021 · step 1   ││  IntersectionObserver
│ │  redraws/accumulates     │  │ 2023 · step 2   ││  on each step →
│ │  per activeStep          │  │ 2025 · step 3   ││  activeIndex store
│ │  (draw-on / fade / move) │  │ Today · step 4  ││
│ └──────────────────────────┘  │ 20XX? · step 5  ││
│      position: sticky           └────────────────┘│
└────────────────────────────────────────────────┘
```

### 6.2 Components & API

- One island: `StickyStage.svelte`, hydrated `client:visible`, side-effect
  imported in the page entry.
- `IntersectionObserver` in `onMount` sets `activeIndex`; the `<svg>` stage
  elements bind `class:active` and reveal via `stroke-dashoffset` / opacity /
  transform. SVG (not canvas) so it is static-buildable and theme-via-tokens.
- **Constrained stage API** — authors do NOT hand-draw arbitrary SVG per state.
  They pick a `stageKind`:
  - `accumulating-graph` — nodes/edges appear cumulatively per step.
  - `layered-buildup` — layers of one diagram fade/slide in per step.
  - `highlight-on-shared` — one fixed diagram; each step highlights a region.
- Author content is a typed, bilingual ordered array:
  ```ts
  steps: Array<{
    period: string;            // "2021–2023" | "Today" | "20XX?"
    titleEn: string; titleZh: string;
    bodyEn: string;  bodyZh: string;
    stateKey: string;          // maps to a stage state
    alt: string;               // text description of this visual state (a11y)
  }>
  ```

### 6.3 Rules

- 3–7 steps (hard cap 7); each step needs enough body / min-height to create
  scroll distance for the pin to hold.
- No-JS / reduced-motion fallback: render a stacked timeline with each state's
  static visual inline above its step; the pin (`position: sticky`) itself is
  motion-neutral and may stay.
- The stage is `aria-hidden` with a per-step `alt`; the year + title + body
  text carries the whole narrative linearly. No scroll-jacking — IntersectionObserver
  only, never scroll-event hijacking.
- First screen: hero + first step + stage visible at 1920×1080.

## 7. Archetype C — Holographic Collectible Cards

### 7.1 Components & API

- `HoloCardGrid.svelte` (responsive grid wrapper) + `HoloCard.svelte` (one card),
  authored from MDX like Lifecycle/Tabs, both side-effect imported in the page entry.
- Pointer math writes CSS custom properties on the card: `--pointer-x/-y`,
  `--pointer-from-center`, `--background-x/-y`, `--rotate-x/-y`. CSS does the
  rendering: `.rotator` tilts via `perspective() rotateX/Y`; `.shine` composites
  the foil; `.glare` paints a radial highlight under the cursor.
- **Two modes:**
  - `glint` (**default**): restrained sheen built only from `--clay` / `--oat`
    / `--gray-100`, modest ~6–10° tilt. Fully on-brand.
  - `holo` (opt-in `data-mode="holo"`): full conic-gradient + scanline +
    `color-dodge`/`overlay` blend spectacle. The single sanctioned exception to
    the "no aggressive gradients" rule, recolored from tokens (no hex), only
    when the user explicitly wants it.
- Content: array of card objects, bilingual:
  ```ts
  cards: Array<{
    titleEn/Zh, subtitleEn/Zh,
    icon?: string, href?: string,
    chips?: Array<{labelEn/Zh, tone}>,
    variant?: 'standard' | 'featured' | 'gold'  // effect-intensity recipe
  }>
  ```

### 7.2 Rules

- 3–9 cards (perf + visual calm). Each card is a real focusable link/button
  with a `:focus-visible` ring; tilt is NOT triggered by focus (would jump).
- All foil/glare/scanline layers are `aria-hidden` + `pointer-events: none`,
  carry no information. Text stays outside the masked foil region (WCAG-AA
  against the brightest foil state).
- All tilt/foil/autoplay behind `@media (prefers-reduced-motion: no-preference)`;
  reduced-motion → flat token-styled cards with normal hover.
- Optional gyroscope (DeviceOrientation) path on touch devices is gesture-gated
  (iOS permission) and never required to reach content.

### 7.3 Brand-fit checkpoint (risk gate)

`glint` must feel premium using tokens alone. The implementation plan MUST
include a prototype checkpoint: if `glint` cannot be made to feel special
without hex/extra gradients, that is a signal C does not fit this design system
— decide cut-vs-keep on the prototype, not in the abstract.

## 8. Archetype D — Knowledge-Wiki Diagram Atlas (multi-page exception)

### 8.1 Layout

```
┌ Sidebar tree ─┐┌──── concept page ────┐┌ on-this-page ┐
│ Control/Flow  ││ Problem / structure   ││ ## heading    │
│ Info/Decision ││ ┌ FlowGraph (svelte-flow) ┐ scroll-spy │
│ … categories  ││ │ zoom/drag/minimap/      ││            │
│ aria-current  ││ │ node-click/multi-view   ││            │
└───────────────┘│ └─────────────────────┘ │└────────────┘
                 │ Impl / when-not-to-use + prev/next │
```

### 8.2 Structure & components

- **Multi-page Astro** (`[slug].astro` over a content collection) — the
  sanctioned exception to the single-page hard rule. Each concept page is
  mirrored `content/<concept>/{en,zh}` with shared `id`/`order`.
- Three-column shell: `Sidebar.svelte` category tree (nav landmark, `aria-current`)
  + content column + on-this-page rail (IntersectionObserver scroll-spy) +
  prev/next pager generated from a routes manifest. The single-page Hero/SectionNav
  are replaced by this shell.
- `FlowGraph.svelte` using `@xyflow/svelte`: Controls + MiniMap + Background,
  `fitView`, pan/drag, node-click focus, optional multi-view playback
  (play/pause + 0.5×–2× speed). **`zoomOnScroll` only when the canvas is
  focused/clicked** so it never hijacks page scroll. Node/edge colors bind to
  tokens and re-render on theme flip.
- Static Mermaid stays available for authored set-piece diagrams.

### 8.3 Content shape

```
per concept: { id, category, titleEn/Zh,
               prose: problem | structure | implementation | when-not-to-use,  // 4-question template
               graph: { nodes[], edges[], views?[] } }       // declarative; component lays out
global:      { categoryTree (drives sidebar), crossLinkMap (in-text links + taxonomy) }
optional:    decision matrix table, glossary, llms.txt alternate
```

### 8.4 Rules

- Selecting D requires **explicit user approval** (it breaks the single-page
  contract).
- The graph must be fully keyboard-operable (focus node, enter/space select,
  arrows move, escape) and expose a text equivalent (labeled list / surrounding
  prose) so screen-reader users are not locked out of diagram-only info.
- Animated playback honors reduced-motion (default static "all views", never
  auto-loop). Node color coding needs a non-color cue.
- New svelte-flow / playback components are side-effect imported (CSS-orphan rule).

## 9. Verification & CI

- **Per-template matrix.** Each `templates/<archetype>/` independently runs
  `bun install --frozen-lockfile && bun run typecheck && bun run build`, then
  `bun run preview` for manual walk-through, then the svelte-hash CSS-orphan
  diff (`grep svelte-… dist/index.html` vs `dist/_astro/index.*.css` must match;
  for the multi-page wiki, run the diff over each generated route).
- **Kernel sync check.** CI runs `scripts/sync-kernel.sh` then asserts
  `git diff --exit-code` (a drifted kernel fails the build).
- **Extend `.github/workflows`** PR dry-run from one build to a matrix over the
  four templates.
- Per-archetype verification checklists live in each `references/<archetype>.md`
  (B: pin holds + reduced-motion stacked fallback; C: glint default + holo opt-in
  + flat reduced-motion + focusable cards; D: keyboard graph + text-equivalent +
  no scroll hijack + prev/next correctness). The existing A checklist carries over.

## 10. Documentation sync

- **Project `CLAUDE.md`:** rewrite "Keep template/ inside…", the CSS-orphan
  gotcha, and the preview-screenshot section for the multi-template layout
  (`templates/<archetype>/`, kernel sync, per-template gotcha + screenshots).
- **`README.md` / `README.zh.md`:** keep the two-section (intent + install)
  shape; update intent to "template library, routed by scenario."
- **`.claude-plugin/plugin.json` + `marketplace.json`:** broaden the skill
  `description` to "selects the right interactive template for the scenario."
- **`docs/preview/`:** one screenshot pair (EN/ZH, 1920×1080, light, built not
  dev) per template.

## 11. Non-goals (YAGNI)

- No generic "any interaction" engine — only these four archetypes.
- No backend / runtime data fetching / auth.
- Wiki multi-view playback is optional, not required for a valid D site.
- No new fonts, no Tailwind/utility classes, no per-output framework swaps.

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| 4 templates rot (4× CSS-orphan, 4× light/dark/reduced-motion/print, SKILL drift) | `shared/kernel/` + `sync-kernel.sh` + CI matrix; per-archetype reference checklists |
| D is the highest-cost archetype (multi-page routing + svelte-flow port + 3-col shell) | Build it last in the plan; isolate the svelte-flow theming work; keep static Mermaid as the light path for simple diagrams |
| C `glint` can't feel premium with tokens alone | Prototype checkpoint (§7.3) — decide cut-vs-keep on the prototype |
| Agent routes to the wrong archetype | Mandatory gated proposal (§4.2); default to A on ambiguity |
| svelte-flow scroll-hijack / a11y regressions | `zoomOnScroll` only when focused; keyboard ops + text equivalent required in the D checklist |
| Migration breaks existing installs | Skill name unchanged; only internal path `template/ → templates/explainer/`; update all `${CLAUDE_SKILL_DIR}` references in lockstep |

## 13. Acceptance criteria

- One skill routes to four templates; SKILL.md contains the selection table and
  the gated-proposal rule; choosing B/D prompts explicit confirmation.
- `templates/{explainer,scrollytelling,cards,wiki}/` each build clean
  (`typecheck` + `build` exit 0) and pass the svelte-hash diff; the wiki builds
  multiple routes.
- `shared/kernel/` is the single source of truth; `sync-kernel.sh` + CI diff
  enforce no drift; `tokens.css` is byte-identical across templates.
- Every template is bilingual EN/ZH (missing language = build error), supports
  light/dark + reduced-motion + print, and uses no hex outside tokens.
- C defaults to `glint`; `holo` is opt-in. D defaults to static graph under
  reduced-motion; graph is keyboard-operable with a text equivalent.
- Project CLAUDE.md, READMEs, plugin/marketplace description, and per-template
  preview screenshots are updated; CI runs the per-template matrix.

## 14. Recommended build phasing (for the implementation plan)

0. **Kernel extraction** — move `template/ → templates/explainer/`, factor
   `shared/kernel/`, write `sync-kernel.sh`, wire the CI matrix + kernel diff.
1. **Router** — rewrite SKILL.md into router + shared contract + per-archetype
   reference pointers; add selection table + gated proposal.
2. **B — Scrollytelling** — biggest new capability, lowest architectural risk
   (single page, single component, inherits kernel).
3. **C — Cards** — single page, kernel-inheriting; gate on the `glint` brand-fit
   prototype before full commit.
4. **D — Wiki** — last: multi-page routing, svelte-flow port, 3-column shell.
5. **Docs + previews** — CLAUDE.md / READMEs / plugin description / screenshots.
