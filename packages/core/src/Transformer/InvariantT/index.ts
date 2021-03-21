// tracing: off

import "../../Operator"

import * as P from "../../Prelude"
import type * as HKT from "../../Prelude/HKT"

export function monad<P extends HKT.Param>(
  _: P
): <F extends HKT.URIS, C>(
  M: P.Monad<F, C>
) => P.Monad<F, HKT.CleanParam<C, P> & HKT.V<P, "_">>
export function monad<P extends HKT.Param>(_: P) {
  return <F, C>(
    M: P.Monad<HKT.UHKT<F>, C>
  ): P.Monad<HKT.UHKT<F>, HKT.CleanParam<C, P> & HKT.V<P, "_">> => P.instance(M)
}

export function applicative<P extends HKT.Param>(
  _: P
): <F extends HKT.URIS, C>(
  M: P.Applicative<F, C>
) => P.Applicative<F, HKT.CleanParam<C, P> & P.V<P, "_">>
export function applicative<P extends HKT.Param>(_: P) {
  return <F, C>(
    M: P.Applicative<HKT.UHKT<F>, C>
  ): P.Applicative<HKT.UHKT<F>, HKT.CleanParam<C, P> & P.V<P, "_">> => P.instance(M)
}
