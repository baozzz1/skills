---
name: interactive-showcase-site
description: Scaffold an Astro + Svelte single-page interactive explainer site from a project README, SDK, or docs folder. Bilingual EN/ZH with light/dark theme. Use when the user wants an interactive docs site.
---

# Interactive Showcase Site

A focused, opinionated playbook for scaffolding **buildable, deployable
single-page documentation sites** that turn a project's README / docs / SDK
reference into an editorial, interactive explainer — with click-to-explore
Mermaid diagrams, autoplaying numbered lifecycles, fixed right-side scroll-spy
TOC, light/dark theme toggle, EN/ZH language toggle, and a one-screen project
summary. Every page ships **bilingual by default** (English + Simplified
Chinese), switched live from the top bar without a reload.

This is the **npm-project counterpart** to `interactive-html-artifact` (which
shipped single-file `.html` artifacts and is now superseded by this skill).
The visual language is lifted from `engineering-artifact-design` (warm
editorial palette, paper-warm neutrals, serif headings) and aligned with
Anthropic Claude's design directives — no AI-slop tropes, no system fonts,
OKLCH-derived colors, clay/coral accent only for emphasis.

## When To Use

Use this skill when the user asks for any of:

- "把这份 SDK / 项目文档变成可交互网页"
- "deep dive 风格的文档站" / "类似 deep-dive-claude-code.vercel.app"
- "做一个 ccunpacked.dev 那种产品讲解站"
- "用 npm 项目做交互式 README"
- "Astro / Svelte 写的文档 explainer，要部署到 Vercel"
- "把这个 markdown 文件夹变成一页讲清楚的网站"

Do **not** use this skill for:

- Multi-chapter documentation portals → use a doc-site framework
  (VitePress / Starlight / Nuxt Content) directly.
- Single-file HTML artifacts to attach to a PR / paste in chat → use
  `engineering-artifact-design` for the visual system and write inline HTML.
- Marketing landing pages, app landing pages, blog sites.
- Anything that needs a backend, auth, or runtime data fetching.

## Hard Rules

1. **Single page, hash routes.** One `/` route. URL state lives in the hash
   (`/#agent-loop`). No multi-page chapters; if the content needs >8 sections,
   ask the user to compress, not to add chapters.
2. **Token is the contract.** All colors / borders / radii / shadows / fonts
   come from `src/styles/tokens.css`. Components must reference `var(--…)` only.
   No hex literals outside `tokens.css`.
3. **Template is the contract too.** The agent does **not** invent project
   structure or pick alternate frameworks. The agent uses the `template/` from
   this skill. Component files in `template/src/components/` are **frozen** —
   the agent only edits `src/content/sections/*.mdx`, `src/lib/sections.ts` (if
   present), and per-section diagram islands like `src/components/*Diagram.svelte`.
4. **MDX content imports only the sanctioned components** (see "Authoring API"
   below). No inline `<script>`. No new global components without explicitly
   widening the template (which is a skill-level change, not a per-project change).
5. **First screen explains the project.** At 1920×1080, the sticky top controls
   + fixed right-side TOC + page hero + 3–5 first-screen map entries + the
   start of the first section must fit without scrolling. The map entries
   should cover what the project is, its core modules / workflow, and why the
   reader should continue. They render as a full-width editorial list under
   the title (hairline-separated rows, no panel, no cards) — never as a
   side-by-side card grid next to the title. Pages must still degrade
   gracefully at smaller viewports (1280×800 / mobile), but 1920×1080 is the
   spec target.
6. **Reduced motion + dark mode + print are not optional.** All animations
   must wrap in `@media (prefers-reduced-motion: no-preference)`; theme-flip
   re-renders Mermaid; print hides nav / theme toggle / copy buttons.
7. **No AI-slop tropes** (per Anthropic Claude design directives):
   - No aggressive gradients
   - No emoji decoration
   - No "rounded card with left-border accent stripe" callouts (the Callout
     component intentionally does not use that pattern)
   - No SVG-drawn imagery; placeholders only
   - No Inter / Roboto / Arial / Fraunces / system fonts (we self-host
     Source Serif 4 / IBM Plex Sans / JetBrains Mono via @fontsource-variable)
   - Color derivation uses OKLCH (`color-mix(in oklch, …)`)
