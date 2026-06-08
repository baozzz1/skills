export type Lang = 'en' | 'zh';

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

export type StageNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  step: number;
};

export type StageEdge = {
  from: string;
  to: string;
  step: number;
};

export type StageLayer = {
  id: string;
  label: string;
  step: number;
};

export type StageState = {
  key: string;
  label: string;
  nodes?: StageNode[];
  edges?: StageEdge[];
  layers?: StageLayer[];
  highlights?: Array<{ id: string; step: number }>;
};

export type Story = {
  stageKind: StageKind;
  eyebrowEn: string;
  eyebrowZh: string;
  titleEn: string;
  titleZh: string;
  leadEn: string;
  leadZh: string;
  steps: Step[];
  stageStates: StageState[];
};

const nodes: StageNode[] = [
  { id: 'seed', label: 'Seed', x: 16, y: 50, step: 0 },
  { id: 'loop', label: 'Loop', x: 38, y: 30, step: 1 },
  { id: 'tools', label: 'Tools', x: 62, y: 50, step: 2 },
  { id: 'review', label: 'Review', x: 82, y: 28, step: 3 },
  { id: 'library', label: 'Library', x: 82, y: 72, step: 4 }
];

const edges: StageEdge[] = [
  { from: 'seed', to: 'loop', step: 1 },
  { from: 'loop', to: 'tools', step: 2 },
  { from: 'tools', to: 'review', step: 3 },
  { from: 'tools', to: 'library', step: 4 }
];

export const story: Story = {
  stageKind: 'accumulating-graph',
  eyebrowEn: 'STICKY-STAGE SCROLLYTELLING',
  eyebrowZh: 'STICKY-STAGE 叙事',
  titleEn: 'One system, evolving in view',
  titleZh: '让一个系统的演进始终留在视野里',
  leadEn:
    'Use this template when the reader should watch one subject accumulate capability over time. The stage stays pinned; the narrative advances step by step.',
  leadZh:
    '当读者需要看见一个主体如何随时间积累能力时，使用这个模板。舞台保持固定，叙事按阶段推进。',
  steps: [
    {
      period: '2021',
      titleEn: 'A seed idea',
      titleZh: '一个种子想法',
      bodyEn:
        'Start with one durable problem statement. The first state should be simple enough to understand without animation.',
      bodyZh:
        '先给出一个稳定的问题陈述。第一帧要足够简单，即使没有动画也能读懂。',
      stateKey: 'seed',
      alt: 'A single seed node appears on the stage.'
    },
    {
      period: '2022',
      titleEn: 'The loop emerges',
      titleZh: '循环出现',
      bodyEn:
        'The shared canvas begins to show process. Readers can compare each new state against the same visual anchor.',
      bodyZh:
        '共享画布开始呈现流程。读者可以把每个新状态都和同一个视觉锚点比较。',
      stateKey: 'loop',
      alt: 'A loop node connects to the seed node.'
    },
    {
      period: '2023',
      titleEn: 'Tools connect',
      titleZh: '工具接入',
      bodyEn:
        'New capabilities should accumulate, not reset the scene. That continuity is the reason to choose scrollytelling over a normal explainer.',
      bodyZh:
        '新能力应该累积，而不是重置画面。这种连续性正是选择 scrollytelling 而不是普通 explainer 的原因。',
      stateKey: 'tools',
      alt: 'A tools node extends the graph from the loop.'
    },
    {
      period: '2024',
      titleEn: 'Review tightens',
      titleZh: '审查收紧',
      bodyEn:
        'Add checks, gates, and feedback as visible structure. The reader should see why the system changed, not just that it changed.',
      bodyZh:
        '把检查、关卡和反馈显式画出来。读者要看见系统为什么变化，而不只是知道它变了。',
      stateKey: 'review',
      alt: 'A review node branches from the tools node.'
    },
    {
      period: 'Today',
      titleEn: 'A library forms',
      titleZh: '形成模板库',
      bodyEn:
        'The final state should feel like the natural consequence of the earlier phases, with no surprise leap in the last viewport.',
      bodyZh:
        '最后一帧应该像前面阶段自然累积出来的结果，而不是在最后一个视口突然跳跃。',
      stateKey: 'library',
      alt: 'The graph now contains the full library branch.'
    }
  ],
  stageStates: [
    { key: 'seed', label: 'Seed', nodes: nodes.slice(0, 1), edges: [] },
    { key: 'loop', label: 'Loop', nodes: nodes.slice(0, 2), edges: edges.slice(0, 1) },
    { key: 'tools', label: 'Tools', nodes: nodes.slice(0, 3), edges: edges.slice(0, 2) },
    { key: 'review', label: 'Review', nodes: nodes.slice(0, 4), edges: edges.slice(0, 3) },
    { key: 'library', label: 'Library', nodes, edges }
  ]
};
