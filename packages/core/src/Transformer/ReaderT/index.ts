// tracing: off

import "../../Operator"

import { pipe } from "../../Function"
import type { Applicative, AssociativeEither, Monad } from "../../Prelude"
import { succeedF } from "../../Prelude/DSL"
import type { Access, Fail, Provide, Run } from "../../Prelude/FX"
import * as HKT from "../../Prelude/HKT"
import * as R from "../../Reader"

export type V<C> = HKT.CleanParam<C, "R"> & HKT.V<"R", "-">

export function monad<F extends HKT.URIS, C>(
  M: Monad<F, C>
): Monad<[HKT.URI<R.ReaderURI>, ...F], V<C>>
export function monad<F>(M: Monad<HKT.UHKT<F>>) {
  return HKT.instance<Monad<[HKT.URI<R.ReaderURI>, ...HKT.UHKT<F>], HKT.V<"R", "-">>>({
    any: () => M.any,
    flatten: (ffa) => (r) =>
      pipe(
        ffa(r),
        M.map((f) => f(r)),
        M.flatten
      ),
    map: (f) => (fa) => (r) => M.map(f)(fa(r))
  })
}

export function access<F extends HKT.URIS, C>(
  M: Monad<F, C>
): Access<[HKT.URI<R.ReaderURI>, ...F], V<C>>
export function access<F>(M: Monad<HKT.UHKT<F>>) {
  return HKT.instance<Access<[HKT.URI<R.ReaderURI>, ...HKT.UHKT<F>], HKT.V<"R", "-">>>({
    access: (f) => pipe(R.access(f), R.map(succeedF(M)))
  })
}

export function associativeEither<F extends HKT.URIS, C>(
  M: AssociativeEither<F, C>
): AssociativeEither<[HKT.URI<R.ReaderURI>, ...F], V<C>>
export function associativeEither<F>(M: AssociativeEither<HKT.UHKT<F>>) {
  return HKT.instance<
    AssociativeEither<[HKT.URI<R.ReaderURI>, ...HKT.UHKT<F>], HKT.V<"R", "-">>
  >({
    orElseEither: (fb) => (fa) => (r) => M.orElseEither(() => fb()(r))(fa(r))
  })
}

export function provide<F extends HKT.URIS, C>(
  M: Monad<F, C>
): Provide<[HKT.URI<R.ReaderURI>, ...F], V<C>>
export function provide<F>(M: Monad<HKT.UHKT<F>>) {
  return HKT.instance<Provide<[HKT.URI<R.ReaderURI>, ...HKT.UHKT<F>], HKT.V<"R", "-">>>(
    {
      provide: (r) => R.provideSome(() => r)
    }
  )
}

export function applicative<F extends HKT.URIS, C>(
  M: Applicative<F, C>
): Applicative<[HKT.URI<R.ReaderURI>, ...F], V<C>>
export function applicative<F>(M: Applicative<HKT.UHKT<F>>) {
  return HKT.instance<
    Applicative<[HKT.URI<R.ReaderURI>, ...HKT.UHKT<F>], HKT.V<"R", "-">>
  >({
    any: () => R.succeed(M.any()),
    map: (f) => R.map(M.map(f)),
    both: (fb) => (fa) =>
      pipe(
        fa,
        R.zip(fb),
        R.map(([_a, _b]) => M.both(_b)(_a))
      )
  })
}

export function run<F extends HKT.URIS, C>(
  M: Run<F, C>
): Run<[HKT.URI<R.ReaderURI>, ...F], V<C>>
export function run<F>(
  M: Run<HKT.UHKT2<F>>
): Run<[HKT.URI<R.ReaderURI>, ...HKT.UHKT2<F>], HKT.V<"R", "-">> {
  return HKT.instance({
    either: (fa) => pipe(fa, R.map(M.either))
  })
}

export function fail<F extends HKT.URIS, C>(
  M: Fail<F, C>
): Fail<[HKT.URI<R.ReaderURI>, ...F], V<C>>
export function fail<F>(
  M: Fail<HKT.UHKT2<F>>
): Fail<[HKT.URI<R.ReaderURI>, ...HKT.UHKT2<F>], HKT.V<"R", "-">> {
  return HKT.instance({
    fail: (e) => pipe(e, M.fail, R.succeed)
  })
}