8. **Bilingual is non-optional.** Every section MUST exist in both
   `src/content/sections/en/` and `src/content/sections/zh/` with matching
   `id` and `order`. The LangToggle button is part of the frozen template;
   agents do not remove it or hide either language. UI strings (copy buttons,
   theme labels, lifecycle controls, mermaid placeholders) come from
   `src/i18n/strings.ts`; both `en` and `zh` keys must be filled when adding
   a new string. A missing language for a given section `id` is a build error
   (Zod refinement catches it).
9. **Verification gate.** Before declaring done, `pnpm typecheck` and
   `pnpm build` must both exit with code 0. Failing either = not done.

## Architecture

```
skills/
└── interactive-showcase-site/
    ├── SKILL.md                   ← this file
    └── template/                  ← frozen scaffold; agent COPIES, does not edit
        ├── package.json           ← deps locked via pnpm-lock.yaml
        ├── pnpm-lock.yaml
        ├── astro.config.mjs       ← Shiki dual themes (min-light / min-dark)
        ├── tsconfig.json
        ├── .gitignore
        └── src/
            ├── pages/index.astro  ← single page, renders BOTH languages; CSS
            │                        hides the inactive one via [data-lang-only]
            ├── layouts/BaseLayout.astro  ← pre-paint theme + lang bootstrap
            ├── styles/
            │   ├── tokens.css     ← THE design contract
            │   └── global.css
            ├── i18n/
            │   ├── strings.ts          ← UI string dict (en + zh)
            │   └── lang.svelte.ts      ← reactive lang store + setLang()
            ├── components/
            │   ├── Hero.svelte         ← page-level hero + first-screen map list
            │   ├── SectionNav.svelte   ← top controls + right TOC scroll-spy
            │   ├── ThemeToggle.svelte  ← system / light / dark cycle
            │   ├── LangToggle.svelte   ← EN / 中 cycle (mirrors ThemeToggle)
            │   ├── Lifecycle.svelte    ← Pattern A: numbered steps + autoplay
            │   ├── Mermaid.svelte      ← Pattern B: click-to-detail diagram
            │   ├── Tabs.svelte         ← Pattern C: variant switcher
            │   ├── CodeBlock.svelte    ← syntax-highlighted block + copy button
            │   ├── Callout.astro       ← TL;DR / info / warning / danger / success
            │   └── Chip.astro          ← status pill
            ├── content.config.ts  ← Zod schema for section frontmatter (lang ∈ en | zh)
            ├── content/sections/
            │   ├── en/
            │   │   ├── 01-overview.mdx
            │   │   ├── 02-agent-loop.mdx
            │   │   └── 03-pitfalls.mdx
            │   └── zh/
            │       ├── 01-overview.mdx
            │       ├── 02-agent-loop.mdx
            │       └── 03-pitfalls.mdx
            └── env.d.ts
```

Output flow:

```
docs/, README.md, repo URL, or user description
         │
         ▼
agent reads → extracts first-screen facts → drafts section outline → user confirms outline
         │
         ▼
cp -R "${CLAUDE_SKILL_DIR}/template/" <output-path>
         │
         ▼
agent writes only:
  src/content/sections/en/*.mdx  (one EN file per section, lang: en)
  src/content/sections/zh/*.mdx  (matching ZH file, lang: zh, same id + order)
  src/components/*Diagram.svelte (only if a section needs custom viz)
         │
         ▼
pnpm install && pnpm typecheck && pnpm build
         │
         ▼
pnpm dev (background) → user opens http://127.0.0.1:4321/
```

## Workflow

When triggered:

1. **Receive input.** Accept (in order of preference):
   - A path to a local docs folder (`./my-sdk/` containing README + docs/)
   - A path to a single markdown file
   - A GitHub URL (`gh repo view` or clone to tmp, then treat as docs folder)
   - A natural-language description (last resort; usually requires follow-up)
   If the input doesn't have enough material to support 4–8 sections, **ask
   for more rather than padding**.

