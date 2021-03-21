// tracing: off

import type { Identity } from "../Identity"

export interface Inverse<A> extends Identity<A> {
  /**
   * Returns a right inverse for the given `A` value, such that when
   * the value is combined with the inverse (on the right hand side),
   * the identity element is returned.
   */
  readonly inverse: (x: A, y: A) => A
}
