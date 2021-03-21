// tracing: off

import { instance } from "../../Prelude"
import type { Associative } from "./definition"

export function makeAssociative<A>(f: (x: A, y: A) => A): Associative<A> {
  return instance({
    combine: f
  })
}

export * from "./definition"
