// tracing: off

import * as Ord from "../../Prelude/Ord"
import type { Associative } from "./definition"
import { makeAssociative } from "./makeAssociative"

/**
 * Fold `Associative` through an `Array`
 */
export function fold<A>(S: Associative<A>): (a: A) => (as: ReadonlyArray<A>) => A {
  return (a) => (as) => as.reduce((x, y) => S.combine(x, y), a)
}

/**
 * `Associative` that returns first element
 */
export function first<A = never>(): Associative<A> {
  return makeAssociative((x) => x)
}

/**
 * `Associative` that returns last element
 */
export function last<A = never>(): Associative<A> {
  return makeAssociative((_, y) => y)
}

/**
 * Given a tuple of `Associative` returns an `Associative` for the tuple
 */
export function tuple<T extends ReadonlyArray<Associative<any>>>(
  ...associatives: T
): Associative<{ [K in keyof T]: T[K] extends Associative<infer A> ? A : never }> {
  return makeAssociative(
    (x, y) => associatives.map((s, i) => s.combine(x[i], y[i])) as any
  )
}

/**
 * The dual of a `Associative`, obtained by swapping the arguments of `combine`.
 */
export function inverted<A>(S: Associative<A>): Associative<A> {
  return makeAssociative((x, y) => S.combine(y, x))
}

/**
 * `Associative` for function combination
 */
export function func<S>(S: Associative<S>): <A = never>() => Associative<(a: A) => S> {
  return () => makeAssociative((f, g) => (a) => S.combine(f(a), g(a)))
}

/**
 * `Associative` for a structure
 */
export function struct<O extends Record<string, any>>(
  associatives: { [K in keyof O]: Associative<O[K]> }
): Associative<O> {
  return makeAssociative((x, y) => {
    const r: any = {}
    for (const key of Object.keys(associatives)) {
      r[key] = associatives[key]!.combine(x[key], y[key])
    }
    return r
  })
}

/**
 * `Associative` that returns last `Min` of elements
 */
export function min<A>(O: Ord.Ord<A>): Associative<A> {
  return makeAssociative(Ord.min(O))
}

/**
 * `Associative` that returns last `Max` of elements
 */
export function max<A>(O: Ord.Ord<A>): Associative<A> {
  return makeAssociative(Ord.max(O))
}

/**
 * Returns a `Associative` instance for objects preserving their type
 */
export function object<A extends object = never>(): Associative<A> {
  return makeAssociative((x, y) => Object.assign({}, x, y))
}

/**
 * You can glue items between and stay associative
 */
export function intercalate<A>(a: A): (S: Associative<A>) => Associative<A> {
  return (S) => makeAssociative((x, y) => S.combine(x, S.combine(a, y)))
}

export * from "./definition"