2. **Determine output path.** Default rule:
   - Input `./<name>/` → output `./<name>-explainer/` (sibling to input)
   - Input `./README.md` → output `./<parent-name>-explainer/`
   - Input `gh:org/repo` → output `./<repo>-explainer/` in cwd
   - Input is description only → **ask the user where to put it**, do not default
   If target directory exists, is non-empty, and does not look like a previous
   output of this skill (no `package.json` with name `interactive-showcase-site`),
   **stop and ask the user** — never overwrite silently.

3. **Extract first-screen facts.** Before writing sections, identify 3–5 facts
   that let a reader understand the project in one viewport. Use this shape:

   | label | title | body | tone |
   |---|---|---|---|
   | 01 · purpose | 一句话定位 | 这个 SDK 解决什么问题 | clay |
   | 02 · workflow | 核心流程 | 请求如何经过 3–6 个关键阶段 | info |
   | 03 · modules | 关键模块 | 哪些包 / 服务 / 文件夹最重要 | olive |
   | 04 · guardrails | 使用约束 | 最容易误用或必须遵守的规则 | rust |

   Return this table before the section outline so the user can verify the
   first-screen story. Each fact should be short enough to fit as a one-line
   entry in the first-screen map (a single `body` line under a 3–5 word
   `title`); do not use them as another long introduction.

4. **Draft a section outline (≤8 entries) and get user approval.** Use this
   shape and return it as a markdown table for the user to review:

   | order | id | title | heroKind | one-line scope |
   |---|---|---|---|---|
   | 1 | overview | 概览 | plain | 这个 SDK 解决什么问题 |
   | 2 | lifecycle | 调用循环 | lifecycle | 6 步生命周期 + 关键 API |
   | 3 | architecture | 架构 | mermaid | 模块依赖图 + 数据流 |
   | … | | | | |

   Do not scaffold before the user approves the outline. Outline mistakes are
   the most expensive thing to fix later.

5. **Scaffold.** Run, in order:
   ```
   # Claude Code sets CLAUDE_SKILL_DIR for plugin/skill resources.
   # If unavailable, resolve the directory containing this SKILL.md and use its template/.
   cp -R "${CLAUDE_SKILL_DIR}/template/" <output-path>
   cd <output-path>
   pnpm install                           # pnpm lockfile pre-pinned
   ```
   If the environment lacks `pnpm`, fall back to `npm install` (skill is
   compatible; the lockfile is just informational under npm).

6. **Generate bilingual content.** For each section in the approved outline,
   write **two** files: `src/content/sections/en/NN-<id>.mdx` and
   `src/content/sections/zh/NN-<id>.mdx`. They MUST share `id` and `order`
   and differ only in `lang`, `title`, `eyebrow`, and the body prose. The
   numeric prefix encodes order stability across diff (`mv 02-foo.mdx
   04-foo.mdx` is a valid reorder, applied to both files in lockstep).
   See **Authoring API** for what's allowed inside.

7. **Delete all example sections.** Once real sections exist, remove every
   file under `src/content/sections/{en,zh}/` that came from the template
   (the three `01/02/03` examples in each language). Keep only the user's
   content. Both language directories must end up with identical section sets.

8. **Update the page hero (both languages).** Edit `src/pages/index.astro`
   to reflect the project name in `siteTitleZh` / `siteTitleEn`, and fill
   both `heroPropsZh` and `heroPropsEn` (each with its own `title` / `lead` /
   `chips` / `summaryItems`). These are inline literals, intentionally not
   extracted to config — keep them in one place. Also set `faviconLetter`
   in the same file to the single English letter that best represents the
   project (e.g. `'A'` for an Anthropic SDK, `'T'` for a tool named "Tars");
   the layout renders it as a clay-accent inline SVG favicon. If the project
   ships a real bitmap or vector mark, drop the file into `public/` and
   pass `favicon={\`\${import.meta.env.BASE_URL}favicon.svg\`}` to
   `<BaseLayout>` instead.

9. **Verify.** Run `pnpm typecheck` and `pnpm build`. Both must exit 0. If
   typecheck warns about deprecated Zod hints (Astro 6 migration noise), that's
   acceptable; only errors block.

