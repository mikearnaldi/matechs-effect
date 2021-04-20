// tracing: off

import "../../Operator"

import type * as Tp from "../../Collections/Immutable/Tuple"
import type * as Ex from "../../Exit"
import { pipe } from "../../Function"
import type * as O from "../../Option"
import * as Q from "../../Queue"
import * as T from "../_internal/effect"
import { chainPar } from "../Stream/chainPar"
import type { Stream } from "../Stream/definitions"
import { filterM } from "../Stream/filterM"
import { flattenExitOption } from "../Stream/flattenExitOption"
import { fromQueueWithShutdown } from "../Stream/fromQueueWithShutdown"
import { map } from "../Stream/map"
import { zipWithIndex } from "../Stream/zipWithIndex"

/**
 * Representation of a grouped stream.
 * This allows to filter which groups will be processed.
 * Once merge is used all groups will be processed in parallel and the results will
 * be merged in arbitrary order.
 */
export class GroupBy<R, E, K, V> {
  constructor(
    readonly grouped: Stream<R, E, Tp.Tuple<[K, Q.Dequeue<Ex.Exit<O.Option<E>, V>>]>>,
    readonly buffer: number
  ) {
    this.merge = this.merge.bind(this)
  }

  merge<A, R1, E1>(
    f: (k: K, stream: Stream<unknown, E, V>) => Stream<R1, E1, A>
  ): Stream<R & R1, E | E1, A> {
    return pipe(
      this.grouped,
      chainPar(
        Number.MAX_SAFE_INTEGER,
        this.buffer
      )(({ tuple: [k, q] }) => f(k, flattenExitOption(fromQueueWithShutdown(q))))
    )
  }
}

/**
 * Only consider the first n groups found in the stream.
 */
export function first_<R, E, K, V>(
  self: GroupBy<R, E, K, V>,
  n: number
): GroupBy<R, E, K, V> {
  const g1 = pipe(
    self.grouped,
    zipWithIndex,
    filterM((elem) => {
      const {
        tuple: [
          {
            tuple: [, q]
          },
          i
        ]
      } = elem

      if (i < n) {
        return T.as_(T.succeed(elem), true)
      } else {
        return T.as_(Q.shutdown(q), false)
      }
    }),
    map((_) => _.get(0))
  )

  return new GroupBy(g1, self.buffer)
}

/**
 * Only consider the first n groups found in the stream.
 */
export function first(n: number) {
  return <R, E, K, V>(self: GroupBy<R, E, K, V>) => first_(self, n)
}

/**
 * Filter the groups to be processed.
 */
export function filter_<R, E, K, V>(
  self: GroupBy<R, E, K, V>,
  f: (k: K) => boolean
): GroupBy<R, E, K, V> {
  const g1 = pipe(
    self.grouped,
    filterM((elem) => {
      const {
        tuple: [k, q]
      } = elem

      if (f(k)) {
        return T.as_(T.succeed(elem), true)
      } else {
        return T.as_(Q.shutdown(q), false)
      }
    })
  )

  return new GroupBy(g1, self.buffer)
}

/**
 * Filter the groups to be processed.
 */
export function filter<R, E, K, V>(f: (k: K) => boolean) {
  return (self: GroupBy<R, E, K, V>) => filter_(self, f)
}
