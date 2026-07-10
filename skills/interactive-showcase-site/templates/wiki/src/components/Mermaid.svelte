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
      background:        readVars('--ivory') || 'transparent',
      primaryColor:      readVars('--paper') || 'white',
      primaryTextColor:  readVars('--slate') || 'black',
      primaryBorderColor: readVars('--gray-500') || 'gray',
      lineColor:         readVars('--gray-500') || 'gray',
      secondaryColor:    readVars('--gray-100') || 'whitesmoke',
      tertiaryColor:     readVars('--oat')      || 'beige',
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
        // mark this node as the active selection so styles can match the
        // active Tab visual (clay ring on a clay-tinted fill).
        svgEl.querySelectorAll('g.node.mm-selected').forEach((n) => n.classList.remove('mm-selected'));
        g.classList.add('mm-selected');
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
  <div class="canvas" class:is-loading={pending} class:has-error={!!errorMsg}>
    {#if pending}
      <div class="placeholder" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <span>{strings.mermaidRendering}</span>
      </div>
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

  {#if !pending && !errorMsg}
    <div class="node-detail" class:is-empty={!detail} aria-live="polite">
      {#if detail}
        <strong class="d-title">{detail.title}</strong>
        <p class="d-body">{detail.body}</p>
      {:else}
        <em class="hint">{strings.mermaidHint}</em>
      {/if}
    </div>
  {/if}
</div>

<!-- Styles: src/styles/components/mermaid.css (aggregated by site.css). -->
