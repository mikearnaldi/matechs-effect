import { flow, identity, pipe } from "@effect-ts/system/Function"
import * as M from "@effect-ts/system/Map"

import * as E from "../../src/Either"
import * as P from "../../src/Prelude"
import * as DSL from "../../src/Prelude/DSL"
import type * as H from "../../src/Prelude/HKT"
import * as EitherT from "../../src/Transformer/EitherT"
import * as T from "../../src/XPure"
import * as R from "../../src/XPure/XReader"
import * as ReaderT from "../../src/XPure/XReaderT"

type State<K, V> = M.Map<K, V>

export interface Store<K, V, A>
  extends T.XPure<State<K, V>, State<K, V>, unknown, never, A> {}

export const URI = "Store"
export type URI = typeof URI

type StoreKey = "StoreKey"
type StoreValue = "StoreValue"
type Params<K, V> = H.CustomType<StoreKey, K> & H.CustomType<StoreValue, V>

declare module "../../src/Prelude/HKT" {
  export interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    [URI]: Store<H.AccessCustom<TC, StoreKey>, H.AccessCustom<TC, StoreValue>, A>
  }
}

export const getStoreMonad = <K, V>() =>
  P.instance<P.Monad<[H.URI<URI>], Params<K, V>>>({
    any: () => T.Any.any(),
    flatten: (ffa) => T.chain_(ffa, identity),
    map: T.map
  })

export const K = pipe(getStoreMonad<string, number>(), EitherT.monad, ReaderT.monad)

export const chain = DSL.chainF(K)

export const succeed = DSL.succeedF(K)

test("11", () => {
  const result = pipe(
    succeed("hello"),
    R.map(
      T.chain(
        E.fold(
          (e) => T.succeed(() => E.left(e)),
          (v) =>
            T.modify(
              flow(
                M.toMutable,
                (s) => s.set(v, v.length),
                M.fromMutable,
                (s) => [s, E.right(v.length)]
              )
            )
        )
      )
    ),
    chain((x) => T.accessM((y: number) => succeed(x * y))),
    R.runEnv(2),
    T.runStateResult(M.empty)
  )

  expect(result).toEqual([M.singleton("hello", 5), E.right(10)])
})
