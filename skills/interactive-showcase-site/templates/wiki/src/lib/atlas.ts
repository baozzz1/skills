export type Lang = 'en' | 'zh';

export type ConceptNode = {
  id: string;
  labelEn: string;
  labelZh: string;
  kind: 'concept' | 'decision' | 'process' | 'risk' | 'artifact';
  summaryEn: string;
  summaryZh: string;
  x: number;
  y: number;
};

export type ConceptEdge = {
  id: string;
  source: string;
  target: string;
  labelEn?: string;
  labelZh?: string;
};

export type GraphView = {
  id: string;
  labelEn: string;
  labelZh: string;
  nodeIds: string[];
  edgeIds: string[];
};

export type ConceptGraph = {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  views?: GraphView[];
};

export type Category = {
  id: string;
  titleEn: string;
  titleZh: string;
  items: string[];
};

export const conceptOrder = ['router', 'kernel', 'templates', 'verification'];

export const conceptMeta: Record<string, { slug: string; titleEn: string; titleZh: string; category: string }> = {
  router: {
    slug: 'router',
    titleEn: 'Intent Router',
    titleZh: '意图路由',
    category: 'foundation'
  },
  kernel: {
    slug: 'kernel',
    titleEn: 'Shared Kernel',
    titleZh: '共享内核',
    category: 'foundation'
  },
  templates: {
    slug: 'templates',
    titleEn: 'Template Family',
    titleZh: '模板族',
    category: 'system'
  },
  verification: {
    slug: 'verification',
    titleEn: 'Verification Matrix',
    titleZh: '验证矩阵',
    category: 'system'
  }
};

export const categoryTree: Category[] = [
  {
    id: 'foundation',
    titleEn: 'Foundation',
    titleZh: '基础',
    items: ['router', 'kernel']
  },
  {
    id: 'system',
    titleEn: 'System',
    titleZh: '系统',
    items: ['templates', 'verification']
  }
];

const baseNodes: ConceptNode[] = [
  {
    id: 'router',
    labelEn: 'Router',
    labelZh: '路由',
    kind: 'decision',
    summaryEn: 'Maps user intent to the template that best matches the reading model.',
    summaryZh: '把用户意图映射到最符合阅读模型的模板。',
    x: 80,
    y: 80
  },
  {
    id: 'kernel',
    labelEn: 'Kernel',
    labelZh: '内核',
    kind: 'artifact',
    summaryEn: 'Shared tokens, theme, language, layout, and baseline config.',
    summaryZh: '共享 tokens、主题、语言、布局和基础配置。',
    x: 360,
    y: 80
  },
  {
    id: 'templates',
    labelEn: 'Templates',
    labelZh: '模板',
    kind: 'concept',
    summaryEn: 'Complete, independently buildable scaffolds copied into output projects.',
    summaryZh: '完整且可独立构建的脚手架，被复制到输出项目。',
    x: 220,
    y: 250
  },
  {
    id: 'verification',
    labelEn: 'Verify',
    labelZh: '验证',
    kind: 'process',
    summaryEn: 'Build matrix, kernel drift checks, and CSS-orphan detection.',
    summaryZh: '构建矩阵、内核漂移检查和 CSS orphan 检测。',
    x: 520,
    y: 250
  }
];

const baseEdges: ConceptEdge[] = [
  { id: 'router-templates', source: 'router', target: 'templates', labelEn: 'selects', labelZh: '选择' },
  { id: 'kernel-templates', source: 'kernel', target: 'templates', labelEn: 'syncs into', labelZh: '同步到' },
  { id: 'templates-verification', source: 'templates', target: 'verification', labelEn: 'builds in', labelZh: '进入验证' },
  { id: 'verification-kernel', source: 'verification', target: 'kernel', labelEn: 'guards drift', labelZh: '防漂移' }
];

export function graphForConcept(id: string): ConceptGraph {
  return {
    nodes: baseNodes.map((node) => ({
      ...node,
      kind: node.id === id ? node.kind : node.kind
    })),
    edges: baseEdges,
    views: [
      {
        id: 'selection',
        labelEn: 'Selection',
        labelZh: '选择',
        nodeIds: ['router', 'templates'],
        edgeIds: ['router-templates']
      },
      {
        id: 'governance',
        labelEn: 'Governance',
        labelZh: '治理',
        nodeIds: ['kernel', 'templates', 'verification'],
        edgeIds: ['kernel-templates', 'templates-verification', 'verification-kernel']
      }
    ]
  };
}

export function previousNext(id: string) {
  const index = conceptOrder.indexOf(id);
  return {
    previous: index > 0 ? conceptMeta[conceptOrder[index - 1]] : undefined,
    next: index >= 0 && index < conceptOrder.length - 1 ? conceptMeta[conceptOrder[index + 1]] : undefined
  };
}

export const pageHeadings = [
  { id: 'problem', titleEn: 'Problem', titleZh: '问题' },
  { id: 'structure', titleEn: 'Structure', titleZh: '结构' },
  { id: 'implementation', titleEn: 'Implementation', titleZh: '实现' },
  { id: 'when-not-to-use', titleEn: 'When not to use', titleZh: '何时不该用' }
];
