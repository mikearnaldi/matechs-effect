// tracing: off

import { instance } from "../../Prelude"
import type { Closure } from "./definition"

export function makeClosure<A>(f: (x: A, y: A) => A): Closure<A> {
  return instance({
    combine: f
  })
}
