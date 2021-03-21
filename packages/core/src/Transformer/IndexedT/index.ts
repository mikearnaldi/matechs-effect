// tracing: off

import "../../Operator"

import { pipe } from "../../Function"
import type { IxURI } from "../../Modules"
import { chainF, succeedF } from "../../Prelude/DSL"
import * as HKT from "../../Prelude/HKT"
import type { Monad } from "../../Prelude/Monad"

export interface IxC<I, O> {
  Ix: {
    _I: I
    _O: O
  }
}

export type IxCT<C, I, O> = Omit<C, IxURI> & IxC<I, O>

export type Inner<F extends [HKT.URI<IxURI>, ...HKT.URIS]> = ((
  ...x: F
) => any) extends (x: infer H, ...r: infer Rest) => any
  ? Rest extends HKT.URIS
    ? Rest
    : never
  : never

export interface Indexed<
  F extends [HKT.URI<IxURI>, ...HKT.URIS],
  C extends IxC<any, any>
> {
  iof: <II extends C[IxURI]["_I"]>() => <
    A,
    K = HKT.Initial<C, "K">,
    Q = HKT.Initial<C, "Q">,
    W = HKT.Initial<C, "W">,
    X = HKT.Initial<C, "X">,
    I = HKT.Initial<C, "I">,
    S = HKT.Initial<C, "S">,
    R = HKT.Initial<C, "R">,
    E = HKT.Initial<C, "E">
  >(
    a: A
  ) => HKT.Kind<F, IxCT<C, II, II>, K, Q, W, X, I, S, R, E, A>

  lift: <II extends C[IxURI]["_I"], IO extends C[IxURI]["_I"]>() => <
    N extends string,
    K,
    Q,
    W,
    X,
    I,
    S,
    R,
    E,
    A
  >(
    fa: HKT.Kind<Inner<F>, C, K, Q, W, X, I, S, R, E, A>
  ) => HKT.Kind<F, IxCT<C, II, IO>, K, Q, W, X, I, S, R, E, A>

  lower: <II extends C[IxURI]["_I"], IO extends C[IxURI]["_I"]>() => <
    K,
    Q,
    W,
    X,
    I,
    S,
    R,
    E,
    A
  >(
    fa: HKT.Kind<F, IxCT<C, II, IO>, K, Q, W, X, I, S, R, E, A>
  ) => HKT.Kind<Inner<F>, C, K, Q, W, X, I, S, R, E, A>

  ichain<
    IO extends C[IxURI]["_O"],
    IO2 extends C[IxURI]["_I"],
    K2,
    Q2,
    W2,
    X2,
    I2,
    S2,
    R2,
    E2,
    A,
    B
  >(
    f: (a: A) => HKT.Kind<F, IxCT<C, IO, IO2>, K2, Q2, W2, X2, I2, S2, R2, E2, B>
  ): <II extends C[IxURI]["_I"], K, Q, W, X, I, S, R, E>(
    fa: HKT.Kind<
      F,
      IxCT<C, II, IO>,
      HKT.Intro<C, "K", K2, K>,
      HKT.Intro<C, "Q", Q2, Q>,
      HKT.Intro<C, "W", W2, W>,
      HKT.Intro<C, "X", X2, X>,
      HKT.Intro<C, "I", I2, I>,
      HKT.Intro<C, "S", S2, S>,
      HKT.Intro<C, "R", R2, R>,
      HKT.Intro<C, "E", E2, E>,
      A
    >
  ) => HKT.Kind<
    F,
    IxCT<C, II, IO2>,
    HKT.Mix<C, "K", [K2, K]>,
    HKT.Mix<C, "Q", [Q2, Q]>,
    HKT.Mix<C, "W", [W2, W]>,
    HKT.Mix<C, "X", [X2, X]>,
    HKT.Mix<C, "I", [I2, I]>,
    HKT.Mix<C, "S", [S2, S]>,
    HKT.Mix<C, "R", [R2, R]>,
    HKT.Mix<C, "X", [E2, E]>,
    B
  >

  chain<
    IO extends C[IxURI]["_O"],
    N2 extends string,
    K2,
    Q2,
    W2,
    X2,
    I2,
    S2,
    R2,
    E2,
    A,
    B
  >(
    f: (a: A) => HKT.Kind<F, IxCT<C, IO, IO>, K2, Q2, W2, X2, I2, S2, R2, E2, B>
  ): <N extends string, II extends C[IxURI]["_I"], K, Q, W, X, I, S, R, E>(
    fa: HKT.Kind<
      F,
      IxCT<C, II, IO>,
      HKT.Intro<C, "K", K2, K>,
      HKT.Intro<C, "Q", Q2, Q>,
      HKT.Intro<C, "W", W2, W>,
      HKT.Intro<C, "X", X2, X>,
      HKT.Intro<C, "I", I2, I>,
      HKT.Intro<C, "S", S2, S>,
      HKT.Intro<C, "R", R2, R>,
      HKT.Intro<C, "E", E2, E>,
      A
    >
  ) => HKT.Kind<
    F,
    IxCT<C, II, IO>,
    HKT.Mix<C, "K", [K2, K]>,
    HKT.Mix<C, "Q", [Q2, Q]>,
    HKT.Mix<C, "W", [W2, W]>,
    HKT.Mix<C, "X", [X2, X]>,
    HKT.Mix<C, "I", [I2, I]>,
    HKT.Mix<C, "S", [S2, S]>,
    HKT.Mix<C, "R", [R2, R]>,
    HKT.Mix<C, "X", [E2, E]>,
    B
  >

  chainLower<K2, Q2, W2, X2, I2, S2, R2, E2, A, B>(
    f: (a: A) => HKT.Kind<Inner<F>, C, K2, Q2, W2, X2, I2, S2, R2, E2, B>
  ): <
    N extends string,
    II extends C[IxURI]["_I"],
    IO extends C[IxURI]["_O"],
    K,
    Q,
    W,
    X,
    I,
    S,
    R,
    E
  >(
    fa: HKT.Kind<
      F,
      IxCT<C, II, IO>,
      HKT.Intro<C, "K", K2, K>,
      HKT.Intro<C, "Q", Q2, Q>,
      HKT.Intro<C, "W", W2, W>,
      HKT.Intro<C, "X", X2, X>,
      HKT.Intro<C, "I", I2, I>,
      HKT.Intro<C, "S", S2, S>,
      HKT.Intro<C, "R", R2, R>,
      HKT.Intro<C, "E", E2, E>,
      A
    >
  ) => HKT.Kind<
    F,
    IxCT<C, II, IO>,
    HKT.Mix<C, "K", [K2, K]>,
    HKT.Mix<C, "Q", [Q2, Q]>,
    HKT.Mix<C, "W", [W2, W]>,
    HKT.Mix<C, "X", [X2, X]>,
    HKT.Mix<C, "I", [I2, I]>,
    HKT.Mix<C, "S", [S2, S]>,
    HKT.Mix<C, "R", [R2, R]>,
    HKT.Mix<C, "X", [E2, E]>,
    B
  >
}

