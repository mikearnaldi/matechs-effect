// tracing: off

import type { Endomorphism } from "../../Function"
import { identity } from "../../Function"
import type { IdentityURI } from "../../Modules"
import type { Bounded } from "../../Prelude/Bounded"
import type { Derive } from "../../Prelude/Derive"
import type { URI, URIS } from "../../Prelude/HKT"
import type { Associative } from "../Associative"
import * as A from "../Associative"
import type { Identity } from "./definition"
import { makeIdentity } from "./makeIdentity"

/**
 * Derive `Identity`
 */
export function deriveIdentity<F extends URIS, A>(
  D: Derive<F, [URI<IdentityURI>]>,
  I: Identity<A>
) {
  return D.derive(I)
}

/**
 * Fold `Identity` through an array
 */
export function fold<A>(M: Identity<A>): (as: ReadonlyArray<A>) => A {
  const foldM = A.fold(M)
  return foldM(M.identity)
}

/**
 * The dual of a `Identity`, obtained by swapping the arguments of `concat`.
 */
export function inverted<A>(M: Identity<A>): Identity<A> {
  return makeIdentity(M.identity, A.inverted(M).combine)
}

/**
 * `Identity` for endomorphisms
 */
export function endomorphism<A = never>(): Identity<Endomorphism<A>> {
  return makeIdentity(identity, (x, y) => (a) => x(y(a)))
}

/**
 * `Identity` for function combination
 */
export function func<M>(M: Identity<M>): <A = never>() => Identity<(a: A) => M> {
  return <A>() => makeIdentity((_: A) => M.identity, A.func(M)<A>().combine)
}

/**
 * `Identity` that returns last `Max` of elements
 */
export function max<A>(B: Bounded<A>): Identity<A> {
  return makeIdentity(B.bottom, A.max(B).combine)
}

/**
 * `Identity` that returns last `Min` of elements
 */
export function min<A>(B: Bounded<A>): Identity<A> {
  return makeIdentity(B.top, A.min(B).combine)
}

/**
 * Given a struct of `Identity` returns a `Identity` for the struct
 */
export function struct<O extends Record<string, any>>(
  identities: {
    [K in keyof O]: Identity<O[K]>
  }
): Identity<O> {
  const empty: any = {}
  for (const key of Object.keys(identities)) {
    empty[key] = identities[key]!.identity
  }
  return makeIdentity(empty, A.struct(identities).combine)
}

/**
 * Given a tuple of `Identity` returns a `Identity` for the tuple
 */
export function tuple<T extends ReadonlyArray<Identity<any>>>(
  ...identities: T
): Identity<
  {
    [K in keyof T]: T[K] extends Associative<infer A> ? A : never
  }
> {
  return makeIdentity(
    identities.map((m) => m.identity) as any,
    A.tuple(...identities).combine as any
  )
}
