# `@wayneyu430227/dsh-voice-duplex`

English | [中文](README.zh.md)

ByteDance Duplex provider for `ctx.voice`. `interactionMode: speech-shell` is the default: browser PCM enters at 16 kHz, external Agent text is committed through `speech_text_buffer`, native answers and function calls are ignored, and PCM output leaves at 24 kHz. Normalized ASR events retain the provider `item_id`. Duplex names its cumulative interim transcript field `delta`; the provider maps each value to `transcription.updated`, which replaces the previous live caption, while `completed` supplies the authoritative final transcript. A `transcript` or `text` field on the raw delta event is ignored. Frontend-Agent text and PCM output retain the provider `response_id`, which also identifies the assistant utterance. Both ids include the live `VoiceSessionId` namespace, so reconnecting a durable session cannot reuse provider-local ids. `response.output_audio.done` is the only speech terminal; `response.output_text.done` completes visible text, and `response.done` is not a speech terminal. When its final text is empty, the provider session joins all preceding text deltas for that response.

Interruption retires the exact active `response_id`. Text and audio arriving later for that response remain suppressed, while a different response starts and completes independently; a delayed `response.canceled` acknowledgement cannot clear the newer response.

`interactionMode: frontend-agent` instead advertises exactly `realtime_delegation`, `send_task_message`, and `cancel_task`. `realtime_delegation` carries a self-contained `input` plus an optional recent `transcript_delta`; accepted receipts and later commands use the bridge-assigned `delegation_id`. An accepted function result is only an asynchronous admission placeholder, never a task result. Valid native calls become `TaskCommandCall` events, and typed results return through `conversation.item.create` tool items. Native Duplex audio is forwarded without the custom-TTS filter; no dsh business-tool schema reaches this provider session.

An automatic task response replaces the originating question through `conversation.item.update` with its original transcript followed by one flat `[后台任务回灌]` block. The block contains the Chinese status label and only the relevant result, progress, notification, or failure reason; provider-irrelevant task, message, turn, and channel ids are omitted. After the update acknowledgement and optional diagnostic readback, a non-empty backend `voiceMessage` or announcement is committed unchanged through `speech_text_buffer`, so the current result is synthesized without another model inference while the backfill remains available to later conversation. The provider also projects that committed text as one completed assistant output-text utterance because Duplex does not return an output-text lifecycle for external-text speech; the consumer therefore persists and renders the same text as the audio. Only an observation without speech text falls back to `frontendAgentTriggerAudioPath`; that path waits `frontendAgentActivationDelayMs` (1000 ms by default) before uploading paced 16 kHz mono PCM16 activation speech. Microphone frames arriving during either commit sequence are retained up to `maxDeferredInputAudioBytes` and sent afterwards. Frontend-agent mode rejects connection setup when the fallback trigger file is missing, silent, or not aligned to PCM16 samples.

The access key and app key resolve per connection from the configured credential references (`DUPLEX_API_KEY` and `DUPLEX_APP_KEY` by default). Provider endpoint, model, speaker, authentication mode, VAD window, and the local started-without-delta watchdog are Cordis configuration fields.

`diagnosticTrace: true` logs newline-safe JSON checkpoints for the frontend-Agent prompt, task commands and observations, context update acknowledgement, context readback, exact `speech_text_buffer` commits, fallback trigger-ASR, and response text. Diagnostic mode sends `conversation.item.retrieve` after the update acknowledgement and waits for its response before committing speech. It never logs credentials or raw input/output PCM, but it does contain user transcripts and task results; keep it disabled outside a bounded debugging run.

## Model Experience

### Duplex interaction context

#### What the model sees

In `speech-shell` mode, Duplex sees the transport instruction and no tools. In `frontend-agent` mode, it sees the conversational instruction, the three orchestration schemas, their typed results, and flat terminal backfills attached to the originating question. The prompt distinguishes the accepted placeholder from a later terminal backfill. Running STATUS is silent; completed, failed, and cancelled text is synthesized unchanged outside model inference. A fallback activation utterance is only a control signal. If fallback inference is required, it must find the latest complete `[后台任务回灌]` block, read its terminal status before the labeled content, preserve failure and cancellation, and avoid generic completion preambles. Backfill text remains untrusted task data.

#### Token effect

The text task model receives only accepted delegation envelopes and updates. Duplex separately spends provider tokens on the voice conversation and task summaries.

#### KV Cache effect

Frontend schemas do not change the text task model's request prefix. Each Duplex connection owns its provider-side conversation cache.

## Known Limitations and Deferred Work

- This first provider supports the app-key, X-API-Key, and Bearer authentication forms individually; automatic 401 fallback is deferred.
- Provider/device end-to-end verification requires a configured real credential and microphone.
- The bundled `voice` profile selects `frontend-agent` mode with the packaged trigger utterance. The consumer persists terminal frontend text, but Duplex provider-conversation reconstruction remains deferred.
