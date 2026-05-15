<script lang="ts">
  /**
   * Mermaid — render a mermaid diagram, click nodes to open a side panel
   * describing each concept.
   *
   * - Theme aware: reads CSS variables -> mermaid.themeVariables.
   * - Re-renders when [data-theme] flips (mermaid does not hot-swap themes).
   * - Click handlers are wired automatically.
   * - Node detail panel sticks under the diagram. Initial state is an italic
   *   placeholder, not hidden.
   *
   * See SKILL.md "Pattern B" for full authoring contract and examples.
   */
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';
  import { t } from '@/i18n/lang.svelte';

  type NodeDoc = { title: string; body: string };
  type Props = {
    spec: string;
    nodes?: Record<string, NodeDoc>;
    legend?: { swatch: string; label: string }[];
    title?: string;
  };

  let { spec, nodes = {}, legend = [], title }: Props = $props();
  let strings = $derived(t());

  let host: HTMLElement | undefined = $state();
  let detail = $state<NodeDoc | null>(null);
  let renderId = $state(0);
  let svgHtml = $state('');
  let pending = $state(true);
  let errorMsg = $state<string | null>(null);

  function readVars(name: string): string {
    if (typeof getComputedStyle === 'undefined' || !host) return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function buildThemeVars() {
    return {
      background:        readVars('--ivory') || '#FAF9F5',
      primaryColor:      readVars('--paper') || '#FFFFFF',
      primaryTextColor:  readVars('--slate') || '#141413',
      primaryBorderColor: readVars('--gray-500') || '#87867F',
      lineColor:         readVars('--gray-500') || '#87867F',
      secondaryColor:    readVars('--gray-100') || '#F0EEE6',
      tertiaryColor:     readVars('--oat')      || '#E3DACC',
      fontFamily:        'IBM Plex Sans Variable, system-ui, sans-serif',
      fontSize:          '13px'
    };
  }

  function syncMermaidTokens() {
    // We let mermaid use var(...) inside classDef, so the browser resolves
    // hot-* and other dynamic colors at paint time. Nothing to do here yet,
    // but keep the hook in case we later need explicit resolution.
  }

  async function render() {
    pending = true;
    errorMsg = null;
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        themeVariables: buildThemeVars(),
        flowchart: { curve: 'basis', htmlLabels: true },
        fontFamily: 'IBM Plex Sans Variable, system-ui, sans-serif'
      });
      const id = `mm-${Math.random().toString(36).slice(2, 9)}-${renderId++}`;
      const { svg, bindFunctions } = await mermaid.render(id, spec.trim());
      svgHtml = svg;
      // attach click bindings on next tick
      queueMicrotask(() => {
        if (host && bindFunctions) bindFunctions(host);
        wireClicks();
      });
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    } finally {
      pending = false;
    }
  }

  function wireClicks() {
    if (!host) return;
    const svgEl = host.querySelector('svg');
    if (!svgEl) return;
    // mermaid stamps node ids like "flowchart-ctx-3"; we want to find the
    // user's logical id ("ctx") inside that. Strategy: scan node groups,
    // find the [id] that contains "<key>-" or ends with "-<key>".
    const nodeKeys = Object.keys(nodes);
    if (!nodeKeys.length) return;
    const groups = svgEl.querySelectorAll('g.node');
    groups.forEach((g) => {
      const id = g.id || '';
      const key = nodeKeys.find((k) => {
        const re = new RegExp(`(^|-)${k}(-|$)`);
        return re.test(id);
      });
      if (!key) return;
      g.classList.add('mm-clickable');
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', nodes[key].title);
      const open = (e: Event) => {
        e.stopPropagation();
        detail = nodes[key];
      };
      g.addEventListener('click', open);
      g.addEventListener('keydown', (ev) => {
        const k = ev as KeyboardEvent;
        if (k.key === 'Enter' || k.key === ' ') {
          k.preventDefault();
          open(ev);
        }
      });
    });
  }

  onMount(() => {
    syncMermaidTokens();
    render();
    // Re-render on theme flip — mermaid's theme is baked into the SVG.
    const observer = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          render();
          return;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let mq: MediaQueryList | null = null;
    if (window.matchMedia) {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', render);
    }
    return () => {
      observer.disconnect();
      mq?.removeEventListener?.('change', render);
    };
  });
