# Sticky-Stage Scrollytelling Reference

Use `templates/scrollytelling/` when the user needs to narrate the evolution of
one subject over time: a roadmap, history, migration journey, architecture
growth story, or before/during/after transformation.

## Reading Model

- Single `/` route.
- Forced-linear scroll narrative.
- A sticky visual stage remains visible while 3-7 dated steps pass beside it.
- The stage redraws, accumulates, or highlights state as the active step changes.
- Text carries the complete story; the visual stage reinforces it.

Do not use this template for unrelated steps or many independent topics.

## Editable Files In A Generated Site

Agents may edit:

- `src/lib/story.ts`
- `src/pages/index.astro` hero literals only
- `src/i18n/strings.ts` for UI labels, with both EN and ZH filled
- `public/favicon.svg` only when the source project has a real mark

Treat `StickyStage.svelte`, styles, config, package metadata, and lockfiles as
template-level contracts unless the user is explicitly upgrading the skill.

## Authoring API

The page owns one island:

```astro
import StickyStage from '@/components/StickyStage.svelte';
import '@/components/StickyStage.svelte';
```

Hydrate with:

```astro
<StickyStage client:visible story={story} />
```

`src/lib/story.ts` exports:

```ts
export type StageKind = 'accumulating-graph' | 'layered-buildup' | 'highlight-on-shared';

export type Step = {
  period: string;
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
  stateKey: string;
  alt: string;
};

export type StageState = {
  key: string;
  label: string;
  nodes?: Array<{ id: string; label: string; x: number; y: number; step: number }>;
  edges?: Array<{ from: string; to: string; step: number }>;
  layers?: Array<{ id: string; label: string; step: number }>;
  highlights?: Array<{ id: string; step: number }>;
};
```

Allowed `stageKind` values:

- `accumulating-graph`: nodes/edges appear cumulatively per step.
- `layered-buildup`: layers of one diagram fade/slide in per step.
- `highlight-on-shared`: one fixed diagram with changing active regions.

## Rules

- 3-7 steps only.
- Each step needs enough prose/min-height for the sticky frame to hold.
- Use `IntersectionObserver`; never hijack scroll events.
- The SVG stage is `aria-hidden`; each step's text and `alt` carry the meaning.
- Reduced-motion fallback must render a readable stacked timeline.
- First screen at 1920x1080 shows hero, first step, and stage.

## Verification Checklist

Run:

```shell
bun run typecheck && bun run build
bun ../../scripts/check-svelte-css.mjs .
```

Then preview built output and verify:

- Stage sticks while step cards scroll.
- Active step changes as each dated step crosses the observer threshold.
- The visual state matches `stateKey`.
- EN/ZH toggles preserve active state and update all text.
- Reduced motion renders without draw-on/move animation.
- Keyboard reading order is hero -> step text -> next page content.
- There is no scroll-jacking, snap trap, or horizontal page overflow.
