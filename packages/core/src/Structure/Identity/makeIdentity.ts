// tracing: off

import { instance } from "../../Prelude"
import type { Identity } from "./definition"

/**
 * Creates a new `Identity`
 */
export function makeIdentity<A>(identity: A, op: (x: A, y: A) => A): Identity<A> {
  return instance({
    combine: op,
    identity
  })
}

export * from "./definition"
