import { useEffect, useState } from 'react'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { VoiceClientSnapshot } from './voice-controller.ts'
import type { VoiceHistorySnapshot } from './voice-history.ts'
import css from './VoiceHistoryAction.module.css'

/** History state and navigation owned by the Voice UI plugin. */
export interface VoiceHistoryActionInjected {
  hooks: {
    voice: { getSnapshot(): VoiceClientSnapshot; subscribe(listener: () => void): () => void }
    voiceHistory: { getSnapshot(): VoiceHistorySnapshot; subscribe(listener: () => void): () => void }
  }
  readonly openSession: (id: SessionId) => void
}

export type VoiceHistoryActionProps =
  PropsRuntime<'sidebar.footer.action'> & InjectFace<VoiceHistoryActionInjected> & PropsLocale<'voice'>

/** Render the plugin-owned Voice history entry and its Session navigation panel. */
export function VoiceHistoryAction({
  wide, useSessions, useVoice, useVoiceHistory, openSession, t,
}: VoiceHistoryActionProps) {
  const [open, setOpen] = useState(false)
  const sessions = useSessions(state => state)
  const entries = useVoiceHistory(state => state.entries)
  const activeSessionId = useVoice(state => state.sessionId)
  const available = entries.flatMap((entry) => {
    const session = sessions.byId[entry.sessionId]
    return session === undefined ? [] : [{ entry, session }]
  })

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent): void => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('keydown', close) }
  }, [open])

  return (
    <>
      <button
        type="button"
        className={css.trigger}
        aria-label={t('history.open')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path d="M3 8a5 5 0 1 0 1.5-3.55M3 2.7v2.8h2.8M8 5.2V8l2 1.2" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {wide && <span>{t('history.label')}</span>}
      </button>
      {open && (
        <section className={css.panel} role="dialog" aria-label={t('history.title')}>
          <header className={css.header}>
            <strong>{t('history.title')}</strong>
            <button type="button" className={css.close} aria-label={t('history.close')} onClick={() => { setOpen(false) }}>×</button>
          </header>
          <div className={css.list}>
            {available.length === 0 && <p className={css.empty}>{t('history.empty')}</p>}
            {available.map(({ entry, session }) => (
              <button
                key={entry.sessionId}
                type="button"
                className={css.row}
                data-active={entry.sessionId === activeSessionId || undefined}
                onClick={() => {
                  openSession(entry.sessionId)
                  setOpen(false)
                }}
              >
                <span className={css.wave} aria-hidden><i /><i /><i /></span>
                <span className={css.rowText}>
                  <span className={css.title}>{session.displayTitle}</span>
                  <span className={css.meta}>{entry.sessionId === activeSessionId ? t('history.active') : t('history.saved')}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
