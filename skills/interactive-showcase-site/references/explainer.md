# Explainer Reference

Use `templates/explainer/` when the user wants to explain one static project,
SDK, workflow, or technical system in 4-8 sections on a single page.

## Reading Model

- Single `/` route with language-switched duplicated content.
- Hash-deep-linkable sections.
- Fixed right-side scroll-spy TOC on desktop, compact disclosure on mobile.
- Hero first screen gives 3-5 executive summary rows.
- Body sections use MDX with sanctioned interactive islands.

## Editable Files In A Generated Site

Agents may edit:

- `src/content/sections/en/*.mdx`
- `src/content/sections/zh/*.mdx`
- `src/pages/index.astro` hero literals only: `siteTitleEn`, `siteTitleZh`,
  `faviconLetter`, `heroPropsEn`, `heroPropsZh`
- `src/components/*Diagram.tsx` only for per-section custom visualizations —
  React function components. Use hooks (`useState`/`useEffect`/`useRef`); read
  language via `useLang()` from `@/i18n/lang`. Put any styles in
  `src/styles/components/<name>.css` and `@import` them from `site.css`; use
  plain `className`s, never inline hex (only `var(--token)` colors).
- `src/i18n/strings.ts` only when adding UI labels, with both EN and ZH filled
- `public/favicon.svg` only when the source project has a real mark

Treat template components, styles, config, package metadata, and lockfiles as
immutable during generated-site authoring.

## Content Shape

Each section exists twice:

```yaml
---
id: agent-loop
title: "Agent Loop"
order: 2
heroKind: lifecycle
eyebrow: "AGENT LIFECYCLE"
estimatedRead: 4
lang: en
---
```

The matching ZH file must have the same `id`, `order`, and compatible body
structure. `heroKind` is one of `plain`, `lifecycle`, `mermaid`, `tabs`, or
`side-by-side`.

## Authoring API

MDX sections may import only these components:

```mdx
import Lifecycle from '@/components/Lifecycle';
import Mermaid from '@/components/Mermaid';
import Tabs from '@/components/Tabs';
import CodeBlock from '@/components/CodeBlock';
import Callout from '@/components/Callout.astro';
import Chip from '@/components/Chip.astro';
```

Use hydration directives exactly as follows:

| Component | Directive |
|---|---|
| `Lifecycle` | `client:visible` |
| `Mermaid` | `client:visible` |
| `Tabs` | `client:visible` |
| `CodeBlock` | `client:idle` |
| `Callout` | none |
| `Chip` | none |

Component styles are aggregated by `src/styles/site.css` (imported once by
`BaseLayout`), so no per-page side-effect imports are needed — the CSS is always
on the page's static import path.

## Patterns

### Lifecycle

Use for 3-8 step API call sequences, request flows, agent loops, or state
machines.

```mdx
<Lifecycle
  client:visible
  autoplay
  interval={2800}
  steps={[
    {
      num: 1,
      title: "Read context",
      api: "buildContext(messages, tools, system)",
      desc: "The runtime turns history, tools, and system rules into the next prompt.",
      code: "const ctx = buildContext({ messages, tools, system });"
    }
  ]}
/>
```

Autoplay must pause on user click and start paused under reduced motion.

### Mermaid

Use for structures where each diagram node maps to a documentable concept.

```mdx
<Mermaid
  client:visible
  spec={`flowchart LR
    cfg["config"]
    eng(["engine"])
    cfg --> eng
    classDef hot stroke-width:2.5px;
    class eng hot;`}
  nodes={{
    cfg: { title: "config", body: "Runtime configuration entry." },
    eng: { title: "engine", body: "Execution runtime." }
  }}
/>
```

Do not use `var(--...)` inside Mermaid `classDef` style values. Theme-aware
coloring lives in component CSS.

### Tabs

Use for variants of the same idea.

```mdx
<Tabs
  client:visible
  group="impl"
  tabs={[
    { label: "Recursive", html: `<pre><code>loop(messages)</code></pre>` },
    { label: "State machine", html: `<pre><code>step(state)</code></pre>` }
  ]}
/>
```

`group` must be unique per page.

### Callout, Chip, CodeBlock

Use `Callout` for TL;DR / info / warning / danger / success moments, `Chip` for
small status labels, and `CodeBlock` only when a copy button is needed.

## Verification Checklist

Run first:

```shell
bun run typecheck && bun run build
```

Then preview the built output and verify:

- At 1920x1080, top controls, fixed TOC, hero, 3-5 first-screen rows, and start
  of first section fit in both EN and ZH.
- Theme cycles system/light/dark, persists, and Mermaid re-renders on theme flip.
- Lang toggle changes hero, nav, sections, callouts, buttons, Lifecycle, Mermaid
  placeholders, and copy labels without resetting theme.
- EN/ZH section sets have identical `id` and `order`.
- Mermaid node clicks update the detail panel.
- Lifecycle click pauses autoplay; resume works; reduced motion starts paused.
- Tabs change only the active panel and preserve scroll position.
- CodeBlock copy success state resets.
- Mobile has no page-level horizontal scroll.
- Print hides controls and keeps readable narrative.
