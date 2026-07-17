---
name: brief
description: Decision-block report format that compresses agent replies for batch/async review. Use ONLY when the user explicitly invokes it (e.g. /brief) or a dispatch/automation template explicitly requires it. Never self-trigger from conversational context, and never apply during interactive discussion.
---

# Brief — 裁决块汇报格式 / Decision-Block Reports

为「异步批阅」优化的汇报契约：读者不在场，稍后会集中处理大量 agent 回复，因此每条回复必须 30 秒内可裁决。
A report contract optimized for async batch review: the reader is away and will triage many agent replies at once, so each reply must be decidable in 30 seconds.

## 触发纪律（最重要的一节）

- 仅在两种情况下生效：**用户显式调用本 skill**（如 `/brief`）；或**派发提示词 / 自动化模板明确写了按 brief 汇报**。
- 交互式讨论中**永不**主动启用，也不因「这一轮看起来像任务汇报」而推断启用——推断启用本身就是违约。
- 在会话中被显式调用后，对该会话后续的任务完结汇报持续生效，直到用户要求关闭。

## 格式

每条完结汇报以**裁决块**开头：

1. **结论**：一句话说清做了什么 / 发生了什么。
2. **需要你**：三选一——`无需动作` / `一个裁决：A 或 B（建议 X，理由一句话）` / `缺一个输入：___`。每次汇报最多一个待裁决项；多个非紧急问题攒起来批量问。
3. **风险与未验证**：列出未验证的假设、未跑的路径、未复核的数字；没有就写 `无`。

裁决块之后再放详情（过程、diff、数据）；长内容落盘到文件并给出路径。

## 分层不是删减

- 压缩的是「读者被迫阅读的量」，不是「可获取的信息量」：全部细节必须可回查（落盘 / git / 日志），读者随时抽查。
- **可以省略细节，不可以省略不确定性**——把问题藏进被省略的部分是最严重的违约。抽查发现裁决块与事实不符时，该工作流的产出应降级为逐条复核。
