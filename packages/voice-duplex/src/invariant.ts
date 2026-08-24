/** Package invariant companion. @module @wayneyu430227/dsh-voice-duplex/invariant */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
export const name = 'voice-duplex-invariant'
export const inject = ['invariants']
/** No runtime invariant: one private provider session owns each socket and timer. */
const install: InvariantInstaller = () => {}
/** Register invariant ownership. @param ctx - runtime context. @returns disposer. */
export const apply = (ctx: Context): Promise<() => void> => Promise.resolve(ctx.invariants.register('@wayneyu430227/dsh-voice-duplex', install))