10. **Hand off.** Start `pnpm dev` in the background. Print to the user:
   - Preview URL: `http://127.0.0.1:4321/`
   - Generated section list (id + heroKind)
   - Build warnings (if any)
   - The verification checklist (below)
   Do **not** `git add` / `git commit`. Leave the working tree dirty for review.

## Re-runs (incremental updates)

If the user asks to add / edit / reorder a section after the first delivery:

- **You may edit:** `src/content/sections/en/*.mdx`,
  `src/content/sections/zh/*.mdx` (always paired — never edit only one
  language), `src/components/*Diagram.svelte` (per-section custom viz
  islands), the page hero literals (`heroPropsEn`, `heroPropsZh`,
  `siteTitleEn`, `siteTitleZh`, `faviconLetter`) in `src/pages/index.astro`,
  `public/favicon.svg` (if the project ships a real mark — otherwise the
  layout auto-renders a letter SVG and `public/` stays empty),
  `src/i18n/strings.ts` (only when adding a new UI string — fill BOTH `en`
  and `zh` keys; never delete an existing key).
- **Treat as immutable** (template assets — only modify on explicit "upgrade
  the scaffold" instruction): `src/components/{Hero,Lifecycle,Mermaid,Tabs,
  ThemeToggle,LangToggle,CodeBlock,SectionNav,Callout,Chip}.{svelte,astro}`,
  `src/i18n/lang.svelte.ts`, `src/styles/{tokens,global}.css`,
  `astro.config.mjs`, `tsconfig.json`, `package.json`, `pnpm-lock.yaml`,
  `src/layouts/BaseLayout.astro`, `src/content.config.ts`.
- After edits, re-run typecheck + build. Same gates apply.

## Authoring API (what an MDX section can use)

Every section file lives in `src/content/sections/<lang>/` with this
frontmatter (one EN file under `en/`, one matching ZH file under `zh/`):

```yaml
---
id: agent-loop                # unique within a language; MUST match across langs
title: "Agent Loop"            # appears in section header + nav (lang-specific)
order: 2                       # ordering key; floats allowed; MUST match across langs
heroKind: lifecycle            # plain | lifecycle | mermaid | tabs | side-by-side
eyebrow: "AGENT LIFECYCLE"     # optional small caps line above title
estimatedRead: 4               # optional, minutes
lang: en                       # 'en' | 'zh' — must match the parent directory
---
```

Available imports inside the MDX body — no others:

```mdx
import Lifecycle from '@/components/Lifecycle.svelte';
import Mermaid   from '@/components/Mermaid.svelte';
import Tabs      from '@/components/Tabs.svelte';
import CodeBlock from '@/components/CodeBlock.svelte';
import Callout   from '@/components/Callout.astro';
import Chip      from '@/components/Chip.astro';
```

**Only import what the section actually uses.** Unused Svelte imports are not
free: Astro 6 + Svelte 5 currently emit their scoped CSS into a separate
chunk that the page never `<link>`s, so the components used in the same MDX
end up unstyled in production. The page entry (`src/pages/index.astro`)
side-effect-imports every interactive component once so the styles always
land in the main CSS bundle — keep that block in sync if you add a new
Svelte component to the authoring API.

Hydration directives — use these and only these:

| Component | Directive | Reason |
|---|---|---|
| `Lifecycle` | `client:visible` | autoplay shouldn't start before in-view |
| `Mermaid`   | `client:visible` | mermaid bundle is large; load on demand |
| `Tabs`      | `client:visible` | tab state only matters when visible |
| `CodeBlock` | `client:idle`    | copy button can wait until idle |
| `Callout`   | (none — Astro)   | zero JS |
| `Chip`      | (none — Astro)   | zero JS |

Heading / table rules:
- Body `##` and `###` headings are automatically scanned into the fixed
  right-side TOC (and the compact mobile disclosure). Keep them short enough to
  work as navigation labels.
- Markdown tables are allowed for compact reference data. Prefer concise
  headers and short cell text; wide tables intentionally scroll horizontally
  inside the table surface, not at the page level.

