// tracing: off

import { pipe, tuple } from "../../../Function"
import type { StateInURI, StateOutURI } from "../../../Modules"
import type { Auto, Monad } from "../../../Prelude"
import { chainF } from "../../../Prelude/DSL"
import * as HKT from "../../../Prelude/HKT"

/**
 * Take over ownership of "S" making it invariant
 */
export type V<C> = HKT.CleanParam<C, "S"> & HKT.V<"S", "_">

export type StateT<F extends HKT.URIS> = [
  HKT.URI<StateInURI>,
  ...F,
  HKT.URI<StateOutURI>
]

export interface StateIn<S, A> {
  (s: S): A
}

export type StateOut<S, A> = readonly [A, S]

export function monad<F extends HKT.URIS, C>(M: Monad<F, C>): Monad<StateT<F>, V<C>>
export function monad<F>(M: Monad<HKT.UHKT<F>>): Monad<StateT<HKT.UHKT<F>>, V<Auto>> {
  return HKT.instance({
    any: <S = any>() => (s: S): HKT.HKT<F, readonly [any, S]> =>
      pipe(
        M.any(),
        M.map((m) => tuple(m, s))
      ),
    flatten: <A, S2>(
      ffa: (s: S2) => HKT.HKT<F, readonly [(s: S2) => HKT.HKT<F, readonly [A, S2]>, S2]>
    ): ((s: S2) => HKT.HKT<F, readonly [A, S2]>) => (x) =>
      pipe(
        x,
        ffa,
        chainF(M)(([f, us]) => f(us))
      ),
    map: <A, B>(f: (a: A) => B) => <S>(
      fa: (s: S) => HKT.HKT<F, readonly [A, S]>
    ): ((s: S) => HKT.HKT<F, readonly [B, S]>) => (x) =>
      pipe(
        x,
        fa,
        M.map(([a, s]) => tuple(f(a), s))
      )
  })
}
