// tracing: off

import * as Equal from "@effect-ts/system/Equal"

import type { EqualURI } from "../../Modules"
import type { URI } from "../index"
import * as P from "../index"

/**
 * The `AssociativeBoth` instance for `Equal`.
 */
export const AssociativeBoth = P.instance<P.AssociativeBoth<[URI<EqualURI>]>>({
  both: Equal.both
})

/**
 * The `AssociativeEither` instance for `Equal`.
 */
export const AssociativeEither = P.instance<P.AssociativeEither<[URI<EqualURI>]>>({
  orElseEither: Equal.orElseEither
})

/**
 * The `Contravariant` instance for `Equal`.
 */
export const Contravariant = P.instance<P.Contravariant<[URI<EqualURI>]>>({
  contramap: Equal.contramap
})

/**
 * The `Any` instance for `Equal`.
 */
export const Any = P.instance<P.Any<[URI<EqualURI>]>>({
  any: () => Equal.any
})

/**
 * The `IdentityBoth` instance for `Equal`.
 */
export const IdentityBoth = P.instance<P.IdentityBoth<[URI<EqualURI>]>>({
  ...Any,
  ...AssociativeBoth
})

/**
 * The `None` instance for `Equal`.
 */
export const None = P.instance<P.None<[URI<EqualURI>]>>({
  never: () => Equal.never
})

/**
 * The `IdentityEither` instance for `Equal`.
 */
export const IdentityEither = P.instance<P.IdentityEither<[URI<EqualURI>]>>({
  ...None,
  ...AssociativeEither
})
