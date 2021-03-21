// tracing: off

import * as A from "@effect-ts/system/Array"
import { pipe } from "@effect-ts/system/Function"
import type { MutableArray } from "@effect-ts/system/Mutable"
import type { NonEmptyArray } from "@effect-ts/system/NonEmptyArray"
import * as NA from "@effect-ts/system/NonEmptyArray"
import * as L from "@effect-ts/system/Persistent/List"

import type { NonEmptyArrayURI } from "../Modules"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import * as DSL from "../Prelude/DSL"
import type { Equal } from "../Prelude/Equal"
import { makeEqual } from "../Prelude/Equal"
import * as Ord from "../Prelude/Ord"
import type { Show } from "../Prelude/Show"
import { makeAssociative } from "../Structure/Associative"
import type { Identity } from "../Structure/Identity"

export * from "@effect-ts/system/NonEmptyArray"

/**
 * `ForEachWithIndex`'s `forEachWithIndexF` function
 */
export const forEachWithIndexF = P.implementForEachWithIndexF<
  [URI<NonEmptyArrayURI>]
>()((_) => (G) => (f) => (x) =>
  pipe(
    x,
    A.reduceWithIndex(DSL.succeedF(G)(L.empty()), (k, b, a) =>
      pipe(
        b,
        G.both(f(k, a as any)),
        G.map(([x, y]) => L.append_(x, y))
      )
    ),
    G.map(L.toArray)
  ) as any
)

/**
 * `ForEach`'s `forEachF` function
 */
export const forEachF = P.implementForEachF<
  [URI<NonEmptyArrayURI>]
>()((_) => (G) => (f) => forEachWithIndexF(G)((_, a) => f(a)))

/**
 * Test if a value is a member of an array. Takes a `Equal<A>` as a single
 * argument which returns the function to use to search for a value of type `A` in
 * an array of type `NonEmptyArray<A>`.
 */
export function elem<A>(E: Equal<A>): (a: A) => (as: NonEmptyArray<A>) => boolean {
  const elemE = elem_(E)
  return (a) => (as) => elemE(as, a)
}

/**
 * Test if a value is a member of an array. Takes a `Equal<A>` as a single
 * argument which returns the function to use to search for a value of type `A` in
 * an array of type `NonEmptyArray<A>`.
 */
export function elem_<A>(E: Equal<A>): (as: NonEmptyArray<A>, a: A) => boolean {
  return (as, a) => {
    const predicate = (element: A) => E.equals(element, a)
    let i = 0
    const len = as.length
    for (; i < len; i++) {
      if (predicate(as[i]!)) {
        return true
      }
    }
    return false
  }
}

/**
 * Creates an array of array values not included in the other given array using a `Equal` for equality
 * comparisons. The order and references of result values are determined by the first array.
 */
export function difference_<A>(
  E: Equal<A>
): (xs: NonEmptyArray<A>, ys: NonEmptyArray<A>) => A.Array<A> {
  const elemE = elem_(E)
  return (xs, ys) => xs.filter((a) => !elemE(ys, a))
}

/**
 * Creates an array of array values not included in the other given array using a `Equal` for equality
 * comparisons. The order and references of result values are determined by the first array.
 */
export function difference<A>(
  E: Equal<A>
): (ys: NonEmptyArray<A>) => (xs: NonEmptyArray<A>) => A.Array<A> {
  const elemE = elem_(E)
  return (ys) => (xs) => xs.filter((a) => !elemE(ys, a))
}

/**
 * Derives an `Equal` over the `NonEmptyArray` of a given element type from the `Equal` of that type. The derived `Equal` defines two
 * arrays as equal if all elements of both arrays are compared equal pairwise with the given `E`. In case of arrays of
 * different lengths, the result is non equality.
 */
export function getEqual<A>(E: Equal<A>): Equal<NonEmptyArray<A>> {
  return makeEqual(
    (xs, ys) =>
      xs === ys || (xs.length === ys.length && xs.every((x, i) => E.equals(x, ys[i]!)))
  )
}

/**
 * Returns a `Ord` for `NonEmptyArray<A>` given `Ord<A>`
 */
