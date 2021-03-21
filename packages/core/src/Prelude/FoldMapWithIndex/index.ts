// tracing: off

import type { Identity } from "../../Structure/Identity"
import type * as HKT from "../HKT"

export interface FoldMapWithIndex<F extends HKT.URIS, C = HKT.Auto>
  extends HKT.Base<F, C> {
  readonly _FoldMapWithIndex: "FoldMapWithIndex"
  readonly foldMapWithIndex: FoldMapWithIndexFn<F, C>
}

export interface FoldMapWithIndexFn<F extends HKT.URIS, C = HKT.Auto> {
  <M>(I: Identity<M>): <K, A>(
    f: (k: HKT.IndexFor<F, HKT.OrFix<"K", C, K>>, a: A) => M
  ) => <Q, W, X, I, S, R, E>(fa: HKT.Kind<F, C, K, Q, W, X, I, S, R, E, A>) => M
}