</script>

<div class="mermaid-shell" bind:this={host}>
  {#if title}
    <div class="title">{title}</div>
  {/if}
  <div class="canvas">
    {#if pending}
      <div class="placeholder">{strings.mermaidRendering}</div>
    {:else if errorMsg}
      <div class="error">{strings.mermaidFailedPrefix}{errorMsg}</div>
    {:else}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html svgHtml}
    {/if}
  </div>

  {#if legend.length}
    <div class="legend">
      {#each legend as l}
        <span class="legend-item">
          <span class="swatch" style="background:{l.swatch}"></span>
          {l.label}
        </span>
      {/each}
    </div>
  {/if}

  <div class="node-detail" class:is-empty={!detail} aria-live="polite">
    {#if detail}
      <strong class="d-title">{detail.title}</strong>
      <p class="d-body">{detail.body}</p>
    {:else}
      <em class="hint">{strings.mermaidHint}</em>
    {/if}
  </div>
</div>

<style>
  .mermaid-shell {
    background: var(--paper);
    border: 1.5px solid var(--gray-300);
    border-radius: var(--radius-panel);
    padding: 18px 20px;
    margin: 0;
  }
  .title {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--gray-500);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .canvas {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 0 8px;
  }
  .canvas :global(svg) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  .canvas :global(g.node.mm-clickable) {
    cursor: pointer;
    transition: filter 0.15s ease;
  }
  .canvas :global(g.node.mm-clickable:hover rect),
  .canvas :global(g.node.mm-clickable:hover polygon),
  .canvas :global(g.node.mm-clickable:hover ellipse),
  .canvas :global(g.node.mm-clickable:hover circle) {
    filter: brightness(0.97);
    stroke-width: 2px;
  }
  .canvas :global(g.node.mm-clickable:focus-visible) {
    outline: 2px solid var(--clay);
    outline-offset: 2px;
  }
  /* "hot" node accent — apply via CSS so it's theme-aware. Author marks the
     node with `class <id> hot;` in the mermaid spec. */
  .canvas :global(g.node.hot rect),
  .canvas :global(g.node.hot polygon),
  .canvas :global(g.node.hot ellipse),
  .canvas :global(g.node.hot circle),
  .canvas :global(g.node.hot path) {
    fill: var(--mm-hot-fill) !important;
    stroke: var(--mm-hot-stroke) !important;
  }
  .canvas :global(g.node.hot .nodeLabel),
  .canvas :global(g.node.hot foreignObject *),
  .canvas :global(g.node.hot text) {
    color: var(--mm-hot-text) !important;
    fill: var(--mm-hot-text) !important;
  }
  .placeholder, .error {
    padding: 24px 0;
    text-align: center;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--gray-500);
  }
  .error { color: var(--rust); }
  .legend {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    padding: 8px 0 4px;
    border-top: 1px solid var(--gray-100);
    font-size: 12px;
    color: var(--gray-700);
  }
  .legend-item { display: inline-flex; align-items: center; gap: 6px; }
  .swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid var(--gray-300);
  }
  .node-detail {
    margin-top: 12px;
    padding: 12px 14px;
    background: var(--gray-100);
    border-radius: var(--radius-row);
    border-left: 3px solid var(--clay);
  }
  .node-detail.is-empty { border-left-color: var(--gray-300); }
  .hint {
    color: var(--gray-500);
    font-size: 13px;
    font-style: italic;
  }
  .d-title {
    display: block;
    font-family: var(--sans);
    font-size: 13.5px;
    color: var(--slate);
    margin-bottom: 4px;
  }
  .d-body {
    margin: 0;
    color: var(--gray-700);
    font-size: 14px;
    line-height: 1.6;
    max-width: 70ch;
  }
</style>