export function getOrd<A>(O: Ord.Ord<A>): Ord.Ord<NonEmptyArray<A>> {
  return Ord.makeOrd((a, b) => {
    const aLen = a.length
    const bLen = b.length
    const len = Math.min(aLen, bLen)
    for (let i = 0; i < len; i++) {
      const ordering = O.compare(a[i]!, b[i]!)
      if (ordering !== 0) {
        return ordering
      }
    }
    return Ord.number.compare(aLen, bLen)
  })
}

/**
 * Returns a `Show` for `NonEmptyArray<A>` given `Show<A>`
 */
export function getShow<A>(S: Show<A>): Show<NonEmptyArray<A>> {
  return {
    show: (as) => `[${as.map(S.show).join(", ")}]`
  }
}

/**
 * Creates an array of unique values that are included in all given arrays using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first array.
 */
export function intersection_<A>(
  E: Equal<A>
): (xs: NonEmptyArray<A>, ys: NonEmptyArray<A>) => A.Array<A> {
  const elemE = elem_(E)
  return (xs, ys) => xs.filter((a) => elemE(ys, a))
}

/**
 * Creates an array of unique values that are included in all given arrays using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first array.
 */
export function intersection<A>(
  E: Equal<A>
): (ys: NonEmptyArray<A>) => (xs: NonEmptyArray<A>) => A.Array<A> {
  const int = intersection_(E)
  return (ys) => (xs) => int(xs, ys)
}

/**
 * Fold Identity with a mapping function
 */
export function foldMap<M>(
  M: Identity<M>
): <A>(f: (a: A) => M) => (fa: readonly A[]) => M {
  return (f) => foldMapWithIndex(M)((_, a) => f(a))
}

/**
 * Fold Identity with a mapping function
 */
export function foldMap_<M>(
  M: Identity<M>
): <A>(fa: readonly A[], f: (a: A) => M) => M {
  return (fa, f) => foldMapWithIndex_(M)(fa, (_, a) => f(a))
}

/**
 * Fold Identity with a mapping function that consider also the index
 */
export function foldMapWithIndex<M>(
  M: Identity<M>
): <A>(f: (i: number, a: A) => M) => (fa: readonly A[]) => M {
  return (f) => (fa) => foldMapWithIndex_(M)(fa, f)
}

/**
 * Fold Identity with a mapping function that consider also the index
 */
export function foldMapWithIndex_<M>(
  M: Identity<M>
): <A>(fa: readonly A[], f: (i: number, a: A) => M) => M {
  return (fa, f) => fa.reduce((b, a, i) => M.combine(b, f(i, a)), M.identity)
}

/**
 * Sort the elements of an array in increasing order
 */
export function sort<A>(O: Ord.Ord<A>): (as: NonEmptyArray<A>) => NonEmptyArray<A> {
  return (as) => [...as].sort(O.compare) as any
}

/**
 * Sort the elements of an array in increasing order, where elements are compared using first `ords[0]`,
 * then `ords[1]`, then `ords[2]`, etc...
 */
export function sortBy<A>(
  ords: NonEmptyArray<Ord.Ord<A>>
): (as: NonEmptyArray<A>) => NonEmptyArray<A> {
  const M = Ord.getIdentity<A>()
  return sort(ords.reduce(M.combine, M.identity))
}

/**
 * Creates an array of unique values, in order, from all given arrays using a `Equal` for equality comparisons
 */
export function union<A>(
  E: Equal<A>
): (xs: NonEmptyArray<A>, ys: NonEmptyArray<A>) => NonEmptyArray<A> {
  const elemE = elem_(E)
  return (xs, ys) =>
    NA.concat_(
      xs,
      ys.filter((a) => !elemE(xs, a))
    )
}

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 */
export function uniq<A>(E: Equal<A>): (as: NonEmptyArray<A>) => NonEmptyArray<A> {
  const elemS = elem_(E)
  return (as) => {
    const r: MutableArray<A> = []
    const len = as.length
    let i = 0
    for (; i < len; i++) {
      const a = as[i]!
      if (!elemS(r as any, a)) {
        r.push(a)
      }
    }
    return len === r.length ? as : (r as any)
  }
}

/**
 * Get an Associative instance for NonEmptyArray
 */
export function getAssociative<A>() {
  return makeAssociative<NonEmptyArray<A>>(NA.concat_)
}
