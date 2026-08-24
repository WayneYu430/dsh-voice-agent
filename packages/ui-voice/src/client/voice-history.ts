import {
  createSnapshotStore, type SessionId, type SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'

const STORAGE_KEY = 'dsh.voice.history.v1'

/** One locally indexed durable Voice Session. */
export interface VoiceHistoryEntry {
  readonly sessionId: SessionId
  readonly lastActiveAt: number
}

/** Browser-persistent Voice Session index. */
export interface VoiceHistorySnapshot {
  readonly entries: readonly VoiceHistoryEntry[]
}

interface StoredVoiceHistory {
  readonly version: 1
  readonly entries: readonly VoiceHistoryEntry[]
}

function parseEntry(input: unknown): VoiceHistoryEntry | undefined {
  if (typeof input !== 'object' || input === null) return undefined
  const value = input as Record<string, unknown>
  if (typeof value.sessionId !== 'string' || value.sessionId === '') return undefined
  if (typeof value.lastActiveAt !== 'number' || !Number.isFinite(value.lastActiveAt) || value.lastActiveAt < 0) {
    return undefined
  }
  return { sessionId: value.sessionId as SessionId, lastActiveAt: value.lastActiveAt }
}

function readHistory(storage: Storage | undefined): VoiceHistorySnapshot {
  if (storage === undefined) return { entries: [] }
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return { entries: [] }
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return { entries: [] }
    const value = parsed as Record<string, unknown>
    if (value.version !== 1 || !Array.isArray(value.entries)) return { entries: [] }
    const entries: VoiceHistoryEntry[] = []
    const seen = new Set<SessionId>()
    for (const candidate of value.entries) {
      const entry = parseEntry(candidate)
      if (entry === undefined || seen.has(entry.sessionId)) continue
      seen.add(entry.sessionId)
      entries.push(entry)
    }
    entries.sort((left, right) => right.lastActiveAt - left.lastActiveAt)
    return { entries }
  } catch (error: unknown) {
    console.error('voice history rehydration failed:', error)
    return { entries: [] }
  }
}

/** Own the local history index without adding Voice metadata to Host session projections. */
export class VoiceHistoryStore {
  readonly snapshot: SnapshotStore<VoiceHistorySnapshot>
  private readonly storage: Storage | undefined
  private readonly unsubscribe: () => void

  constructor(storage: Storage | undefined = typeof localStorage === 'undefined' ? undefined : localStorage) {
    this.storage = storage
    this.snapshot = createSnapshotStore(readHistory(storage))
    this.unsubscribe = this.snapshot.subscribe(() => { this.persist() })
  }

  /** Move one successfully opened Voice Session to the front of the index. */
  record(sessionId: SessionId, lastActiveAt = Date.now()): void {
    this.snapshot.set({
      entries: [
        { sessionId, lastActiveAt },
        ...this.snapshot.getSnapshot().entries.filter(entry => entry.sessionId !== sessionId),
      ],
    })
  }

  /** Stop persistence notifications. */
  dispose(): void {
    this.unsubscribe()
  }

  private persist(): void {
    if (this.storage === undefined) return
    const value: StoredVoiceHistory = { version: 1, entries: this.snapshot.getSnapshot().entries }
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch (error: unknown) {
      console.error('voice history persistence failed:', error)
    }
  }
}
