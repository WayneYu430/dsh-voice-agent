# dsh-voice-plugin

English | [中文](README.md)

A conversational voice frontend Agent for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`).

It speaks with you over ByteDance Duplex, delegates your spoken requests to background dsh tasks, and reports their asynchronous results back by voice. The frontend Agent exposes exactly three orchestration tools (`realtime_delegation`, `send_task_message`, `cancel_task`); the text Agent runs each accepted delegation in an independent Session and reports progress through the scoped `send_voice_message` tool.

## Install

```sh
dsh plugin add @wayneyu430227/dsh-voice-app
```

Or into a named profile:

```sh
dsh plugin --profile <name> add @wayneyu430227/dsh-voice-app
```

## Credentials

The Duplex provider reads two credential references from the environment:

- `DUPLEX_API_KEY` — ByteDance Volcengine access key.
- `DUPLEX_APP_KEY` — the matching app key.

Set both before starting a voice conversation; the provider session fails the handshake without them.

## Limitations

- The browser microphone and playback surface targets the dsh Web UI: it is emitted by the copied dsh client tsdown preset and loads through the dsh web runtime's `window.__ModuleLoader__` contract, so it is not a framework-agnostic browser plugin.
- Voice Sessions record durable `voice/*` events that are required-on-read; a dsh build without this plugin refuses to load them.
