# dsh-voice-plugin

一个面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的对话式语音前端 Agent。

它通过 ByteDance Duplex 与你对话，把你的语音请求委派给后台 dsh 任务，并用语音回报异步结果。前端 Agent 只暴露三个编排工具（`realtime_delegation`、`send_task_message`、`cancel_task`）；文本 Agent 在独立 Session 中执行每个已接受的委派，并通过作用域内的 `send_voice_message` 工具回报进度。

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
