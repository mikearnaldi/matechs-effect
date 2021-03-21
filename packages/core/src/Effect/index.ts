// tracing: off

import "../Operator"

import * as T from "@effect-ts/system/Effect"

import type { EffectCategoryURI, EffectURI } from "../Modules"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import * as DSL from "../Prelude/DSL"
import * as I from "../Structure/Identity"

export * from "@effect-ts/system/Effect"
export { EffectURI } from "../Modules"

export type V = P.V<"R", "-"> & P.V<"E", "+">

export const Any = P.instance<P.Any<[URI<EffectURI>], V>>({
  any: () => T.succeed({})
})

export const AssociativeEither = P.instance<P.AssociativeEither<[URI<EffectURI>], V>>({
  orElseEither: T.orElseEither
})

export const AssociativeFlatten = P.instance<P.AssociativeFlatten<[URI<EffectURI>], V>>(
  {
    flatten: T.flatten
  }
)

export const AssociativeBoth = P.instance<P.AssociativeBoth<[URI<EffectURI>], V>>({
  both: T.zip
})

export const Covariant = P.instance<P.Covariant<[URI<EffectURI>], V>>({
  map: T.map
})

export const IdentityFlatten = P.instance<P.IdentityFlatten<[URI<EffectURI>], V>>({
  ...Any,
  ...AssociativeFlatten
})

export const IdentityBoth = P.instance<P.IdentityBoth<[URI<EffectURI>], V>>({
  ...Any,
  ...AssociativeBoth
})

export const Monad = P.instance<P.Monad<[URI<EffectURI>], V>>({
  ...IdentityFlatten,
  ...Covariant
})

export const Applicative = P.instance<P.Applicative<[URI<EffectURI>], V>>({
  ...Covariant,
  ...IdentityBoth
})

export const Fail = P.instance<P.FX.Fail<[URI<EffectURI>], V>>({
  fail: T.fail
})

export const Run = P.instance<P.FX.Run<[URI<EffectURI>], V>>({
  either: T.either
})

export const Access = P.instance<P.FX.Access<[URI<EffectURI>], V>>({
  access: T.access
})

export const Provide = P.instance<P.FX.Provide<[URI<EffectURI>], V>>({
  provide: T.provideAll
})

export const getValidationApplicative = DSL.getValidationF<[URI<EffectURI>], V>({
  ...Monad,
  ...Run,
  ...Fail,
  ...Applicative
})

export const Category = P.instance<P.Category<[URI<EffectCategoryURI>], V>>({
  id: T.environment,
  compose: T.compose
})

/**
 * Matchers
 */
export const { match, matchIn, matchMorph, matchTag, matchTagIn } = DSL.matchers(
  Covariant
)

/**
 * Derive sequential identity
 */
export function getIdentity<A>(Id: I.Identity<A>) {
  return <R = unknown, E = never>(): I.Identity<T.Effect<R, E, A>> =>
    I.makeIdentity(T.succeed(Id.identity) as T.Effect<R, E, A>, (x, y) =>
      T.zipWith_(x, y, Id.combine)
    )
}

/**
 * Derive parallel identity
 */
export function getIdentityPar<A>(Id: I.Identity<A>) {
  return <R = unknown, E = never>(): I.Identity<T.Effect<R, E, A>> =>
    I.makeIdentity(T.succeed(Id.identity) as T.Effect<R, E, A>, (x, y) =>
      T.zipWithPar_(x, y, Id.combine)
    )
}
