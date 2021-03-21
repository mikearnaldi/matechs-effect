// tracing: off

import type { Ord } from "../Ord"

export interface Bounded<A> extends Ord<A> {
  readonly top: A
  readonly bottom: A
}
