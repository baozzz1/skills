/**
 * UI strings — flat dict keyed by language.
 *
 * This bag is for *component-level* labels (copy button, lifecycle controls,
 * theme toggle labels). Section-level prose lives in
 * src/content/sections/{en,zh}/*.mdx and is NEVER mirrored here.
 *
 * When adding a new key, add it for ALL supported languages — the type below
 * makes a missing key a TS error.
 */

export type Lang = 'en' | 'zh';

export type Strings = {
  // CodeBlock
  copy: string;
  copied: string;
  selected: string;
  failed: string;
  copyAria: string;
  // Lifecycle
  play: string;
  pause: string;
  stepsLabel: (n: number) => string;
  // ThemeToggle
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  themeAria: (current: string) => string;
  themeTitle: string;
  // LangToggle
  langLabelEn: string;
  langLabelZh: string;
  langAria: (current: string) => string;
  langTitle: string;
  // SectionNav
  sectionNavAria: string;
  // Section meta
  minRead: (n: number) => string;
  // Mermaid
  mermaidRendering: string;
  mermaidFailedPrefix: string;
  mermaidHint: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    copy: 'Copy',
    copied: 'Copied',
    selected: 'Selected',
    failed: 'Failed',
    copyAria: 'Copy code block',
    play: '▶ Autoplay',
    pause: '⏸ Pause',
    stepsLabel: (n) => `${n} STEPS`,
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeAria: (current) => `Toggle theme — current: ${current}`,
    themeTitle: 'Toggle theme (system / light / dark)',
    langLabelEn: 'EN',
    langLabelZh: '中',
    langAria: (current) => `Toggle language — current: ${current}`,
    langTitle: 'Toggle language (English / 中文)',
    sectionNavAria: 'Section navigation',
    minRead: (n) => `~${n} min read`,
    mermaidRendering: 'Rendering…',
    mermaidFailedPrefix: 'Mermaid render failed: ',
    mermaidHint: 'Click a node in the diagram to see details.'
  },
  zh: {
    copy: '复制',
    copied: '已复制',
    selected: '已选中',
    failed: '失败',
    copyAria: '复制代码块',
    play: '▶ 自动播放',
    pause: '⏸ 暂停自动播放',
    stepsLabel: (n) => `${n} 步`,
    themeSystem: '系统',
    themeLight: '浅色',
    themeDark: '深色',
    themeAria: (current) => `切换主题：当前 ${current}`,
    themeTitle: '切换主题（系统 / 浅色 / 深色）',
    langLabelEn: 'EN',
    langLabelZh: '中',
    langAria: (current) => `切换语言：当前 ${current}`,
    langTitle: '切换语言（English / 中文）',
    sectionNavAria: '章节导航',
    minRead: (n) => `约 ${n} 分钟`,
    mermaidRendering: '渲染中…',
    mermaidFailedPrefix: 'Mermaid 渲染失败：',
    mermaidHint: '点击图中节点查看说明。'
  }
};

export const LANGS: Lang[] = ['en', 'zh'];
export const DEFAULT_LANG: Lang = 'zh';
