# `@wayneyu430227/dsh-voice-agent`

[English](README.md) | 中文

`voice` profile 的 patch-layer bundle。它叠加在 `dsh-base` 和 `dsh-web-app` 之上，挂载与 provider 无关的语音 seam、字节 Duplex provider、普通文本 Agent consumer、专用浏览器 WebSocket 以及麦克风／播放客户端界面。新语音对话会在当前 Workspace 或 Session 目录中创建全新的普通未分组来源 Session，并把 provider transport 挂接到该 Session；来源不加入 Workspace 成员表，以免被标准 blank Session 流程复用。每个已接受委派会新建独立的普通 Task Session，并由紧凑卡片链接，root 持有的音频在跳转期间持续运行。插件自有的浏览器历史索引从侧栏展示已保存的 Voice Session，无需 Host 或 Workspace 专用元数据。通过 `DUPLEX_API_KEY` 凭据引用配置 Duplex 访问密钥。

## 模型体验

### 语音 profile 组合

#### 模型看到什么

语音发起的工作只以已接受的 `realtime_delegation` 信封与准确 id 更新到达全新 Task Agent。只有该 Task Agent 收到作用域内的 `send_voice_message` 后台工具，用于发送 `STATUS` 与 `COMPLETE`；桥接层直接创建目标，因此不增加 project 列举工具。Duplex frontend Agent 拥有语音对话，只看到自身的三个编排工具。

#### Token 影响

已接受的委派文本、普通任务执行与后台回报调用都会消耗文本模型 token；Duplex 另行花费 provider token 处理语音对话和任务摘要。

#### KV Cache 影响

只有已接受的 command 扩展独立 Task Agent 历史；Voice Session 文本与 frontend 对话不改变其请求前缀。

## 已知限制与后续工作

- 随附的首个 provider 是 Duplex；service seam 与 provider 无关，因此后续可增加 Realtime／Live provider 而不修改 assistant consumer。
- 原始音频与 provider 对话状态仍限于当前进程；已完成或打断的 utterance 文本与任务链接会持久保存。
- 筛选后的语音历史索引只属于当前浏览器；清除站点数据不会删除底层 Session。
- 浏览器客户端界面面向 dsh Web UI：它由复制而来的 dsh client tsdown 预设构建，并通过 dsh web 运行时的 `window.__ModuleLoader__` 契约加载。服务端包与传输无关，但麦克风／播放 UI 不是独立浏览器插件。
