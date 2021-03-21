// tracing: off

import "../Operator"

import { unsafeCoerce } from "../Function"
import type { ConstURI } from "../Modules"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import type { Bounded } from "../Prelude/Bounded"
import type { Equal } from "../Prelude/Equal"
import type { Ord } from "../Prelude/Ord"
import type { Show } from "../Prelude/Show"
import { makeShow } from "../Prelude/Show"
/* adapted from https://github.com/gcanti/fp-ts */
/**
 * The `Const` type constructor, which wraps its first type argument and ignores its second.
 * That is, `Const<E, A>` is isomorphic to `E` for any `A`.
 *
 * `Const` has some useful instances. For example, the `Applicative` instance allows us to collect results using a `Monoid`
 * while ignoring return values.
 */
import type * as As from "../Structure/Associative"
import type * as Id from "../Structure/Identity"

/**
 * The `Const` type constructor, which wraps its first type argument and ignores its second.
 * That is, `Const<E, A>` is isomorphic to `E` for any `A`.
 *
 * `Const` has some useful instances. For example, the `Applicative` instance allows us to collect results using a `Identity`
 * while ignoring return values.
 */
export type Const<E, A> = E & {
  readonly _A: A
}

/**
 * Map + MapLeft
 */
export function bimap_<E, A, G, B>(
  fea: Const<E, A>,
  f: (e: E) => G,
  g: (a: A) => B
): Const<G, B> {
  return makeConst(f(fea))()
}

/**
 * Map + MapLeft
 */
export function bimap<E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
): (fa: Const<E, A>) => Const<G, B> {
  return (fa) => bimap_(fa, f, g)
}

/**
 * Contramap input
 */
export const contramap_: <E, A, B>(
  fa: Const<E, A>,
  f: (b: B) => A
) => Const<E, B> = unsafeCoerce

/**
 * Contramap input
 */
export function contramap<A, B>(f: (b: B) => A): <E>(fa: Const<E, A>) => Const<E, B> {
  return (fa) => contramap_(fa, f)
}

/**
 * The `Any` instance for `Const[E, +_]`
 */
export function getAny<E>(e: E) {
  return P.instance<P.Any<[URI<ConstURI>], P.Fix<"E", E>>>({
    any: makeConst(e)
  })
}

/**
 * The `AssociativeBoth` instance for `Const[E, +_]`
 */
export function getAssociativeBoth<E>(A: As.Associative<E>) {
  return P.instance<P.AssociativeBoth<[URI<ConstURI>], P.Fix<"E", E>>>({
    both: (fb) => (fa) => makeConst(A.combine(fa, fb))()
  })
}

/**
 * The `Contravariant` instance for `Const[+_, +_]`
 */
export const Contravariant = P.instance<
  P.Contravariant<[URI<ConstURI>], P.V<"E", "+">>
>({
  contramap
})

/**
 * The `Covariant` instance for `Const[E, +_]`
 */
export const Covariant = P.instance<P.Covariant<[URI<ConstURI>], P.V<"E", "+">>>({
  map
})

/**
 * The `IdentityBoth` instance for `Const[E, +_]`
 */
export function getIdentityBoth<E>(I: Id.Identity<E>) {
  return P.instance<P.IdentityBoth<[URI<ConstURI>], P.Fix<"E", E>>>({
    ...getAny(I.identity),
    ...getAssociativeBoth(I)
  })
}

/**
 * The `Applicative` instance for `Const[E, +_]`
 */
export function getApplicative<E>(I: Id.Identity<E>) {
  return P.instance<P.Applicative<[URI<ConstURI>], P.Fix<"E", E>>>({
    ...Covariant,
    ...getIdentityBoth(I)
  })
}

/**
 * The `Show` instance for `Const[E, +_]`
 */
export function getShow<E>(S: Show<E>) {
  return <A>() => makeShow<Const<E, A>>((c) => `make(${S.show(c)})`)
}

/**
 * The `Bounded` instance for `Const[E, +_]`
 */
export function getBounded<E>(B: Bounded<E>): <A>() => Bounded<Const<E, A>> {
  return () => B as any
}

/**
 * The `Equal` instance for `Const[E, +_]`
 */
export function getEqual<E>(E: Equal<E>): <A>() => Equal<Const<E, A>> {
  return () => E as any
}

/**
 * The `Identity` instance for `Const[E, +_]`
 */
export function getIdentity<E>(I: Id.Identity<E>): <A>() => Id.Identity<Const<E, A>> {
  return () => I as any
}

/**
 * The `Ord` instance for `Const[E, +_]`
 */
export function getOrd<E>(O: Ord<E>): <A>() => Ord<Const<E, A>> {
  return () => O as any
}

/**
 * The `Associative` instance for `Const[E, +_]`
 */
export function getAssociative<E>(
  A: As.Associative<E>
): <A>() => As.Associative<Const<E, A>> {
  return () => A as any
}

/**
 * Construct `Const[E, A]`
 */
export const makeConst: <E>(e: E) => <A = never>() => Const<E, A> = (e) => () =>
  unsafeCoerce(e)

/**
 * Maps `Const[E, A]` to `Const[E, B]` via `f : A => B`
 *
 * @optimize identity
 */
export const map_: <E, A, B>(
  fa: Const<E, A>,
  f: (a: A) => B
) => Const<E, B> = unsafeCoerce

/**
 * Maps `Const[E, A]` to `Const[E, B]` via `f : A => B`
 */
export function map<A, B>(
  f: (a: A) => B
): {
  /**
   * @optimize identity
   */
  <E>(fa: Const<E, A>): Const<E, B>
} {
  return (fa) => map_(fa, f)
}

/**
 * Maps `Const[E, A]` to `Const[E1, A]` via `f : E => E1`
 */
export const mapLeft_: <E, A, G>(fea: Const<E, A>, f: (e: E) => G) => Const<G, A> = (
  fea,
  f
) => makeConst(f(fea))()

/**
 * Maps `Const[E, A]` to `Const[E1, A]` via `f : E => E1`
 */
export function mapLeft<E, G>(
  f: (e: E) => G
): {
  <A>(fa: Const<E, A>): Const<G, A>
} {
  return (fa) => mapLeft_(fa, f)
}
