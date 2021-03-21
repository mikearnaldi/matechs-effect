// tracing: off

import type { Ordering } from "../../Ordering"
import type { Bounded } from "./definition"

/**
 * Creates Bounded[A] from equals & compare functions
 */
export function makeBounded<A>(
  compare: (x: A, y: A) => Ordering,
  top: A,
  bottom: A
): Bounded<A> {
  return {
    compare,
    bottom,
    top
  }
}
