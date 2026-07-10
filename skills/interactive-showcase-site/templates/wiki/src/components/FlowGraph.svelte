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

<!-- Styles: src/styles/components/flow-graph.css (aggregated by site.css). -->
