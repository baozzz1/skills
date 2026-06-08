# Knowledge-Wiki Diagram Atlas Reference

Use `templates/wiki/` when the user has many interrelated concepts and the
relationships matter: pattern catalogs, taxonomies, dependency maps, decision
systems, architecture maps, or "which one do I pick" reference guides.

## Reading Model

- Multi-page Astro site.
- Sidebar category tree for global navigation.
- Main concept page with four-question prose structure.
- On-this-page rail for headings.
- Each concept page includes an interactive `@xyflow/svelte` graph.
- Prev/next pager follows a route manifest.

D is the only multi-page archetype. It requires explicit user approval before
scaffolding.

## Editable Files In A Generated Site

Agents may edit:

- `src/content/concepts/en/*.mdx`
- `src/content/concepts/zh/*.mdx`
- `src/lib/atlas.ts`
- `src/pages/index.astro` redirect/landing copy if needed
- `src/i18n/strings.ts` for UI labels, with both EN and ZH filled
- `public/favicon.svg` only when the source project has a real mark

Treat graph/navigation components, styles, config, package metadata, and
lockfiles as template-level contracts unless the user is explicitly upgrading
the skill.

## Authoring API

The concept route owns these interactive islands:

```astro
import Sidebar from '@/components/Sidebar.svelte';
import OnThisPage from '@/components/OnThisPage.svelte';
import FlowGraph from '@/components/FlowGraph.svelte';
import '@/components/Sidebar.svelte';
import '@/components/OnThisPage.svelte';
import '@/components/FlowGraph.svelte';
```

Hydrate with:

```astro
<Sidebar client:load tree={categoryTree} currentId={concept.id} />
<OnThisPage client:idle headings={headings} />
<FlowGraph client:visible graph={concept.graph} />
```

`src/lib/atlas.ts` exports:

```ts
export type ConceptNode = {
  id: string;
  labelEn: string;
  labelZh: string;
  kind: 'concept' | 'decision' | 'process' | 'risk' | 'artifact';
  summaryEn: string;
  summaryZh: string;
};

export type ConceptEdge = {
  id: string;
  source: string;
  target: string;
  labelEn?: string;
  labelZh?: string;
};

export type GraphView = {
  id: string;
  labelEn: string;
  labelZh: string;
  nodeIds: string[];
  edgeIds: string[];
};
```

Each concept page uses the same four-question prose shape:

1. Problem
2. Structure
3. Implementation
4. When not to use

## Rules

- EN/ZH concept files must have matching `id`, `order`, category, and slug.
- Graph data is declarative; authors do not hand-code custom graph components.
- `zoomOnScroll` is enabled only after the canvas is focused/clicked.
- Keyboard users can focus nodes, select with enter/space, move with arrows, and
  escape back to page navigation.
- Every graph has a text equivalent through prose or a labeled node/edge list.
- Animated playback honors reduced motion and never auto-loops.
- Node color coding must have a non-color cue.
- Static Mermaid remains available for authored set-piece diagrams, but the
  concept graph is `FlowGraph.svelte`.

## Verification Checklist

Run:

```shell
bun run typecheck && bun run build
bun ../../scripts/check-svelte-css.mjs .
```

Then preview built output and verify:

- Multiple routes are generated.
- Sidebar has `aria-current` on the active concept.
- On-this-page rail tracks headings without layout jump.
- Prev/next pager follows `order`.
- Graph fits view, supports pan/zoom, and does not hijack page scroll.
- Node click/focus updates the detail panel.
- Keyboard node operation works.
- Reduced motion renders a static all-view graph.
- Text equivalent exposes graph information without relying on the canvas.
- EN/ZH toggles preserve the current concept route and update visible copy.
