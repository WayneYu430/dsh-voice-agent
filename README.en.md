# dsh-voice-agent

English | [中文](README.md)

Talk to your dsh coding Agent the way you talk to ChatGPT Advanced Voice — except it doesn't just chat, it actually gets the work done.

Say a request out loud and dsh answers you in real time. When the request is real work (inspect code, run a build, edit a file…), the voice frontend hands it to an independent background Agent; keep talking or switch to another session while it runs, and when it finishes, the result is spoken back to you instead of made up.

## Interaction

- **Full-duplex, real-time**: ByteDance Duplex makes it feel like talking to a person — listen and speak at once, interrupt, or correct yourself mid-sentence.
- **Conversational delegation**: the frontend exposes exactly three orchestration tools — `realtime_delegation` (turn "check this for me" into a real background task), `send_task_message` (add or correct requirements), and `cancel_task`.
- **Asynchronous result backfill**: the task runs in an independent Session; progress (STATUS) and the final result (COMPLETE) flow back into the voice conversation, and the frontend reports the facts.
- **Uninterrupted flow**: switching browser tabs or reconnecting never stops the live voice session or the task behind it.

## Install

```sh
dsh plugin --profile web add @wayneyu430227/dsh-voice-agent
```

The `dsh` command comes from `npm install -g @deepseek-ai/dsh`. Launch web (the voice surface loads with it):

```sh
dsh web
```

## Credentials

The Duplex provider reads two credential references from the environment:

- `DUPLEX_API_KEY` — ByteDance Volcengine access key.
- `DUPLEX_APP_KEY` — the matching app key.

Set both before starting a voice conversation; the provider session fails the handshake without them.

## Limitations

- The browser microphone and playback surface targets the dsh Web UI: it is emitted by the copied dsh client tsdown preset and loads through the dsh web runtime's `window.__ModuleLoader__` contract, so it is not a framework-agnostic browser plugin.
- Voice Sessions record durable `voice/*` events that are required-on-read; a dsh build without this plugin refuses to load them.
