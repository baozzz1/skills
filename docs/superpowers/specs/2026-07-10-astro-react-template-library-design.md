# Template Library: Svelte → React — Design Spec

- **Date:** 2026-07-10
- **Status:** Approved design, pending implementation plan
- **Skill:** `skills/interactive-showcase-site/`
- **Author:** brainstormed with the repo owner (baozzz1)
- **Supersedes framework choice in:** `2026-06-07-interactive-showcase-template-library-design.md` (that spec's architecture, routing, and archetype contracts remain in force)

## 1. Problem & Goal

The template library ships four Astro scaffolds whose interactive islands are
Svelte 5 components. The repo owner is the sole long-term maintainer of this
skill and is not fluent in Svelte 5 runes. A codebase its owner cannot read
comfortably rots; that cost compounds over time.

**Goal:** convert all four templates from Astro + Svelte to Astro + React,
delete Svelte from the repository, and take the architectural dividend the
conversion makes available — the removal of the orphaned-scoped-CSS gotcha and
its entire tooling class.

### 1.1 What was measured before deciding

| Measurement | Value | Method |
|---|---|---|
| Total `.svelte` source | 4048 lines (1976 in `<style>`, 2072 markup+script) | `wc -l` over 24 files |
| De-duplicated rewrite surface | **2855 lines across 14 unique components** | kernel synced ×4; `CodeBlock`/`Mermaid` byte-identical in explainer+wiki |
| `cards` template JS today | **17.4 KB gzip** (Svelte runtime 11.4 KB of it) | `bun run build` + `gzip -c` over `dist/**/*.js` |
| `cards` template JS after React | **≈ 50 KB gzip** (react + react-dom baseline ≈ 45 KB) | estimate; must be re-measured at acceptance |
| Files mentioning `svelte` outside components | 44 | `grep -rli` |
| Svelte-only constructs used | **zero** `transition:` / `animate:` / `use:` / `<slot>` / `{#snippet}` / `svelte/store` / `svelte/motion` / `createEventDispatcher` / `getContext` | targeted greps |
| Actually used Svelte API | `$state` ×47, `$derived` ×82, `$props` ×14, `$effect` ×8, `bind:this` ×3, `onMount` ×10, `:global()` ×65 | targeted greps |

### 1.2 Honest accounting of the trade

**The migration does not improve the generated sites.** Nothing about the
artifact gets faster, smaller, or more interactive. The costs and benefits:

- **Cost — bundle:** +≈33 KB gzip per page, permanently, on every site the
  skill will ever generate. Astro ships `react-dom` on every page because every
  template hydrates at least the two kernel toggles. This is **non-blocking**:
  Astro server-renders all content, and every island is a toggle, a scroll-spy,
  Mermaid, or xyflow. None gate first paint or content. What the 33 KB delays is
  *toggle interactivity*, not text.
- **Cost — one-time work:** 2855 lines rewritten, 44 files touched, 4 lockfiles
  regenerated, screenshots restaged.
- **Cost — latent bugs surfaced:** Svelte's scope hash currently masks three
  real class-name collisions (§4.3). They must be fixed, not inherited.
- **Benefit — owner fluency:** compounding, and the reason for the decision.
- **Benefit — agent authoring reliability:** `references/explainer.md:22` is the
  one place the skill authorizes an agent to write framework code
  (`src/components/*Diagram.svelte`). Svelte 5 runes shipped Oct 2024; models
  frequently regress to Svelte 4 idioms (`export let`, `$:`, stores). React
  hooks have an incomparably larger corpus. This narrows to one authoring slot
  in one archetype, but it is the highest-risk slot.
- **Benefit — `@xyflow/react` is upstream:** the Svelte bindings are the port.
- **Benefit — simpler `SectionNav`:** the rune-specific footgun documented at
  `SectionNav.svelte:167-182` ("read `items` before the `mounted` short-circuit
  or the effect never subscribes") has no React analogue; `useEffect` deps are
  explicit.

**Not a benefit of React:** deleting the orphaned-CSS tooling class. That is
achievable today by moving Svelte `<style>` blocks into global CSS. It is
counted here only because React *forces* the CSS decision, making it the natural
moment to collect it. Do not credit React with it.

### 1.3 Decisions locked during brainstorming

1. **Stay on Astro.** Leaving for Next/Vite would bolt a second migration
   (content collections → contentlayer, `getStaticPaths` → `generateStaticParams`,
   Shiki → rehype-pretty-code) onto this one and lose `client:visible` lazy
   hydration.
2. **No framework coexistence.** The kernel toggles appear on every page, so a
   React kernel means four React templates. Astro can host two renderers, but
   that ships both runtimes on one page — strictly worse than either choice.
   Svelte is deleted, not retained as a variant.
3. **Component CSS is plain CSS, statically aggregated.** Not CSS Modules, not
   Tailwind, not vanilla-extract. Rationale in §4.
4. **`useSyncExternalStore` for language, plain `useState` for theme.** §3.

## 2. Scope

**In scope:** `shared/kernel/`, all four `templates/`, `scripts/`, `SKILL.md`,
`references/*.md`, `.claude-plugin/*.json`, `.github/workflows/`, `CLAUDE.md`,
`README.md`, `README.zh.md`.

**Out of scope:** the archetype router, the selection-signal table, the gated
proposal rule, content shapes, the design-token palette, and the bilingual
content model. Those contracts from the 2026-06-07 spec are unchanged. This is a
renderer swap plus a CSS-delivery change, not a redesign.

## 3. Kernel: React Form

```
shared/kernel/src/
  i18n/lang.ts                     ← was lang.svelte.ts
  i18n/strings.ts                  ← unchanged (framework-agnostic, agent-editable)
  components/ThemeToggle.tsx       ← was ThemeToggle.svelte
  components/LangToggle.tsx        ← was LangToggle.svelte
  layouts/BaseLayout.astro         ← one import line changes (§4.1)
  styles/tokens.css                ← only a stale "svelte" comment removed
  styles/global.css                ← unchanged content
  styles/components/theme-toggle.css   ← NEW (extracted from ThemeToggle)
  styles/components/lang-toggle.css    ← NEW (extracted from LangToggle)
  tsconfig.json                    ← gains "jsx": "react-jsx"
```

### 3.1 Language store

The source of truth **stays `<html data-lang>`**. It cannot move into JS state
because three independent consumers depend on it living in the DOM:

- the pre-paint inline script in `BaseLayout.astro` sets it before hydration;
- `global.css` addresses it via `[data-lang-only="zh"|"en"]` to show/hide the
  two rendered language copies;
- `SectionNav`'s scroll-spy skips hidden-language headings by testing
  `el.getClientRects().length === 0`.

`lang.ts` exports:

```ts
export function useLang(): Lang       // useSyncExternalStore
export function useStrings(): Strings // STRINGS[useLang()]
export function currentLang(): Lang   // imperative read, SSR-safe
export function setLang(next: Lang): void
```

`useLang()` is implemented as:

- `subscribe` — a `MutationObserver` on `document.documentElement` with
  `attributeFilter: ['data-lang']`;
- `getSnapshot` — read the attribute, coerce to `'en' | 'zh'`;
- `getServerSnapshot` — return `DEFAULT_LANG`.

This is not merely *a* correct port; it is the primitive React provides for
exactly this problem. During hydration React renders with `getServerSnapshot()`,
which matches the SSR HTML byte-for-byte, then immediately re-renders from
`getSnapshot()`. **A hydration mismatch is structurally impossible.** The Svelte
version's `$state` version counter existed only to dodge the
`state_unsafe_mutation` guard and disappears.

Do **not** use React Context or an external store library. Both would duplicate
a source of truth that must remain a DOM attribute.

### 3.2 Theme

`ThemeToggle` is the only theme consumer; the CSS cascade (`[data-theme]`) does
all reactive work. Port as `useState<Theme>('system')` plus a mount-time
`useEffect` that reads the attribute — a 1:1 match for the current `$effect`.
No store.

## 4. CSS Delivery

### 4.1 Static aggregation

Each template gains a **template-owned** aggregation point, deliberately *not*
kernel-synced (its `@import` list differs per template):

```css
/* templates/<archetype>/src/styles/site.css */
@import './global.css';                    /* kernel-synced; loads first */
@import './components/theme-toggle.css';   /* component rules load after */
@import './components/lang-toggle.css';    /*   → component wins specificity ties */
@import './components/holo-card.css';
```

`BaseLayout.astro` changes exactly one line:

```diff
-import '@/styles/global.css';
+import '@/styles/site.css';
```

Because `site.css` is imported by a **page-level Astro layout**, every component
rule is reachable through a static import graph. CSS can never be reachable only
through an island's dynamically-imported JS chunk. **The orphaned-chunk failure
mode becomes structurally impossible**, rather than merely detected after the
fact.

Import order is load-bearing: `global.css` first, component CSS after, so a
component rule beats a global rule of equal specificity. This reproduces the
practical effect of Svelte's scope hash without the hash.

### 4.2 Why not CSS Modules

`global.css` targets component-internal elements by **bare class name**:

```css
@media print {
  .section-nav, .section-toc, .theme-toggle, .copy-btn, .lifecycle-controls {
    display: none !important;
  }
}
.tabs-wrap pre:not(.astro-code):not(.shiki) { /* styles MDX-rendered <pre> */ }
```

Svelte compiles `class="theme-toggle"` to `class="theme-toggle svelte-abc123"` —
the bare name survives, so these rules match. CSS Modules compiles
`className={s.themeToggle}` to `class="_themeToggle_x7f2a_1"` — **the bare name
disappears and the print stylesheet silently dies.** No build error, no test
failure. Recovering it requires a hand-written `:global()` for every one of the
five cross-boundary hooks, plus a replacement orphan-chunk checker, in exchange
for isolation this codebase demonstrably does not need (26 global class names
total; the collision set is three).

### 4.3 Collisions Svelte scoping is currently masking

Enumerated by intersecting each component's `<style>` selectors with
`global.css`'s 26 class names.

**Genuine conflicts — must fix:**

| Class | Conflict | Resolution |
|---|---|---|
| `.card` | `global.css:298` `.card:hover { transform: translateY(-2px) }` vs `HoloCard`'s `transform: perspective(900px) rotateX() rotateY()` | **rename to `.holo-card`** (cards template only) |
| `.eyebrow` | `Hero` overrides `global.css:107` | preserved by §4.1 import order; add a comment fixing the intent |
| `.panel` | `Tabs` overrides `global.css:281` | same as above |

The `.card` case is subtler than it looks and the rename is **mandatory, not
cosmetic**. Inspecting the current built CSS (`cards/dist/_astro/index.*.css`):

```
offset 15754   .card:hover     { transform: translateY(-2px) }   /* global,  (0,2,0) */
offset 19023   .card.svelte-eh { transform: perspective(900px) } /* scoped,  (0,2,0) */
```

The two selectors have **equal specificity**. The tilt survives today only
because the scoped rule is emitted *later*. Svelte's scope hash is producing a
tie, not a win. Strip the hash and `.card { transform: perspective() }` becomes
`(0,1,0)` while `.card:hover { transform: translateY(-2px) }` stays `(0,2,0)` —
the global rule then wins **on specificity, regardless of import order**, and the
holographic tilt collapses on hover. Renaming is the only order-independent fix.

Renaming is safe: `HoloCard`'s own rule already sets `background`, `border`,
`border-radius`, `box-shadow`, `transition`, and `padding: 0` — it inherits
nothing from `global .card`. (The explicit `padding: 0` is evidence it has been
fighting the global rule all along.)

**Intentional cross-boundary hooks — must preserve bare names:**
`.theme-toggle`, `.copy-btn`, `.section-nav`, `.section-toc` (print rules),
`.tabs-wrap` (descendant selector onto MDX output). §4.1 preserves all five with
no action.

**Pre-existing defect found while enumerating this set:** `global.css:397`'s
print rule selects `.lifecycle-controls`, but no component defines that class —
`Lifecycle.svelte` uses `.lifecycle-head` and `.ctrl`. The rule has never hidden
the lifecycle playback controls in print output. Fix it in phase 2 by selecting
the classes that actually exist.

**`@keyframes`:** `node-in`, `edge-in` (scrollytelling), `mm-spin` (Mermaid).
No current collision. Prefix each with its component name anyway; Svelte was
localizing these names and the protection is being removed.

## 5. Tooling: Net Deletion

### 5.1 Delete

- `scripts/check-svelte-css.mjs` (whole file)
- `scripts/lib/template-library-contracts.mjs`: `SVELTE_HASH_RE`,
  `extractSvelteHashes`, `missingSvelteHashes`
- `scripts/lib/template-library-contracts.test.mjs`: the hash-extraction tests
  and `Foo.svelte` fixtures
- `scripts/validate-template-library.mjs`: `checkSideEffectImports`,
  `referencedSvelteComponents`
- `CLAUDE.md`: the entire "Known Gotcha: Svelte CSS Orphaned In Islands" section
- `SKILL.md` + all four `references/*.md`: the side-effect-import mandate
- `.github/workflows/dry-run-template.yml:91`: the `check-svelte-css.mjs` step
- each template's `src/pages/*.astro`: the side-effect import lines

### 5.2 Add

- `scripts/lib/template-library-contracts.mjs`: `stylesAggregated(siteCss, componentCssFiles)`
  — pure function returning the component CSS files not `@import`ed by `site.css`.
- `scripts/validate-template-library.mjs`: `checkStylesAggregated()` calling it
  per template. ≈20 lines, replacing the entire deleted class.
- `scripts/validate-template-library.mjs`: `checkDuplicatedComponents()` — assert
  `explainer/src/components/{CodeBlock,Mermaid}.tsx` are byte-identical to their
  `wiki/` counterparts. These 537 lines are duplicated today with **no drift
  guard**; `checkKernelDrift` does not cover them because they are not kernel
  files. ≈5 lines.

### 5.3 Fix

- `scripts/validate-template-library.mjs:177` `isSourceFile()` — add `tsx|jsx`.
  Without this, hard-coded hex colors in React components **silently escape** the
  token-discipline scan.
- `scripts/validate-template-library.mjs:103-112` `checkKernelDrift()` — update
  the eight-entry `kernelFiles` list to the new filenames, and add the two new
  kernel CSS files.
- `scripts/sync-kernel.sh` — update the `cp` filenames. Edit `shared/kernel/`
  first, then re-sync; editing a template copy directly trips `checkKernelDrift`
  by design.

## 6. Per-Component Migration Map

`$state`→`useState`, `$derived`→derived const or `useMemo`, `$derived.by`→`useMemo`,
`$props`→props, `$effect`→`useEffect`, `onMount`→`useEffect(…, [])`,
`bind:this`→`useRef`, `{@html}`→`dangerouslySetInnerHTML`, `class:x={c}`→`className`.

| Component | LoC | Risk | Migration notes |
|---|---|---|---|
| `explainer/SectionNav` | 476 | **medium** | Mutates `heading.id` on Astro-rendered static DOM **outside** the island. React does not own that DOM, so a `useEffect` mutation is safe — this is not the React anti-pattern it resembles. Keep the manual rAF-throttled `getBoundingClientRect` scroll-spy and the 700 ms scroll lock; do **not** "modernize" to IntersectionObserver (the comment at `:131-136` explains why it was rejected). The rune subscription footgun at `:167-182` disappears. |
| `{explainer,wiki}/Mermaid` | 362 ×2 | **medium** | Client-only. Reads CSS custom properties via `getComputedStyle(documentElement)` into `themeVariables`; a `data-theme` MutationObserver re-renders the whole SVG (mermaid bakes theme into output). `{@html}`→`dangerouslySetInnerHTML`, then SVG click handlers bound in a follow-up effect. **Verify during implementation that Astro's React island does not wrap in `StrictMode`**; if it does, the double-invoke must not double-bind handlers or strand SVGs. 167 lines of CSS including `:global()` selectors onto mermaid-injected SVG. |
| `wiki/FlowGraph` | 261 | **medium** | `@xyflow/svelte`→`@xyflow/react`. Two **silent** API drifts: `onnodeclick={({ node }) => …}` → `onNodeClick={(event, node) => …}` (positional), and node/edge `class:` → `className`. Loose typing will not catch either. `:global(.svelte-flow__*)` → `.react-flow__*`. Wrap in `ReactFlowProvider`. The `handleConnectionChange` tree-shake warning noted in `CLAUDE.md` will not recur. |
| `scrollytelling/StickyStage` | 329 | low | IntersectionObserver in `useEffect` + `useState` index. All animation is CSS `@keyframes`. No `svelte/motion`, no `transition:`. |
| `cards/HoloCard` | 278 | low | Pointer handler writes seven CSS custom properties onto `e.currentTarget.style`. **Zero component state — do not lift it into `useState`.** All holographic effect is CSS. Rename root class per §4.3. |
| `explainer/Lifecycle` | 250 | low | mechanical |
| `explainer/Hero` | 228 | low | static island, no `client:*` — ships zero JS |
| `{explainer,wiki}/CodeBlock` | 175 ×2 | low | mechanical; `.copy-btn` bare name must survive |
| `explainer/Tabs` | 120 | low | mechanical; `.tabs-wrap` bare name must survive |
| `wiki/OnThisPage` | 93 | low | mechanical |
| `kernel/ThemeToggle` | 91 | low | §3.2 |
| `wiki/Sidebar` | 85 | low | mechanical |
| `kernel/LangToggle` | 73 | low | §3.1 |
| `cards/HoloCardGrid` | 34 | low | mechanical |

Hydration directives are unchanged (`client:load` for toggles/`SectionNav`/`Sidebar`,
`client:idle` for `OnThisPage`, `client:visible` for `StickyStage`/`HoloCardGrid`/
`FlowGraph`/`Lifecycle`/`Mermaid`/`Tabs`). They are Astro-level and framework-agnostic.

## 7. Dependencies

| From | To | Confidence |
|---|---|---|
| `@astrojs/svelte` | `@astrojs/react` | direct |
| `svelte` | `react` + `react-dom` | direct |
| `@xyflow/svelte` (wiki) | `@xyflow/react` | near-parity, two API drifts (§6) |
| `mermaid`, `@fontsource-variable/*`, `astro`, `@astrojs/mdx`, `@astrojs/check` | unchanged | — |

Also: `mermaid` is declared in `scrollytelling/package.json` and
`cards/package.json` but appears unused in their `src/`. **Verify and drop** if
confirmed dead; do not drop on the strength of a grep alone.

All four `bun.lock` files are regenerated. `typecheck` becomes
`astro check && tsc --noEmit` — `astro check` does not cover `.tsx`.

## 8. Verification

```shell
bun test skills/interactive-showcase-site/scripts/lib/template-library-contracts.test.mjs
sh skills/interactive-showcase-site/scripts/sync-kernel.sh
git diff --exit-code -- skills/interactive-showcase-site/shared/kernel skills/interactive-showcase-site/templates
bun skills/interactive-showcase-site/scripts/validate-template-library.mjs
for t in explainer scrollytelling cards wiki; do
  (cd "skills/interactive-showcase-site/templates/$t" && \
    bun install --frozen-lockfile && bun run typecheck && bun run build)
done
claude plugin validate .
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
```

`bun ../../scripts/check-svelte-css.mjs .` is removed from this list.

**A green build does not prove this migration correct.** Two additional gates,
because every risk in §4.3 and §6 fails silently:

1. **Visual diff.** `bun run build && bun run preview`, then compare against the
   pre-migration build across all routes × {light, dark} × {en, zh}. Specifically
   assert: `HoloCard`'s 3D tilt survives (`.card` collision), the browser print
   preview still hides nav/toggles/copy buttons (bare-class contract),
   `Mermaid` re-themes on toggle, `FlowGraph` node clicks still select.
2. **Bundle measurement.** Re-measure `dist/**/*.js` gzip for all four
   templates and record the real numbers. The ≈50 KB figure in §1.1 is an
   estimate and must be replaced with a measurement in `CLAUDE.md`.

`CLAUDE.md`'s "expected non-blocking output" baseline is now wrong: the
`@xyflow/svelte` `handleConnectionChange` warning disappears and chunk sizes
change. Update it, or a real regression will hide behind a stale baseline.

## 9. Documentation Sync

| File | Change |
|---|---|
| `SKILL.md` | frontmatter `description` ("Astro + Svelte"); shared-contract rule #8 (CSS-orphan discipline) → delete; two `check-svelte-css.mjs` invocations; two Resources links ("Svelte runes", "Svelte Flow") |
| `references/explainer.md` | five island imports; **line 22 `*Diagram.svelte` → `*Diagram.tsx`** — the one place an agent authors framework code; rewrite its runes/scoped-CSS guidance as React + plain-CSS guidance |
| `references/scrollytelling.md` | island names, side-effect mandate, check step |
| `references/cards.md` | island names, side-effect mandate, check step |
| `references/wiki.md` | island names; `@xyflow/svelte` → `@xyflow/react` (line 13) + note the two API drifts |
| `CLAUDE.md` | "Astro + Svelte scaffolds"; delete the Known Gotcha section; rewrite Verification; update the expected-output baseline |
| `README.md`, `README.zh.md` | three "Astro + Svelte" mentions each |
| `.claude-plugin/plugin.json`, `marketplace.json` | `description` + the `"svelte"` keyword — user-visible in the marketplace catalog |
| `docs/preview/preview-{en,zh}.png` | restage after migration; they render the old Svelte build |

## 10. Non-goals (YAGNI)

- **Do not** promote the byte-identical `CodeBlock`/`Mermaid` into the kernel.
  `sync-kernel.sh` copies unconditionally to all four templates, which would push
  Mermaid and its dependency into `cards` and `scrollytelling`, where they are
  unused. A 5-line drift check (§5.2) buys the same protection at a fraction of
  the complexity.
- **Do not** introduce CSS Modules, Tailwind, or vanilla-extract.
- **Do not** offer a scaffold-time framework choice. It doubles the template
  count, the kernel-sync matrix, and the contract surface, for a skill whose
  agent scaffolds exactly one framework per project.
- **Do not** swap React for Preact to recover the 33 KB. It breaks `@xyflow/react`.
- **Do not** leave Astro.
- **Do not** refactor the router, archetype contracts, tokens, or content model.

## 11. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| `.card` collision silently flattens the holographic tilt | high | rename to `.holo-card`; visual gate §8.1 |
| Print stylesheet dies if a bare class name is lost | high | plain CSS keeps bare names (§4.2); visual gate asserts print preview |
| `FlowGraph`'s `onNodeClick` signature drift compiles but never fires | medium | explicit gate: click a node in preview and confirm selection |
| `Mermaid` double-binds handlers under `StrictMode` | medium | verify Astro's React island does not wrap `StrictMode`; make effects idempotent regardless |
| Half-migrated template passes contracts but fails `astro build` | medium | `astro.config.mjs` renderer swap is unguarded by any validator; the CI dry-run build is the only net — keep it green |
| Hidden hex colors slip into `.tsx` | medium | fix `isSourceFile` (§5.3) **before** porting components |
| Bundle regression larger than estimated | low | measure at acceptance (§8.2); the number, not the estimate, goes in `CLAUDE.md` |

## 12. Acceptance Criteria

1. `grep -ri svelte skills/` returns nothing.
2. All eight verification commands in §8 pass.
3. All four templates build and preview; visual diff (§8.1) shows no regression
   in: holographic tilt, print output, Mermaid theming, FlowGraph selection,
   language toggle, theme toggle, scroll-spy.
4. `checkStylesAggregated`, `checkDuplicatedComponents`, and the `tsx`-aware
   `isSourceFile` are covered by unit tests in `template-library-contracts.test.mjs`.
5. Real gzip JS sizes for all four templates are measured and recorded in
   `CLAUDE.md`, replacing the §1.1 estimate.
6. `check-svelte-css.mjs` and the side-effect-import contract exist nowhere —
   not in scripts, not in CI, not in `SKILL.md`, not in `references/*.md`.

## 13. Recommended Build Phasing (for the implementation plan)

1. **Tooling first, still on Svelte.** Fix `isSourceFile` to include `tsx`. Add
   `stylesAggregated` + `checkDuplicatedComponents` with tests. This makes the
   validator honest *before* any React lands, so it can guard the port.
2. **CSS extraction, still on Svelte.** Move all 24 `<style>` blocks into
   `src/styles/components/*.css`, introduce `site.css`, repoint `BaseLayout`,
   fix the three collisions (§4.3), repair the dead `.lifecycle-controls` print
   rule, prefix `@keyframes`. Delete `check-svelte-css.mjs` and the
   side-effect-import contract. **Build and visually verify here** — this
   isolates every CSS risk from every React risk. If the tilt, the print output,
   or the tabs styling breaks, it broke *here*, with Svelte still in place and a
   one-commit revert available.
3. **Kernel to React.** `lang.ts`, `ThemeToggle.tsx`, `LangToggle.tsx`,
   `astro.config.mjs`, `package.json`, `tsconfig.json`, `sync-kernel.sh`.
   Verify one template end to end.
4. **Templates to React**, cheapest first:

   | Phase | Template | LoC | Components |
   |---|---|---|---|
   | 4a | `cards` | 312 | HoloCard 278, HoloCardGrid 34 |
   | 4b | `scrollytelling` | 329 | StickyStage 329 |
   | 4c | `wiki` | 976 | FlowGraph 261, OnThisPage 93, Sidebar 85, **CodeBlock 175, Mermaid 362** |
   | 4d | `explainer` | 1074 | SectionNav 476, Lifecycle 250, Hero 228, Tabs 120 |

   `CodeBlock` and `Mermaid` are ported once, in 4c, then copied verbatim into
   `explainer` in 4d. `checkDuplicatedComponents` (§5.2) enforces they stay
   identical. Totals: 312 + 329 + 976 + 1074 + 164 (kernel toggles) = 2855.

5. **Docs, CI, manifests, screenshots, bundle measurement.**

Phases 1 and 2 are independently valuable and independently revertable: if the
migration is abandoned after phase 2, the repo is strictly better than it
started — the orphaned-CSS gotcha is gone and three latent bugs are fixed.
