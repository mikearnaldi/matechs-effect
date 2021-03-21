// tracing: off

import { instance } from "../../Prelude"
import type { Inverse } from "./index"

export function makeInverse<A>(
  identity: A,
  combine: (x: A, y: A) => A,
  inverse: (x: A, y: A) => A
): Inverse<A> {
  return instance({
    combine,
    identity,
    inverse
  })
}
