// tracing: off

import type { Ord } from "@effect-ts/system/Ord"
import { makeOrd } from "@effect-ts/system/Ord"

import { Associative as OrderingAssociative } from "../../Ordering"
import type { Associative } from "../../Structure/Associative"
import { makeAssociative } from "../../Structure/Associative/makeAssociative"
import type { Identity } from "../../Structure/Identity"
import { makeIdentity } from "../../Structure/Identity/makeIdentity"

/**
 * Returns a `Associative` such that:
 *
 * - its `combine(ord2)(ord1)` operation will order first by `ord1`, and then by `ord2`
 */
export function getAssociative<A = never>(): Associative<Ord<A>> {
  return makeAssociative((x, y) =>
    makeOrd((a, b) => OrderingAssociative.combine(x.compare(a, b), y.compare(a, b)))
  )
}

/**
 * Returns a `Identity` such that:
 *
 * - its `combine(ord2)(ord1)` operation will order first by `ord1`, and then by `ord2`
 * - its `empty` value is an `Ord` that always considers compared elements equal
 */
export function getIdentity<A = never>(): Identity<Ord<A>> {
  return makeIdentity(
    makeOrd(() => 0),
    getAssociative<A>().combine
  )
}
