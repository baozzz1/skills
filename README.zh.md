# Interactive Showcase Site

> 把 README、SDK 或文档目录变成中英双语的可交互单页讲解站点。

[English](README.md)

![Interactive Showcase Site 预览 — 中文首屏，1920×1080](docs/preview/preview-zh.png)

## 立意

`interactive-showcase-site` 是一个 Agent Skill，用来把项目、SDK、README 或文档目录转换成可构建、可部署的交互式技术讲解站点。

它的目标不是做通用文档门户，而是做一份聚焦的、带编辑感的单页技术 artifact：让读者快速理解一个技术系统是什么、如何工作、主要风险在哪里，以及哪些细节值得继续展开。

视觉语言参考了 Anthropic system prompt 中的 Claude design 方向：温暖的纸张底色、clay/coral 强调色、serif 编辑层级、克制动效、避免通用 AI 渐变、避免 emoji 装饰，也避免常见的 “AI slop” 视觉套路。模板使用 Source Serif 4、IBM Plex Sans、JetBrains Mono，并通过 token 化的 light/dark theme 保持一致性。

交互模型参考了 `ccunpacked.dev` 和 `deep-dive-claude-code.vercel.app` 这类技术 explainer：用 scroll-spy 导航维持方位感，用可点击 Mermaid 图解释结构，用 autoplay lifecycle 面板讲流程，用 tabs 对比实现取舍，用 callout 承载 TL;DR，用可复制代码块降低行动成本。首屏负责项目级 executive summary，下方章节负责 deep dive。

## 安装

通过 Claude Code plugin marketplace 安装：

```shell
/plugin marketplace add <owner>/<repo>
/plugin install interactive-showcase-site@interactive-showcase-site-skills
```

在 Claude Code 中调用：

```shell
/interactive-showcase-site:interactive-showcase-site
```

通过 Agent Skills CLI 安装：

```shell
npx skills add <owner>/<repo> --skill interactive-showcase-site
```

全局安装：

```shell
npx skills add <owner>/<repo> --skill interactive-showcase-site -g
```
