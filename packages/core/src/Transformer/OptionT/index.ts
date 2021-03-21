// tracing: off

import "../../Operator"

import { pipe } from "../../Function"
import * as O from "../../Option"
import type { Applicative, Covariant, Monad } from "../../Prelude"
import { succeedF } from "../../Prelude/DSL"
import type { Access, Provide } from "../../Prelude/FX"
import * as HKT from "../../Prelude/HKT"

export function monad<F extends HKT.URIS, C>(
  M: Monad<F, C>
): Monad<[F[0], ...HKT.Rest<F>, HKT.URI<O.OptionURI>], C>
export function monad<F, C>(
  M: Monad<HKT.UHKT<F>, C>
): Monad<[HKT.UHKT<F>[0], HKT.URI<O.OptionURI>], C> {
  const succeed = succeedF(M)
  return HKT.instance<Monad<[HKT.UHKT<F>[0], HKT.URI<O.OptionURI>], C>>({
    any: () => succeed(O.some({})),
    flatten: (x) =>
      pipe(
        x,
        M.map((o) => (o._tag === "None" ? succeed(O.none) : o.value)),
        M.flatten
      ),
    map: (f) => M.map(O.map(f))
  })
}

export function applicative<F extends HKT.URIS, C>(
  M: Applicative<F, C>
): Applicative<[F[0], ...HKT.Rest<F>, HKT.URI<O.OptionURI>], C>
export function applicative<F, C>(
  M: Applicative<HKT.UHKT<F>, C>
): Applicative<[HKT.UHKT<F>[0], HKT.URI<O.OptionURI>], C> {
  const succeed = succeedF(M)
  return HKT.instance<Applicative<[HKT.UHKT<F>[0], HKT.URI<O.OptionURI>], C>>({
    any: () => succeed(O.some({})),
    map: (f) => M.map(O.map(f)),
    both: (fb) => (x) =>
      pipe(
        x,
        M.both(fb),
        M.map(([a, b]) => O.zip_(a, b))
      )
  })
}

export function access<F extends HKT.URIS, C>(
  M: Access<F, C> & Covariant<F, C>
): Access<[F[0], ...HKT.Rest<F>, HKT.URI<O.OptionURI>], C>
export function access<F>(M: Access<HKT.UHKT<F>> & Covariant<HKT.UHKT<F>>) {
  return HKT.instance<Access<[HKT.UHKT<F>[0], HKT.URI<O.OptionURI>]>>({
    access: (f) => pipe(M.access(f), M.map(O.some))
  })
}

export function provide<F extends HKT.URIS, C>(
  M: Provide<F, C>
): Provide<[F[0], ...HKT.Rest<F>, HKT.URI<O.OptionURI>], C>
export function provide<F>(M: Provide<HKT.UHKT<F>>) {
  return HKT.instance<Provide<[HKT.UHKT<F>[0], HKT.URI<O.OptionURI>]>>({
    provide: M.provide
  })
}