### Pattern A — Numbered Interactive Lifecycle

Use for 3–8 step API call sequences, agent loops, request flows, state
machines. Hard cap at 8.

```mdx
<Lifecycle
  client:visible
  autoplay
  interval={2800}
  steps={[
    {
      num: 1,
      title: "读上下文",
      api: "buildContext(messages, tools, system)",
      desc: "把历史消息、可用工具、系统指令拼成 prompt。这一步是确定性的。",
      code: "const ctx = buildContext({\n  messages, tools, system\n});"
    },
    /* … 2..N */
  ]}
/>
```

Each step needs:
- `num` (display number; usually matches array index + 1)
- `title` (short, ≤8 Chinese chars / 4 English words)
- `api` (one-line API signature, optional but strongly recommended)
- `desc` (one paragraph, ≤2 sentences)
- `code` (≤8 lines, copyable, optional)

Autoplay rules:
- `interval` 2500–3000ms
- User click pauses autoplay; resuming requires manual "Resume" click
- `prefers-reduced-motion: reduce` auto-pauses on mount

### Pattern B — Click-to-Detail Mermaid

Use when the diagram is a recognizable structure (tree, DAG, sequence,
flowchart) and each node maps to a documentable concept.

```mdx
<Mermaid
  client:visible
  spec={`flowchart LR
    cfg["tars_config"]
    eng(["engine"])
    cfg --> eng
    classDef hot stroke-width:2.5px;
    class eng hot;`}
  nodes={{
    cfg: { title: "tars_config", body: "运行时配置入口。" },
    eng: { title: "engine",      body: "实际执行的运行时实例。" }
  }}
/>
```

Rules and gotchas:
- **Do not use `var(--…)` inside `classDef` style values.** Mermaid 11's
  parser fails on it. Use only style declarations with literal numbers /
  keywords (e.g. `stroke-width:2.5px`, `stroke-dasharray:4 2`). For
  theme-aware coloring, the component CSS handles `g.node.hot` styling
  using `--mm-hot-*` tokens — just assign the `hot` class to the node via
  `class <id> hot;`.
- The `nodes` dict keys must match the node IDs in `spec`. Click-to-detail
  is wired automatically; you do **not** write `click <id> call <fn>(<args>)`
  directives.
- Node count cap: 12. If you need more, split into two diagrams in two
  sections.
- For `<br/>` inside node labels, write `<br/>` (not `<br>`) — the lint
  warning from html.parser is benign.

### Pattern C — Tabs With Synced Panels

Use for variants of the same thing (3 implementation styles, 4 platforms,
before/after).

```mdx
<Tabs
  client:visible
  group="impl"
  tabs={[
    {
      label: "递归调用",
      html: `<pre><code>async function loop(messages) { ... }</code></pre>
             <p>读起来最像数学。</p>`
    },
    {
      label: "while 循环",
      html: `<pre><code>while (true) { ... }</code></pre>
             <p>最常见。容易加 max-turns 守卫。</p>`
    }
  ]}
/>
```

Rules:
- Each tab body is a **raw HTML string**. Keep it short — if a panel needs
  more than ~20 lines, the content probably belongs in its own section.
- `group` must be unique per Tabs instance on the same page (it ids the
  ARIA group). Reusing a group across instances breaks accessibility.

### Pattern D — Callout / Chip (zero-JS)

```mdx
<Callout kind="tldr">
  Agent ≠ "聊天机器人套了 tool-use"。它是多轮收敛循环。
</Callout>

<Callout kind="warning">
  生产环境优先选状态机。
</Callout>

<Chip tone="clay">需要重点关注</Chip>
<Chip tone="olive">已验证</Chip>
```

`kind` ∈ `{ tldr, info, warning, danger, success }`.
`tone` ∈ `{ clay, olive, rust, info, muted }`.

### Pattern E — CodeBlock

Author-facing code blocks. For most cases, prefer Markdown ` ```ts ... ``` `
fences (Astro auto-applies Shiki). Use `<CodeBlock>` when you also need a
working copy button:

