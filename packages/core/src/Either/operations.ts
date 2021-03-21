// tracing: off

import type { Either } from "@effect-ts/system/Either"
import * as E from "@effect-ts/system/Either"
import { pipe, tuple } from "@effect-ts/system/Function"

import type { EitherURI } from "../Modules"
import type { Option } from "../Option"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import * as DSL from "../Prelude/DSL"
import type { Equal } from "../Prelude/Equal"
import type { Show } from "../Prelude/Show"
import type { Associative } from "../Structure/Associative"
import { makeAssociative } from "../Structure/Associative"
import type { Identity } from "../Structure/Identity"
import type { Separated } from "../Utils"
import type { V } from "./definition"

export * from "@effect-ts/system/Either"

/**
 * Zip combining errors in case of multiple failures
 */
export function zipValidation<E>(
  A: Associative<E>
): <B>(fb: E.Either<E, B>) => <A>(fa: E.Either<E, A>) => E.Either<E, readonly [A, B]> {
  return (fb) =>
    E.fold(
      (ea) =>
        E.fold_(
          fb,
          (eb) => E.left(A.combine(ea, eb)),
          () => E.left(ea)
        ),
      (a) => E.fold_(fb, E.left, (b) => E.right(tuple(a, b)))
    )
}

/**
 * `ForEach`'s `forEachF` function
 */
export const forEachF = P.implementForEachF<
  [URI<EitherURI>],
  V
>()((_) => (G) => (f) => (fa) =>
  E.isLeft(fa) ? DSL.succeedF(G)(fa) : pipe(f(fa.right), G.map(E.right))
)

/**
 * Fold `Identity` through `Either`
 */
export const foldMap_: <M>(
  M: Identity<M>
) => <E, A>(fa: E.Either<E, A>, f: (a: A) => M) => M = (M) => (fa, f) =>
  E.isLeft(fa) ? M.identity : f(fa.right)

/**
 * Fold `Identity` through `Either`
 */
export const foldMap: <M>(
  M: Identity<M>
) => <A>(f: (a: A) => M) => <E>(fa: Either<E, A>) => M = (M) => (f) => (fa) =>
  foldMap_(M)(fa, f)

/**
 * Get `Associative` for `Either` given `Associative` of `A`
 */
export function getAssociative<E, A>(S: Associative<A>): Associative<Either<E, A>> {
  return makeAssociative((x, y) =>
    E.isLeft(y) ? x : E.isLeft(x) ? y : E.right(S.combine(x.right, y.right))
  )
}

/**
 * Get `Show` for `Either` given `Show` of `E` & `A`
 */
export function getShow<E, A>(SE: Show<E>, SA: Show<A>): Show<Either<E, A>> {
  return {
    show: (ma) =>
      E.isLeft(ma) ? `left(${SE.show(ma.left)})` : `right(${SA.show(ma.right)})`
  }
}

/**
 * Get an `Associative` instance for `Either` that combines both success and failure
 * given `Associative` of `A` & `E`.
 */
export function getValidationAssociative<E, A>(
  SE: Associative<E>,
  SA: Associative<A>
): Associative<Either<E, A>> {
  return makeAssociative((fx, fy) =>
    E.isLeft(fx)
      ? E.isLeft(fy)
        ? E.left(SE.combine(fx.left, fy.left))
        : fx
      : E.isLeft(fy)
      ? fy
      : E.right(SA.combine(fx.right, fy.right))
  )
}

/**
 * Compact `Either<E, Option<A>>` given `Identity<E>`
 */
export function compact<E>(M: Identity<E>) {
  return <A>(ma: Either<E, Option<A>>): Either<E, A> => {
    return E.isLeft(ma)
      ? ma
      : ma.right._tag === "None"
      ? E.left(M.identity)
      : E.right(ma.right.value)
  }
}

/**
 * Separate `Either<E, Either<A, B>>` given `Identity<E>`
 */
export function separate<E>(M: Identity<E>) {
  const empty = E.left(M.identity)

  return <A, B>(ma: Either<E, Either<A, B>>): Separated<Either<E, A>, Either<E, B>> => {
    return E.isLeft(ma)
      ? { left: ma, right: ma }
      : E.isLeft(ma.right)
      ? { left: E.right(ma.right.left), right: empty }
      : { left: empty, right: E.right(ma.right.right) }
  }
}

/**
 * Get `Witherable`'s `compactF` given `Identity<E>`
 */
export function getCompactF<E>(M: Identity<E>) {
  const com = compact(M)
  return P.implementCompactF<[URI<EitherURI>], P.Fix<"E", E>>()((_) => (G) => {
    const traverseF = forEachF(G)
    return (f) => (x) => pipe(x, traverseF(f), G.map(com))
  })
}

/**
 * Get `Wiltable`'s `separateF` given `Identity<E>`
 */
export function getSeparateF<E>(M: Identity<E>) {
  const sep = separate(M)
  return P.implementSeparateF<[URI<EitherURI>], P.Fix<"E", E>>()((_) => (G) => {
    const traverseF = forEachF(G)
    return (f) => (x) => pipe(x, traverseF(f), G.map(sep))
  })
}

/**
 * Get `Witherable` instance given `Identity<E>`
 */
export function getWitherable<E>(M: Identity<E>) {
  const compactF = getCompactF(M)
  return P.instance<P.Witherable<[URI<EitherURI>], P.Fix<"E", E>>>({
    compactF
  })
}

/**
 * Get `Wiltable` instance given `Identity<E>`
 */
export function getWiltable<E>(M: Identity<E>) {
  const separateF = getSeparateF(M)
  return P.instance<P.Wiltable<[URI<EitherURI>], P.Fix<"E", E>>>({
    separateF
  })
}

/**
 * Get `Compact` instance given `Identity<E>`
 */
export function getCompact<E>(M: Identity<E>) {
  const _compact = compact(M)
  return P.instance<P.Compact<[URI<EitherURI>], P.Fix<"E", E>>>({
    compact: _compact
  })
}

/**
 * Get `Separate` instance given `Identity<E>`
 */
export function getSeparate<E>(M: Identity<E>) {
  const _separate = separate(M)
  return P.instance<P.Separate<[URI<EitherURI>], P.Fix<"E", E>>>({
    separate: _separate
  })
}

/**
 * Get `Compactable` instance given `Identity<E>`
 */
export function getCompactable<E>(M: Identity<E>) {
  const C = getCompact(M)
  const S = getSeparate(M)
  return P.instance<P.Compactable<[URI<EitherURI>], P.Fix<"E", E>>>({
    ...C,
    ...S
  })
}

export function getEqual<E, A>(EL: Equal<E>, EA: Equal<A>): Equal<Either<E, A>> {
  return {
    equals: (x, y) =>
      x === y ||
      (E.isLeft(x)
        ? E.isLeft(y) && EL.equals(x.left, y.left)
        : E.isRight(y) && EA.equals(x.right, y.right))
  }
}
