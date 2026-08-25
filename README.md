# dsh-voice-agent

[English](README.en.md) | 中文

像 ChatGPT 高级语音那样，用自然的语音和你的 dsh 编码 Agent 对话——而且不止是聊天，它能真正把活干完。

你开口说一句需求，dsh 立刻用语音回应你。当你要的是一份「任务」（查代码、跑构建、改文件……），语音前端会把它派给一个独立的后台 Agent 去执行；你随时可以继续说话、切走看别的会话，等任务做完，它再用语音把结果念给你听，而不是凭空编一个结论。

## 交互

- **全双工实时对话**：基于 ByteDance Duplex，像和人说话一样自然，边说边听、随时打断、随时插话纠正。
- **对话式派活**：前端只暴露三个编排工具——`realtime_delegation`（把「帮我查一下 xxx」变成真正的后台任务）、`send_task_message`（补充要求 / 纠正方向）、`cancel_task`（取消）。
- **异步结果回灌**：任务跑在独立 Session 里，进度（STATUS）和最终结果（COMPLETE）会回灌进语音对话，前端按事实播报。
- **不中断的体验**：浏览器切走、断线重连，正在跑的语音会话和后台任务都不会停。

## 安装

```sh
dsh plugin add @wayneyu430227/dsh-voice-app
```

或安装到指定 profile：

```sh
dsh plugin --profile <名称> add @wayneyu430227/dsh-voice-app
```

## 凭据

Duplex provider 从环境读取两个凭据引用：

- `DUPLEX_API_KEY` —— ByteDance 火山引擎 access key。
- `DUPLEX_APP_KEY` —— 对应的 app key。

开始语音对话前需设置两者；缺少时 provider 会话握手失败。

## 限制

- 浏览器麦克风与播放界面面向 dsh Web UI：它由复制而来的 dsh client tsdown 预设构建，并通过 dsh web 运行时的 `window.__ModuleLoader__` 契约加载，因此不是框架无关的浏览器插件。
- Voice Session 记录按「读取时必需」处理的持久 `voice/*` 事件；不带本插件的 dsh 构建加载它们会被拒绝。
