// tracing: off

import * as List from "@effect-ts/system/Persistent/List"

import * as A from "../Array"
import { pipe } from "../Function"
import type { ListURI } from "../Modules"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import type { Equal } from "../Prelude/Equal"
import { makeEqual } from "../Prelude/Equal"
import type { Ord } from "../Prelude/Ord"
import type { Show } from "../Prelude/Show"
import type { Identity } from "../Structure/Identity"
import { makeIdentity } from "../Structure/Identity"

export * from "@effect-ts/system/Persistent/List"

/**
 * `ForEach`'s `forEachF` function
 */
export const forEachF = P.implementForEachF<[URI<ListURI>]>()(
  () => (G) => (f) => (fa) =>
    List.reduceRight_(fa, P.succeedF(G)(List.empty()), (a, acc) =>
      pipe(
        f(a),
        G.both(acc),
        G.map(([b, l]) => List.prepend_(l, b))
      )
    )
)

/**
 * Sort the given list by passing each value through the function and
 * comparing the resulting value.
 *
 * Performs a stable sort.
 *
 * @complexity O(n * log(n))
 */
export function sortBy<B>(
  O: Ord<B>
): <A>(f: (a: A) => B) => (l: List.List<A>) => List.List<A> {
  const so = sortBy_(O)
  return <A>(f: (a: A) => B) => (l: List.List<A>): List.List<A> => so(l, f)
}

/**
 * Sort the given list by passing each value through the function and
 * comparing the resulting value.
 *
 * Performs a stable sort.
 *
 * @complexity O(n * log(n))
 */
export function sortBy_<B>(
  O: Ord<B>
): <A>(l: List.List<A>, f: (a: A) => B) => List.List<A> {
  return <A>(l: List.List<A>, f: (a: A) => B): List.List<A> => {
    if (l.length === 0) {
      return l
    }
    const arr: { elm: A; prop: B; idx: number }[] = []
    let i = 0
    List.forEach_(l, (elm) => arr.push({ idx: i++, elm, prop: f(elm) }))
    arr.sort(({ idx: i, prop: a }, { idx: j, prop: b }) => {
      const c = O.compare(a, b)
      return c !== 0 ? c : i < j ? -1 : 1
    })
    const newL = List.emptyPushable<A>()
    for (let i = 0; i < arr.length; ++i) {
      List.push(arr[i]!.elm, newL)
    }
    return newL
  }
}

/**
 * `Wiltable`'s `separateF` function
 */
export const separateF = P.implementSeparateF<
  [URI<ListURI>]
>()((_) => (G) => (f) => (x) => pipe(x, forEachF(G)(f), G.map(List.separate)))

/**
 * `Wither`'s `compactF` function
 */
export const compactF = P.implementCompactF<
  [URI<ListURI>]
>()((_) => (G) => (f) => (x) => pipe(x, forEachF(G)(f), G.map(List.compact)))

/**
 * Test if a value is a member of an array. Takes a `Equal<A>` as a single
 * argument which returns the function to use to search for a value of type `A` in
 * an array of type `Array<A>`.
 */
export function elem<A>(E: Equal<A>): (a: A) => (as: List.List<A>) => boolean {
  const elemE = elem_(E)
  return (a) => (as) => elemE(as, a)
}

/**
 * Test if a value is a member of a list. Takes a `Equal<A>` as a single
 * argument which returns the function to use to search for a value of type `A` in
 * an list of type `List<A>`.
 */
export function elem_<A>(E: Equal<A>): (as: List.List<A>, a: A) => boolean {
  return (as, a) => List.find_(as, (y) => E.equals(y, a))._tag === "Some"
}

/**
 * Creates an array of array values not included in the other given array using a `Equal` for equality
 * comparisons. The order and references of result values are determined by the first array.
 */
export function difference_<A>(
  E: Equal<A>
): (xs: List.List<A>, ys: List.List<A>) => List.List<A> {
  const elemE = elem_(E)
  return (xs, ys) => List.filter_(xs, (a) => !elemE(ys, a))
}

/**
 * Creates an array of array values not included in the other given array using a `Equal` for equality
 * comparisons. The order and references of result values are determined by the first array.
 */
export function difference<A>(
  E: Equal<A>
): (ys: List.List<A>) => (xs: List.List<A>) => List.List<A> {
  const diff = difference_(E)
  return (ys) => (xs) => diff(xs, ys)
}

/**
 * Derives an `Equal` over the `Array` of a given element type from the `Equal` of that type. The derived `Equal` defines two
 * arrays as equal if all elements of both arrays are compared equal pairwise with the given `E`. In case of arrays of
 * different lengths, the result is non equality.
 */
export function getEqual<A>(E: Equal<A>): Equal<List.List<A>> {
  const eq = A.getEqual(E)
  return makeEqual(
    (xs, ys) =>
      xs === ys ||
      (xs.length === ys.length && eq.equals(List.toArray(xs), List.toArray(ys)))
  )
}

/**
 * Returns a `Identity` for `List<A>`
 */
export function getIdentity<A>() {
  return makeIdentity(List.empty<A>(), List.concat_)
}

/**
 * Returns a `Show` for `Array<A>` given `Show<A>`
 */
export function getShow<A>(S: Show<A>): Show<List.List<A>> {
  return {
    show: (as) => `[${List.join_(List.map_(as, S.show), ", ")}]`
  }
}

/**
 * Creates an array of unique values that are included in all given arrays using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first list.
 */
export function intersection_<A>(
  E: Equal<A>
): (xs: List.List<A>, ys: List.List<A>) => List.List<A> {
  const elemE = elem_(E)
  return (xs, ys) => List.filter_(xs, (a) => elemE(ys, a))
}

/**
 * Creates an array of unique values that are included in all given arrays using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first array.
 */
export function intersection<A>(
  E: Equal<A>
): (ys: List.List<A>) => (xs: List.List<A>) => List.List<A> {
  const int = intersection_(E)
  return (ys) => (xs) => int(xs, ys)
}

/**
 * Fold Identity with a mapping function that consider also the index
 */
export function foldMap_<M>(
  M: Identity<M>
): <A>(fa: List.List<A>, f: (a: A) => M) => M {
  return (fa, f) => List.reduce_(fa, M.identity, (b, a) => M.combine(b, f(a)))
}

/**
 * Fold Identity with a mapping function that consider also the index
 */
export function foldMap<M>(
  M: Identity<M>
): <A>(f: (a: A) => M) => (fa: List.List<A>) => M {
  const fmap = foldMap_(M)
  return (f) => (fa) => fmap(fa, f)
}

/**
 * Creates an array of unique values, in order, from all given arrays using a `Equal` for equality comparisons
 */
export function union_<A>(
  E: Equal<A>
): (xs: List.List<A>, ys: List.List<A>) => List.List<A> {
  const elemE = elem_(E)
  return (xs, ys) =>
    List.concat_(
      xs,
      List.filter_(ys, (a) => !elemE(xs, a))
    )
}

/**
 * Creates an array of unique values, in order, from all given arrays using a `Equal` for equality comparisons
 */
export function union<A>(
  E: Equal<A>
): (ys: List.List<A>) => (xs: List.List<A>) => List.List<A> {
  const un = union_(E)
  return (ys) => (xs) => un(xs, ys)
}

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 */
export function uniq<A>(E: Equal<A>): (as: List.List<A>) => List.List<A> {
  const elemS = elem_(E)
  return (as) =>
    List.reduce_(as, List.emptyPushable<A>(), (acc, a) => {
      if (!elemS(acc, a)) {
        List.push(a, acc)
      }
      return acc
    })
}
