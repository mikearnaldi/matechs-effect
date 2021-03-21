// tracing: off

/* adapted from https://github.com/gcanti/fp-ts */
import "../Operator"

import type { IdURI } from "../Modules"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import { structF, tupleF } from "../Prelude/DSL"
import type { Equal } from "../Prelude/Equal"
import type { Show } from "../Prelude/Show"
import type { Identity } from "../Structure/Identity"

export type Id<A> = A

/**
 * @optimize identity
 */
export function alt_<A>(fx: A, _fy: () => A): A {
  return fx
}

/**
 * @dataFirst alt_
 */
export function alt<A>(that: () => A) {
  return (fa: A): A => alt_(fa, that)
}

export function ap_<A, B>(fab: (a: A) => B, fa: A): B {
  return fab(fa)
}

/**
 * @dataFirst ap_
 */
export function ap<A>(fa: A) {
  return <B>(fab: (a: A) => B): B => ap_(fab, fa)
}

export function apFirst<B>(_fb: B) {
  return <A>(fa: A): A => fa
}

export function apSecond<B>(fb: B) {
  return <A>(_fa: A): B => fb
}

export function chain_<A, B>(fa: A, f: (a: A) => B): B {
  return f(fa)
}

/**
 * @dataFirst chain_
 */
export function chain<A, B>(f: (a: A) => B) {
  return (ma: A): B => f(ma)
}

/**
 * @dataFirst tap_
 */
export function tap<A, B>(f: (a: A) => B) {
  return (ma: A): A => chain_(ma, (x) => map_(f(x), () => x))
}

export function tap_<A, B>(ma: A, f: (a: A) => B): A {
  return chain_(ma, (x) => map_(f(x), () => x))
}

/**
 * @optimize identity
 */
export function duplicate<A>(ma: A): A {
  return ma
}

export function extend_<A, B>(wa: A, f: (wa: A) => B): B {
  return f(wa)
}

/**
 * @dataFirst extend_
 */
export function extend<A, B>(f: (fa: A) => B) {
  return (ma: A): B => f(ma)
}

/**
 * @optimize identity
 */
export function extract<A>(wa: A): A {
  return wa
}

/**
 * @optimize identity
 */
export function flatten<A>(wa: A): A {
  return wa
}

export function foldMap_<M>(M: Identity<M>) {
  return <A>(fa: A, f: (a: A) => M): M => f(fa)
}

export function foldMap<M>(M: Identity<M>) {
  return <A>(f: (a: A) => M) => (fa: A): M => foldMap_(M)(fa, f)
}

/**
 * @optimize identity
 */
export function getEq<A>(E: Equal<A>): Equal<Id<A>> {
  return E
}

/**
 * @optimize identity
 */
export function getShow<A>(E: Show<A>): Show<Id<A>> {
  return E
}

export function map_<A, B>(fa: A, f: (a: A) => B): B {
  return f(fa)
}

/**
 * @dataFirst map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (fa: A): B => map_(fa, f)
}

export function reduce_<A, B>(fa: A, b: B, f: (b: B, a: A) => B): B {
  return f(b, fa)
}

/**
 * @dataFirst reduce_
 */
export function reduce<A, B>(b: B, f: (b: B, a: A) => B) {
  return (fa: A): B => reduce_(fa, b, f)
}

export function reduceRight_<A, B>(fa: A, b: B, f: (a: A, b: B) => B): B {
  return f(fa, b)
}

/**
 * @dataFirst reduceRight_
 */
export function reduceRight<A, B>(b: B, f: (a: A, b: B) => B) {
  return (fa: A): B => reduceRight_(fa, b, f)
}

export const Any = P.instance<P.Any<[URI<IdURI>]>>({
  any: () => ({})
})

export const Covariant = P.instance<P.Covariant<[URI<IdURI>]>>({
  map
})

export const AssociativeBoth = P.instance<P.AssociativeBoth<[URI<IdURI>]>>({
  both: (b) => (a) => [a, b]
})

export const AssociativeFlatten = P.instance<P.AssociativeFlatten<[URI<IdURI>]>>({
  flatten: (a) => a
})

export const IdentityBoth = P.instance<P.IdentityBoth<[URI<IdURI>]>>({
  ...Any,
  ...AssociativeBoth
})

export const IdentityFlatten = P.instance<P.IdentityFlatten<[URI<IdURI>]>>({
  ...Any,
  ...AssociativeFlatten
})

export const Applicative = P.instance<P.Applicative<[URI<IdURI>]>>({
  ...Covariant,
  ...IdentityBoth
})

export const Monad = P.instance<P.Monad<[URI<IdURI>]>>({
  ...Covariant,
  ...IdentityFlatten
})

export const Reduce = P.instance<P.Reduce<[URI<IdURI>]>>({
  reduce
})

export const ReduceRight = P.instance<P.ReduceRight<[URI<IdURI>]>>({
  reduceRight
})

export const FoldMap = P.instance<P.FoldMap<[URI<IdURI>]>>({
  foldMap
})

export const Foldable = P.instance<P.Foldable<[URI<IdURI>]>>({
  ...Reduce,
  ...ReduceRight,
  ...FoldMap
})

export const ForEach = P.instance<P.ForEach<[URI<IdURI>]>>({
  ...Covariant,
  forEachF: () => (f) => f
})

export const struct = structF(Applicative)

export const tuple = tupleF(Applicative)
