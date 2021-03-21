// tracing: off

import type { Associative } from "../Associative"

/**
 * The `Commutative[A]` type class describes a commutative binary operator
 * for a type `A`. For example, addition for integers.
 */
export interface Commutative<A> extends Associative<A> {
  readonly _Commutative: "Commutative"

  readonly commute: (x: A, y: A) => A
}
