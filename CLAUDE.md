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
```

Expected non-blocking output: Astro/Zod deprecation hints from `astro check` and a Vite chunk-size warning from Mermaid.

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