```mdx
<CodeBlock
  client:idle
  lang="ts"
  title="src/api/client.ts"
  code={`export const client = createClient({
  baseURL: process.env.API_URL,
  timeout: 30_000
});`}
/>
```

## Token Set That Survives Dark Mode

`src/styles/tokens.css` defines:

- **Brand**: `--ivory` `--paper` `--slate` `--clay` `--clay-d` `--oat`
  `--olive` `--rust` `--info`
- **Grays**: `--gray-100` `--gray-300` `--gray-500` `--gray-700` (warm; never
  blue-cast)
- **Code**: `--code-bg` `--code-bg-soft` `--code-border` `--code-fg`
  `--code-fg-dim`, plus syntax-color tokens (`--code-keyword` etc.)
- **Mermaid**: `--mm-node-fill` `--mm-node-stroke` `--mm-node-text` `--mm-edge`
  `--mm-hot-fill` `--mm-hot-stroke` `--mm-hot-text`
- **Type**: `--serif` (Source Serif 4) `--sans` (IBM Plex Sans) `--mono`
  (JetBrains Mono); CJK fallback chains included
- **Geometry**: `--border-w` `--border` `--radius-row` `--radius-panel`
  `--shadow-lift`
- **Layout**: `--content-max` `--section-pad-y` `--hero-pad-y` `--nav-h`

Theme switching:
1. Default: `prefers-color-scheme` (`@media (prefers-color-scheme: dark)
   :root:not([data-theme='light']) { … }`)
2. Override: `<html data-theme="light">` or `<html data-theme="dark">`
3. Persistence: `localStorage.theme`, written by `ThemeToggle`, read by an
   inline script in `BaseLayout.astro` **before** first paint (no FOUC)

Verify by toggling the system theme: in both modes the code surface is
**one step deeper** than the page surface (`--paper`), never inverted.
In light mode the code slab is a warm paper-tan (`#F2EFE6`); in dark mode
it darkens to `#0E0D0B`. Token colors (`--code-keyword` / `--code-string`
/ etc.) are theme-aware and flip with `[data-theme]`. Shiki spans paint
their tokens with `background-color: transparent` so the wrapper surface
controls the slab uniformly — do not undo that override.

## Verification Checklist

Run `pnpm typecheck && pnpm build` first — both must exit 0. Then walk
through this list in the dev preview (~3 minutes):

- [ ] At 1920×1080, the sticky top controls, fixed right-side TOC, page hero,
      3–5 first-screen map rows (full-width hairline list — never a side-by-
      side card grid next to the title), and the start of the first section
      fit without scrolling — verify in **both EN and ZH**. (Spec target;
      smaller viewports just need to degrade gracefully.)
- [ ] Toggle the theme button through system / light / dark; code blocks
      visibly **darken** in dark mode (and lighten to paper-tan in light
      mode); Shiki tokens never paint white "stickers" on top of the slab;
      the choice persists across reload.
- [ ] The favicon shows the configured letter on a clay tile (or the real
      asset you dropped into `public/`); `faviconLetter` matches the topic.
- [ ] Toggle the LangToggle button (EN ⇄ 中); every visible section, nav
      title, hero copy, callout label, copy-button label, lifecycle play /
      pause label, and mermaid placeholder swap to the new language; the
      choice persists across reload; theme + lang are independent (changing
      one never resets the other).
- [ ] EN and ZH section sets have identical `id` and `order` (no language
      has a section the other lacks).
- [ ] Click each Mermaid node → the detail panel below the diagram updates
      with concept-specific copy.
- [ ] Theme flip re-renders Mermaid (the SVG is regenerated with new theme
      colors, not stuck in the previous theme).
- [ ] Lifecycle: clicking a step pauses autoplay; clicking the "▶ 自动播放"
      button resumes; reduced-motion auto-pauses on first load.
- [ ] Every code block has a working copy button; success state ("已复制")
      flashes for ~1.4s then resets.
- [ ] Tab switching preserves scroll position and changes only the active
      panel.
- [ ] Markdown tables have visible headers, borders, row separation, and
      readable contrast in light and dark mode.
- [ ] At 360px wide, no horizontal page scroll; only intentional code blocks,
      tables, and mermaid diagrams scroll horizontally.
