# Interactive Showcase Site

> 把 README、SDK、文档目录、时间线、卡片集合或概念图谱路由到合适的中英双语 Astro + React 交互模板。

[English](README.md) · [在线预览 ↗](https://baozzz1.github.io/skills/)

## 立意

`interactive-showcase-site` 是一个 Agent Skill，用来把技术材料转换成可构建、可部署的交互式站点。它现在是一个按场景路由的模板库：单页 explainer、sticky-stage scrollytelling、holographic 收藏卡片，以及多页面 knowledge-wiki 图谱站。

它的目标不是做通用文档门户，而是做一份聚焦的、带编辑感的技术 artifact，并根据读者应该如何移动来选择交互模型：扫读一个系统、跟随一次演进、浏览一组高质感对象，或探索一组互相关联的概念。

所有模板共享同一套视觉内核：温暖纸张底色、clay/coral 强调色、serif 编辑层级、自托管 Newsreader / IBM Plex Sans / JetBrains Mono、token 化 light/dark theme、中英双语切换、reduced-motion 支持，以及避免通用 AI slop 视觉套路。

## 安装

> 两条命令都接受 GitHub 简写 `baozzz1/skills` 或完整 URL `https://github.com/baozzz1/skills`。

通过 Claude Code plugin marketplace 安装：

```shell
/plugin marketplace add baozzz1/skills
/plugin install interactive-showcase-site@interactive-showcase-site-skills
```

在 Claude Code 中调用：

```shell
/interactive-showcase-site:interactive-showcase-site
```

通过 Agent Skills CLI 安装：

```shell
npx skills add baozzz1/skills --skill interactive-showcase-site
```

全局安装：

```shell
npx skills add baozzz1/skills --skill interactive-showcase-site -g
```
