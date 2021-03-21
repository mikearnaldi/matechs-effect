// tracing: off

import type { Identity } from "../../Structure/Identity"
import type * as HKT from "../HKT"

export interface FoldMap<F extends HKT.URIS, C = HKT.Auto> extends HKT.Base<F, C> {
  readonly _FoldMap: "FoldMap"
  readonly foldMap: FoldMapFn<F, C>
}

export interface FoldMapFn<F extends HKT.URIS, C = HKT.Auto> {
  <M>(I: Identity<M>): <A>(
    f: (a: A) => M
  ) => <K, Q, W, X, I, S, R, E>(fa: HKT.Kind<F, C, K, Q, W, X, I, S, R, E, A>) => M
}
