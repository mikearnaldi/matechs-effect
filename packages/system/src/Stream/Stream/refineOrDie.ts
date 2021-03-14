// tracing: off

import { identity } from "../../Function"
import type * as O from "../../Option"
import type { Stream } from "./definitions"
import { refineOrDieWith } from "./refineOrDieWith"

/**
 * Keeps some of the errors, and terminates the fiber with the rest
 */
export function refineOrDie_<R, E, E1, O>(
  self: Stream<R, E, O>,
  pf: (e: E) => O.Option<E1>
): Stream<R, E1, O> {
  return refineOrDieWith(pf)(identity)(self)
}

/**
 * Keeps some of the errors, and terminates the fiber with the rest
 */
export function refineOrDie<E, E1>(pf: (e: E) => O.Option<E1>) {
  return <R, O>(self: Stream<R, E, O>) => refineOrDie_(self, pf)
}
