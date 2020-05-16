import { traverseWithIndex_ } from "../Record/traverseWithIndex_"
import type { Effect, AsyncRE } from "../Support/Common/effect"

import { parEffect } from "./parEffect"

export const parTraverseRecordWithIndex_ = traverseWithIndex_(parEffect)

export const parTraverseRecordWithIndex: <A, S, R, E, B>(
  f: (k: string, a: A) => Effect<S, R, E, B>
) => (ta: Record<string, A>) => AsyncRE<R, E, Record<string, B>> = (f) => (ta) =>
  parTraverseRecordWithIndex_(ta, f)
