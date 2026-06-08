# Interactive Showcase Site

> Route a README, SDK, docs folder, timeline, card set, or concept map to the right bilingual interactive Astro + Svelte template.

[简体中文](README.zh.md) · [Live preview ↗](https://baozzz1.github.io/skills/)

## Intent

`interactive-showcase-site` is an Agent Skill for turning technical source material into a buildable interactive site. It now works as a template library routed by scenario: a single-page explainer, sticky-stage scrollytelling page, holographic collectible card set, or multi-page knowledge-wiki diagram atlas.

The design goal is not a generic docs portal. It is a focused, editorial artifact that picks the interaction model that best matches how a reader should move through the material: scan one system, follow one evolution, browse a premium collection, or explore related concepts.

All templates share the same visual kernel: warm paper-like neutrals, clay/coral accents, serif editorial hierarchy, self-hosted Source Serif 4 / IBM Plex Sans / JetBrains Mono, tokenized light/dark theme, bilingual EN/ZH switching, reduced-motion support, and no generic AI-slop tropes.

## Installation

> Both commands accept either the GitHub shorthand `baozzz1/skills` or the full URL `https://github.com/baozzz1/skills`.

Install through a Claude Code plugin marketplace:

```shell
/plugin marketplace add baozzz1/skills
/plugin install interactive-showcase-site@interactive-showcase-site-skills
```

Invoke it in Claude Code:

```shell
/interactive-showcase-site:interactive-showcase-site
```

Install through the Agent Skills CLI:

```shell
npx skills add baozzz1/skills --skill interactive-showcase-site
```

For a global skills install:

```shell
npx skills add baozzz1/skills --skill interactive-showcase-site -g
```