- [ ] The right-side TOC updates the active section / subsection as you scroll.
- [ ] Mobile (≤1119px): nav collapses to a "current section ▾" disclosure.
- [ ] FAQ-style `<details>` open/close with keyboard.
- [ ] Print preview hides controls, keeps narrative; backgrounds become white.
- [ ] No `<input type="checkbox">` in checklist content unless the user
      asked for an interactive checklist (default is `✓` glyph).

## Common Pitfalls

| ❌ Don't | ✓ Do |
|---|---|
| Use `var(--…)` inside Mermaid `classDef` style values | Use literal styles in classDef; theme-aware coloring lives in component CSS targeting `.node.hot` |
| Write `<ComponentName …>` inside Svelte HTML comments at the top of a `.svelte` file | Put doc as a TS block comment inside `<script>` (Svelte 5's parser leaks `<!-- ... <Foo> ... -->` content into SSR output) |
| Use `client:load` everywhere | `client:visible` for hero islands; `client:idle` for copy buttons; nothing for static `.astro` components |
| Pass JSX children to Svelte islands (`<Tabs><Tab>...</Tab></Tabs>`) | Use props arrays (`<Tabs tabs={[{label, html}]} />`); children-as-island is unstable across the Astro/Svelte hydration edge |
| Inline-import mermaid dynamically (`await import('mermaid')`) inside the component | Static `import mermaid from 'mermaid'` at the top of the script; with `client:visible` the mermaid bundle still loads on demand, just bundled cleanly |
| Author chapters as separate pages | Single page; if you have >8 sections, compress |
| Apply `max-width` to global heading rules (e.g. `h1 { max-width: 22ch }`) | Heading width is a per-component decision; **only `<p>` gets a global `max-width: 70ch` cap**. Setting it globally on `h1` will ambush long CJK hero titles by forcing breaks inside words like "文档" |
| Rely on `text-wrap: balance` for CJK hero titles | `balance` will split a one-line title into two for "balance" reasons. Use `word-break: keep-all` so the browser only breaks at explicit `/`, space, or punctuation — and verify the title fits at the spec viewport (1920×1080) |
| Add Tailwind / utility classes alongside the token CSS | Tokens are the contract; mixing utilities erodes discipline |
| Use Inter / Roboto / Arial / Fraunces / system fonts | Self-host Source Serif 4 / IBM Plex Sans / JetBrains Mono via `@fontsource-variable` |
| Use `<input type=checkbox>` for static checklists | Static `✓` glyph; reserve checkbox only when the user asks for interactive ones |
| Animate every step transition, ignoring reduced-motion | Wrap autoplay + transforms in `prefers-reduced-motion: no-preference` |
| `git commit` after delivering the scaffold | Leave the working tree dirty; user reviews and commits |
| Overwrite a non-empty target directory silently | Stop and ask the user if the target looks foreign |
| Rebuild template/ scaffolding inside a user project | Template is frozen; only edit `content/`, `*Diagram.svelte`, and the page hero literals |

## Resources

This skill is the **interactive npm-project counterpart** to:

- `engineering-artifact-design` — the warm editorial palette, typography
  stack, panel/card/chip components, CJK rules, and overall layout. Tokens
  in our `tokens.css` are 1:1 with the values defined there.
- `interactive-html-artifact` — single-file HTML version (deprecated; this
  skill replaces it for buildable-project use cases).

External references worth opening once when in doubt:

- https://docs.astro.build/en/guides/content-collections/ — Content Layer API
  (`loader: glob(...)`)
- https://svelte.dev/docs/svelte/$state — Svelte 5 runes
- https://mermaid.js.org/syntax/flowchart.html — `class` directive,
  `classDef`, and (most importantly) what mermaid's parser does and does
  not accept inside style values
- https://shiki.style/ — Astro's bundled syntax highlighter; dual themes
  configured in `astro.config.mjs`
- https://ccunpacked.dev/#agent-loop — single-page interactive explainer reference
- https://deep-dive-claude-code.vercel.app/ — interactive numbered loop
  hero, expandable architecture cards
