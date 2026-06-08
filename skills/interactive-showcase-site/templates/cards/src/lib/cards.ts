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

export const hero = {
  eyebrowEn: 'HOLOGRAPHIC COLLECTIBLE CARDS',
  eyebrowZh: 'HOLOGRAPHIC 收藏卡片',
  titleEn: 'A premium set of discrete ideas',
  titleZh: '把一组离散对象做成有质感的收藏卡',
  leadEn:
    'Use this template for a peer collection of features, plans, tools, or agents. The default glint stays restrained and token-built.',
  leadZh:
    '当你需要展示一组平级的功能、方案、工具或 agent 时，使用这个模板。默认 glint 克制且完全由 token 构成。'
};

export const cards: Card[] = [
  {
    titleEn: 'Signal',
    titleZh: '信号',
    subtitleEn: 'The item that tells readers what matters first.',
    subtitleZh: '先告诉读者最值得关注的对象。',
    icon: '01',
    variant: 'featured',
    chips: [
      { labelEn: 'Primary', labelZh: '主推', tone: 'clay' },
      { labelEn: 'Fast read', labelZh: '快速理解', tone: 'info' }
    ]
  },
  {
    titleEn: 'Texture',
    titleZh: '质感',
    subtitleEn: 'A restrained sheen that moves under the pointer.',
    subtitleZh: '指针经过时出现克制的纸面光泽。',
    icon: '02',
    variant: 'gold',
    chips: [
      { labelEn: 'Glint', labelZh: '微光', tone: 'olive' }
    ]
  },
  {
    titleEn: 'Choice',
    titleZh: '选择',
    subtitleEn: 'Each card can stand alone as a focused decision.',
    subtitleZh: '每张卡都能作为一个独立选择被理解。',
    icon: '03',
    chips: [
      { labelEn: 'Focusable', labelZh: '可聚焦', tone: 'muted' }
    ]
  },
  {
    titleEn: 'Calm',
    titleZh: '克制',
    subtitleEn: 'Reduced motion falls back to flat token cards.',
    subtitleZh: '减少动态时回退为平面 token 卡片。',
    icon: '04',
    chips: [
      { labelEn: 'Accessible', labelZh: '可访问', tone: 'info' }
    ]
  }
];
