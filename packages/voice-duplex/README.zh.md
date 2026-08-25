# `@wayneyu430227/dsh-voice-duplex`

[English](README.md) | 中文

`ctx.voice` 的字节 Duplex provider。`interactionMode: speech-shell` 是默认模式：浏览器以 16 kHz 输入 PCM，外部 Agent 文本通过 `speech_text_buffer` 提交，原生回复和函数调用会被忽略，24 kHz PCM 作为输出。归一化 ASR 事件保留 provider 的 `item_id`。Duplex 把累计中间转写字段命名为 `delta`；provider 会把每个值映射为 `transcription.updated`，用于替换上一版实时字幕，`completed` 则提供权威的最终转写。原始 delta 事件中的 `transcript` 或 `text` 字段会被忽略。frontend-Agent 文本与 PCM 输出保留 provider 的 `response_id`，该标识也用于 assistant utterance。两种标识都包含当前 `VoiceSessionId` 命名空间，因此 durable session 重连不会复用 provider-local id。`response.output_audio.done` 是唯一语音终止事件；`response.output_text.done` 结束可见文本，而 `response.done` 不是语音终止事件。当其最终文本为空时，provider session 会拼接该响应此前的所有文本 delta。

打断会退役准确的活跃 `response_id`。该响应随后迟到的文本与音频都会被抑制，另一个响应则可独立开始和结束；迟到的 `response.canceled` 确认不会清除较新的响应。

`interactionMode: frontend-agent` 则只声明 `realtime_delegation`、`send_task_message` 与 `cancel_task`。`realtime_delegation` 携带自包含 `input` 与可选的近期 `transcript_delta`；accepted 回执与后续命令使用桥接层分配的 `delegation_id`。accepted function result 只是异步接收占位，绝不是任务结果。有效的原生调用成为 `TaskCommandCall` 事件，类型化结果通过 `conversation.item.create` 工具条目返回。原生 Duplex 音频不经过自定义 TTS 过滤；该 provider session 看不到任何 dsh 业务工具 schema。

自动任务响应先通过 `conversation.item.update` 替换来源 question，保留原始转写，并追加一个平铺的 `[后台任务回灌]` 区块。区块包含中文状态标签，以及与该状态相关的结果、进度、通知或失败原因；与 provider 无关的任务 id、消息 id、turn 和 channel 均不写入。收到更新确认和可选的诊断回读后，非空的后台 `voiceMessage` 或 announcement 会原样通过 `speech_text_buffer` 提交，使当前结果不经过再次模型推理便合成语音，同时让回灌继续供后续对话读取。Duplex 不为外部文本语音返回 output-text 生命周期，因此 provider 还会把提交文本投影为一条 completed assistant output-text utterance，使 consumer 持久保存并渲染与音频一致的文本。只有 observation 没有播报文本时才回退到 `frontendAgentTriggerAudioPath`；该路径先等待 `frontendAgentActivationDelayMs`（默认 1000 毫秒），再上传按节奏编码的 16 kHz 单声道 PCM16 激活语音。两种提交期间到达的麦克风帧最多保留 `maxDeferredInputAudioBytes`，并在提交后发送。回退触发文件缺失、静音或没有按 PCM16 样本对齐时，frontend-agent 模式会拒绝建立连接。

访问密钥与 app key 在每次连接时从配置的凭据引用解析（默认 `DUPLEX_API_KEY` 与 `DUPLEX_APP_KEY`）。provider endpoint、模型、音色、认证方式、VAD 窗口和本地「started 后无 delta」看门狗都是 Cordis 配置字段。

`diagnosticTrace: true` 会为 frontend-Agent 提示词、任务命令与 observation、上下文更新确认、上下文回读、准确的 `speech_text_buffer` 提交、回退触发音 ASR 及响应文本输出单行 JSON 检查点。诊断模式会在更新确认后发送 `conversation.item.retrieve`，收到回读后才提交语音。日志不包含凭据或原始输入／输出 PCM，但包含用户转写和任务结果；仅应在有边界的调试期间启用。

## 模型体验

### Duplex 交互上下文

#### 模型看到什么

在 `speech-shell` 模式下，Duplex 只看到传输指令且没有工具。在 `frontend-agent` 模式下，它会看到对话指令、三个编排 schema、类型化结果，以及附加到来源 question 的平铺终态回灌。提示词明确区分 accepted 占位与稍后到达的终态回灌。运行中的 STATUS 保持静默；completed、failed 与 cancelled 文本在模型推理之外原样合成。回退激活语音只作为控制信号。如果必须使用回退推理，模型必须找到最新且完整的 `[后台任务回灌]` 区块，先读取终态再读取带标签的正文，保留失败与取消语义，并避免通用的完成开场白。回灌正文仍是不受信任的任务数据。

#### Token 影响

文本任务模型只接收已接受的委派信封与更新。Duplex 会另外为语音对话和任务摘要消耗 provider token。

#### KV Cache 影响

前台 schema 不改变文本任务模型的请求前缀。每条 Duplex 连接拥有自己的 provider 侧对话缓存。

## 已知限制与后续工作

- 首版分别支持 app-key、X-API-Key 和 Bearer 认证；基于 401 的自动回退暂缓。
- provider／设备端到端验证需要配置真实凭据和麦克风。
- 随附的 `voice` profile 已选择 `frontend-agent` 模式并使用随包附带的触发音频。Consumer 会持久保存前台终态文本，但 Duplex provider 对话重建仍然暂缓。