export class Ix<I, O, A> {
  readonly _I!: I
  readonly _O!: O
  constructor(readonly value: A) {}
}

export function makeIx<I, O>() {
  return <A>(a: A): Ix<I, O, A> => new Ix<I, O, A>(a)
}

export type IndexedT<F extends HKT.URIS, C, I, O> = Indexed<
  [HKT.URI<IxURI>, F[0], ...HKT.Rest<F>],
  IxCT<C, I, O>
>

export function indexedF<_I, _O = _I>() {
  return <F extends HKT.URIS, C = HKT.Auto>(F: Monad<F, C>): IndexedT<F, C, _I, _O> =>
    indexed_<_I, _O, F, C>(F)
}

function indexed_<_I, _O, F extends HKT.URIS, C = HKT.Auto>(
  F: Monad<F, C>
): IndexedT<F, C, _I, _O>
function indexed_<_I, _O, F>(
  F: Monad<HKT.UHKT<F>, HKT.Auto>
): IndexedT<HKT.UHKT<F>, HKT.Auto, _I, _O> {
  return HKT.instance<IndexedT<HKT.UHKT<F>, HKT.Auto, _I, _O>>({
    iof: <II extends _I>() => <A>(a: A): Ix<II, II, HKT.HKT<F, A>> =>
      makeIx<II, II>()(succeedF(F)(a)),
    ichain: <IO extends _O, IO2 extends _I, A, B>(
      f: (a: A) => Ix<IO, IO2, HKT.HKT<F, B>>
    ) => <II extends _I>(fa: Ix<II, IO, HKT.HKT<F, A>>): Ix<II, IO2, HKT.HKT<F, B>> =>
      pipe(
        fa.value,
        chainF(F)((a) => f(a).value),
        makeIx<II, IO2>()
      ),
    lift: <II extends _I, IO extends _I>() => <A>(
      fa: HKT.HKT<F, A>
    ): Ix<II, IO, HKT.HKT<F, A>> => makeIx<II, IO>()(fa),
    lower: () => (fa) => fa.value,
    chain: <IO extends _O, A, B>(f: (a: A) => Ix<IO, IO, HKT.HKT<F, B>>) => <
      II extends _I
    >(
      fa: Ix<II, IO, HKT.HKT<F, A>>
    ): Ix<II, IO, HKT.HKT<F, B>> =>
      pipe(
        fa.value,
        chainF(F)((a) => f(a).value),
        makeIx<II, IO>()
      ),
    chainLower: <A, B>(f: (a: A) => HKT.HKT<F, B>) => <II extends _I, IO extends _O>(
      fa: Ix<II, IO, HKT.HKT<F, A>>
    ): Ix<II, IO, HKT.HKT<F, B>> => pipe(fa.value, chainF(F)(f), makeIx<II, IO>())
  })
}
