# Holographic Collectible Cards Reference

Use `templates/cards/` when the user has 3-9 peer items that should feel like a
premium set: features, plans, tiers, tools, agents, projects, team members, or
launch highlights.

## Reading Model

- Single `/` route.
- Hero plus responsive card grid.
- No required reading order.
- Each card is a tactile object with pointer-tracked tilt and restrained `glint`
  by default.
- Full `holo` spectacle is opt-in only when the user explicitly asks for it.

Do not use this template for dense reference tables, long prose, or relationship
graphs.

## Editable Files In A Generated Site

Agents may edit:

- `src/lib/cards.ts`
- `src/pages/index.astro` hero literals only
- `src/i18n/strings.ts` for UI labels, with both EN and ZH filled
- `public/favicon.svg` only when the source project has a real mark

Treat `HoloCardGrid.svelte`, `HoloCard.svelte`, styles, config, package
metadata, and lockfiles as template-level contracts unless the user is
explicitly upgrading the skill.

## Authoring API

The page owns the card grid island:

```astro
import HoloCardGrid from '@/components/HoloCardGrid.svelte';
import '@/components/HoloCardGrid.svelte';
import '@/components/HoloCard.svelte';
```

Hydrate with:

```astro
<HoloCardGrid client:visible cards={cards} mode="glint" />
```

`mode` is `glint` by default. Use `mode="holo"` only when explicitly requested.

`src/lib/cards.ts` exports:

```ts
export type CardMode = 'glint' | 'holo';
export type CardVariant = 'standard' | 'featured' | 'gold';

export type Card = {
  titleEn: string;
  titleZh: string;
  subtitleEn: string;
  subtitleZh: string;
  icon?: string;
  href?: string;
  chips?: Array<{
    labelEn: string;
    labelZh: string;
    tone: 'clay' | 'olive' | 'rust' | 'info' | 'muted';
  }>;
  variant?: CardVariant;
};
```

## Rules

- 3-9 cards only.
- Each card is a real focusable link or button.
- Focus rings are visible; focus must not trigger tilt.
- Foil, glare, and scanline layers are `aria-hidden` and `pointer-events: none`.
- Text contrast must remain readable at the brightest glare state.
- Pointer math writes CSS custom properties; CSS owns rendering.
- Reduced motion renders flat token-styled cards with normal hover only.
- Optional device-orientation behavior must be gesture-gated and never required.

## Brand-Fit Gate

Before completing this template, prototype `glint` and ask the user to confirm:

> Does the default glint feel premium and on-brand using only token-derived
> clay/oat/gray sheen?

If the answer is no, stop and adjust or drop C from the release rather than
adding off-brand colors or aggressive gradients.

## Verification Checklist

Run:

```shell
bun run typecheck && bun run build
bun ../../scripts/check-svelte-css.mjs .
```

Then preview built output and verify:

- `glint` is the default.
- `holo` appears only when configured.
- Pointer movement tilts and moves glare smoothly.
- Pointer leave springs back.
- Keyboard tab order reaches every card.
- Focus ring is clear and stable.
- Reduced motion disables tilt/foil animation.
- EN/ZH toggles update titles, subtitles, chips, and labels.
- Mobile has no page-level horizontal scroll.
