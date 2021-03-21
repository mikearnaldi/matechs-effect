// tracing: off

import * as E from "@effect-ts/system/Either"
import { pipe, tuple } from "@effect-ts/system/Function"

import type { Associative } from "../../Structure/Associative"
import type { Applicative } from "../Applicative"
import type { Fail } from "../FX/Fail"
import type { Run } from "../FX/Run"
import * as HKT from "../HKT"
import type { Monad } from "../Monad"
import { succeedF } from "./dsl"

export function getValidationF<F extends HKT.URIS, C = HKT.Auto>(
  F: Monad<F, C> & Run<F, C> & Fail<F, C> & Applicative<F, C>
): <Z>(A: Associative<Z>) => Applicative<F, HKT.CleanParam<C, "E"> & HKT.Fix<"E", Z>>
export function getValidationF<F>(
  F: Monad<HKT.UHKT2<F>> &
    Run<HKT.UHKT2<F>> &
    Fail<HKT.UHKT2<F>> &
    Applicative<HKT.UHKT2<F>>
): <Z>(A: Associative<Z>) => Applicative<HKT.UHKT2<F>, HKT.Fix<"E", Z>> {
  return <Z>(A: Associative<Z>) =>
    HKT.instance<Applicative<HKT.UHKT2<F>, HKT.Fix<"E", Z>>>({
      any: F.any,
      map: F.map,
      both: (fb) => (fa) =>
        pipe(
          F.either(fa),
          F.both(F.either(fb)),
          F.map(([maybeA, maybeB]) =>
            E.fold_(
              maybeA,
              (ea) =>
                E.fold_(
                  maybeB,
                  (eb) => F.fail(A.combine(ea, eb)),
                  () => F.fail(ea)
                ),
              (a) =>
                E.fold_(
                  maybeB,
                  (e) => F.fail(e),
                  (b) => succeedF(F)(tuple(a, b))
                )
            )
          ),
          F.flatten
        )
    })
}
