/**
 * FlowGraph — interactive concept graph via @xyflow/react (the upstream
 * implementation; @xyflow/svelte was the port). Read-only: nodes are static and
 * selection only recolors, so nodes/edges are passed as controlled props with
 * no change handlers. Styles: src/styles/components/flow-graph.css (the former
 * .svelte-flow__ selectors are now .react-flow__).
 */
import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLang } from '@/i18n/lang';
import type { ConceptGraph, ConceptNode } from '@/lib/atlas';

type Props = { graph: ConceptGraph };

export default function FlowGraph({ graph }: Props) {
  const lang = useLang();
  const [focused, setFocused] = useState(false);
  const [selectedId, setSelectedId] = useState(graph.nodes[0]?.id ?? '');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const text = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const kindLabel = (kind: ConceptNode['kind']) => {
    const labels = {
      concept: ['Concept', '概念'],
      decision: ['Decision', '决策'],
      process: ['Process', '流程'],
      risk: ['Risk', '风险'],
      artifact: ['Artifact', '产物']
    } satisfies Record<ConceptNode['kind'], [string, string]>;
    const [en, zh] = labels[kind];
    return text(en, zh);
  };

  const selectedNode = graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0];

  const flowNodes = useMemo<Node[]>(
    () =>
      graph.nodes.map((node) => ({
        id: node.id,
        position: { x: node.x, y: node.y },
        data: { label: `${text(node.labelEn, node.labelZh)} · ${kindLabel(node.kind)}` },
        className: `kind-${node.kind}${node.id === selectedId ? ' selected' : ''}`,
        focusable: true
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph.nodes, lang, selectedId]
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: text(edge.labelEn ?? '', edge.labelZh ?? ''),
        animated: !reducedMotion,
        className: 'atlas-edge'
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph.edges, lang, reducedMotion]
  );

  function onGraphKeydown(event: KeyboardEvent<HTMLDivElement>) {
    const index = graph.nodes.findIndex((node) => node.id === selectedId);
    const last = graph.nodes.length - 1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedId(graph.nodes[Math.min(index + 1, last)]?.id ?? selectedId);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedId(graph.nodes[Math.max(index - 1, 0)]?.id ?? selectedId);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedId(graph.nodes[index]?.id ?? selectedId);
    } else if (event.key === 'Escape') {
      (event.currentTarget as HTMLElement).blur();
    }
  }

  return (
    <section className="graph-card" aria-label={text('Concept graph', '概念图谱')}>
      <div
        className="flow"
        tabIndex={0}
        role="application"
        aria-label={text('Interactive concept graph. Focus to enable wheel zoom.', '交互式概念图。聚焦后启用滚轮缩放。')}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onGraphKeydown}
      >
        <ReactFlowProvider>
          <ReactFlow
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
            onNodeClick={(_event, node) => setSelectedId(node.id)}
          >
            <Background />
            <Controls />
            <MiniMap pannable={false} zoomable={false} nodeColor={() => 'var(--clay)'} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <aside className="details">
        <p className="eyebrow">{text('Selected node', '当前节点')}</p>
        <h2>{text(selectedNode.labelEn, selectedNode.labelZh)}</h2>
        <p>{text(selectedNode.summaryEn, selectedNode.summaryZh)}</p>
        <p className="kind">{kindLabel(selectedNode.kind)}</p>
      </aside>

      <div className="text-equivalent">
        <h2>{text('Text equivalent', '文字等价说明')}</h2>
        <ol>
          {graph.nodes.map((node) => (
            <li key={node.id}>
              <button type="button" onClick={() => setSelectedId(node.id)} aria-pressed={selectedId === node.id}>
                <strong>{text(node.labelEn, node.labelZh)}</strong>
                <span>{text(node.summaryEn, node.summaryZh)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
