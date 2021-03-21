// tracing: off

import { instance } from "../../Prelude"
import type { Commutative } from "./definition"

export function makeCommutative<A>(f: (l: A, r: A) => A): Commutative<A> {
  return instance<Commutative<A>>({
    combine: f,
    commute: (x, y) => f(y, x)
  })
}
