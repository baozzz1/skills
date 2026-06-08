<script lang="ts">
  import { Background, Controls, MiniMap, SvelteFlow, type Edge, type Node } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import { currentLang } from '@/i18n/lang.svelte';
  import type { ConceptGraph, ConceptNode } from '@/lib/atlas';

  let { graph }: { graph: ConceptGraph } = $props();

  let lang = $derived(currentLang());
  let focused = $state(false);
  let selectedId = $state(graph.nodes[0]?.id ?? '');
  let reducedMotion = $state(false);

  if (typeof window !== 'undefined') {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  let selectedNode = $derived(graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0]);
  let flowNodes = $derived<Node[]>(graph.nodes.map(toFlowNode));
  let flowEdges = $derived<Edge[]>(graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: text(edge.labelEn ?? '', edge.labelZh ?? ''),
    animated: !reducedMotion,
    class: 'atlas-edge'
  })));

  function text(en: string, zh: string) {
    return lang === 'zh' ? zh : en;
  }

  function toFlowNode(node: ConceptNode): Node {
    return {
      id: node.id,
      position: { x: node.x, y: node.y },
      data: {
        label: `${text(node.labelEn, node.labelZh)} · ${kindLabel(node.kind)}`
      },
      class: `kind-${node.kind}${node.id === selectedId ? ' selected' : ''}`,
      focusable: true
    };
  }

  function kindLabel(kind: ConceptNode['kind']) {
    const labels = {
      concept: ['Concept', '概念'],
      decision: ['Decision', '决策'],
      process: ['Process', '流程'],
      risk: ['Risk', '风险'],
      artifact: ['Artifact', '产物']
    } satisfies Record<ConceptNode['kind'], [string, string]>;
    const [en, zh] = labels[kind];
    return text(en, zh);
  }

  function select(id: string) {
    selectedId = id;
  }

  function onGraphKeydown(event: KeyboardEvent) {
    const index = graph.nodes.findIndex((node) => node.id === selectedId);
    const last = graph.nodes.length - 1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectedId = graph.nodes[Math.min(index + 1, last)]?.id ?? selectedId;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectedId = graph.nodes[Math.max(index - 1, 0)]?.id ?? selectedId;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectedId = graph.nodes[index]?.id ?? selectedId;
    } else if (event.key === 'Escape') {
      (event.currentTarget as HTMLElement).blur();
    }
  }
</script>

<section class="graph-card" aria-label={text('Concept graph', '概念图谱')}>
  <div
    class="flow"
    tabindex="0"
    role="application"
    aria-label={text('Interactive concept graph. Focus to enable wheel zoom.', '交互式概念图。聚焦后启用滚轮缩放。')}
    onfocus={() => focused = true}
    onblur={() => focused = false}
    onkeydown={onGraphKeydown}
  >
    <SvelteFlow
      nodes={flowNodes}
      edges={flowEdges}
      fitView
      minZoom={0.5}
      maxZoom={1.8}
      nodesDraggable={false}
      nodesConnectable={false}
      zoomOnScroll={focused}
      panOnScroll={false}
      zoomOnDoubleClick={focused}
      onnodeclick={({ node }) => select(node.id)}
    >
      <Background />
      <Controls />
      <MiniMap pannable={false} zoomable={false} nodeColor={() => 'var(--clay)'} />
    </SvelteFlow>
  </div>

  <aside class="details">
    <p class="eyebrow">{text('Selected node', '当前节点')}</p>
    <h2>{text(selectedNode.labelEn, selectedNode.labelZh)}</h2>
    <p>{text(selectedNode.summaryEn, selectedNode.summaryZh)}</p>
    <p class="kind">{kindLabel(selectedNode.kind)}</p>
  </aside>

  <div class="text-equivalent">
    <h2>{text('Text equivalent', '文字等价说明')}</h2>
    <ol>
      {#each graph.nodes as node (node.id)}
        <li>
          <button type="button" onclick={() => select(node.id)} aria-pressed={selectedId === node.id}>
            <strong>{text(node.labelEn, node.labelZh)}</strong>
            <span>{text(node.summaryEn, node.summaryZh)}</span>
          </button>
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .graph-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
    gap: 18px;
    margin: 28px 0;
    border: var(--border);
    border-radius: var(--radius-panel);
    background: var(--paper);
    padding: 16px;
  }

  .flow {
    min-height: 420px;
    border: 1px solid var(--gray-100);
    border-radius: var(--radius-panel);
    overflow: hidden;
    background: color-mix(in oklch, var(--gray-100) 58%, var(--paper));
  }

  .flow:focus-visible {
    outline: 2px solid var(--clay);
    outline-offset: 3px;
  }

  .flow :global(.svelte-flow__node) {
    border: 1.5px solid var(--gray-300);
    border-radius: var(--radius-row);
    background: var(--paper);
    color: var(--slate);
    font-family: var(--mono);
    font-size: 12px;
    box-shadow: var(--shadow-lift);
  }

  .flow :global(.svelte-flow__node.selected),
  .flow :global(.svelte-flow__node:focus) {
    border-color: var(--clay);
  }

  .flow :global(.svelte-flow__node.kind-decision) {
    border-style: dashed;
  }

  .flow :global(.svelte-flow__node.kind-process) {
    border-radius: var(--radius-pill);
  }

  .flow :global(.svelte-flow__edge-path) {
    stroke: var(--clay);
    stroke-width: 1.8;
  }

  .flow :global(.svelte-flow__edge-text) {
    fill: var(--gray-700);
    font-family: var(--mono);
  }

  .details {
    border-left: 1px solid var(--gray-100);
    padding: 8px 4px 8px 18px;
  }

  .details h2,
  .text-equivalent h2 {
    margin: 0 0 10px;
  }

  .kind {
    display: inline-flex;
    margin-top: 12px;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-pill);
    padding: 4px 8px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--clay);
  }

  .text-equivalent {
    grid-column: 1 / -1;
    border-top: 1px solid var(--gray-100);
    padding-top: 14px;
  }

  .text-equivalent ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .text-equivalent button {
    width: 100%;
    height: 100%;
    display: grid;
    gap: 4px;
    text-align: left;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-row);
    background: color-mix(in oklch, var(--paper) 82%, var(--gray-100));
    padding: 10px;
  }

  .text-equivalent button[aria-pressed='true'] {
    border-color: var(--clay);
    color: var(--clay);
  }

  .text-equivalent span {
    color: var(--gray-700);
    font-size: 13px;
  }

  @media (max-width: 820px) {
    .graph-card {
      grid-template-columns: 1fr;
    }

    .details {
      border-left: 0;
      border-top: 1px solid var(--gray-100);
      padding: 14px 0 0;
    }

    .text-equivalent ol {
      grid-template-columns: 1fr;
    }
  }
</style>
