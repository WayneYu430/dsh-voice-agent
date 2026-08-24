# `@wayneyu430227/dsh-voice-app`

English | [中文](README.zh.md)

Patch-layer bundle for the `voice` profile. It layers over `dsh-base` and `dsh-web-app`, then mounts the provider-neutral voice seam, ByteDance Duplex provider, ordinary text-Agent consumer, dedicated browser WebSocket, and microphone/playback client surface. Starting a Voice conversation creates a fresh ordinary, ungrouped source Session at the current Workspace or Session directory and attaches the provider transport to it; keeping that source outside Workspace membership prevents standard blank-Session reuse. Each accepted delegation creates an independent ordinary task Session, linked from a compact card while root-owned audio continues across navigation. A plugin-owned browser history index exposes saved Voice Sessions from the sidebar without Host or Workspace-specific metadata. Configure the Duplex access key through the `DUPLEX_API_KEY` credential reference.

## Model Experience

### Voice profile composition

#### What the model sees

Voice-initiated work reaches a fresh task Agent only as an accepted `realtime_delegation` envelope and exact-id updates. That task Agent alone receives the scoped `send_voice_message` backend tool for `STATUS` and `COMPLETE`; the bridge creates the target directly, so no project-listing tool is added. The Duplex frontend Agent owns the spoken conversation and sees exactly its three orchestration tools.

#### Token effect

Accepted delegation text, ordinary task work, and backend reporting calls consume text-model tokens; Duplex separately spends provider tokens on the voice conversation and task summaries.

#### KV Cache effect

Only accepted commands extend the independent task Agent's history; the Voice Session transcript and frontend conversation do not alter its request prefix.

## Known Limitations and Deferred Work

- The shipped first provider is Duplex; the service seam is provider-neutral so Realtime/Live providers can be added without changing the assistant consumer.
- Raw audio and provider conversation state remain process-local; completed or interrupted utterance text and task links are durable.
- The filtered Voice history index is browser-local; clearing site data does not delete the underlying Sessions.
- The browser client surface targets the dsh Web UI: it is emitted by the copied dsh client tsdown preset and loads through the dsh web runtime's `window.__ModuleLoader__` contract. The server-side packages are transport-agnostic, but the microphone/playback UI is not a standalone browser plugin.
