import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { VoiceClientSnapshot } from './voice-controller.ts'
import css from './VoiceControl.module.css'

/** Business callbacks and the root-owned transport snapshot. */
export interface VoiceControlInjected {
  hooks: {
    voice: { getSnapshot(): VoiceClientSnapshot; subscribe(listener: () => void): () => void }
  }
  /** Start a fresh Voice conversation located from the current Session. */
  readonly startVoice: (sourceSessionId: SessionId) => Promise<void>
  readonly retryVoice: () => Promise<void>
  readonly stopVoice: () => Promise<void>
}

export type VoiceControlProps =
  PropsRuntime<'conversation.input.right'> & InjectFace<VoiceControlInjected> & PropsLocale<'voice'>

/** Start a fresh Voice Session from this Session's location or control the active connection. */
export function VoiceControl({
  sessionId, useVoice, startVoice, retryVoice, stopVoice, t,
}: VoiceControlProps) {
  const state = useVoice(snapshot => snapshot.state)
  const activeSessionId = useVoice(snapshot => snapshot.sessionId)

  const toggle = async (): Promise<void> => {
    if (state === 'error' && activeSessionId !== undefined) {
      try { await retryVoice() } catch { /* controller owns the visible error state */ }
      return
    }
    if (state !== 'off' && state !== 'error') {
      await stopVoice()
      return
    }
    try {
      await startVoice(sessionId)
    } catch { /* controller owns the visible error state */ }
  }

  const label = state === 'off'
    ? t('control.start')
    : state === 'error'
      ? t('control.retry')
      : t('control.stop')
  return (
    <button
      type="button"
      className={`${css.button} ${state !== 'off' ? css.active : ''}`}
      aria-label={label}
      title={label}
      data-state={state}
      onClick={() => { void toggle() }}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <rect x="5" y="2" width="6" height="8" rx="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2M5.5 14h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  )
}
