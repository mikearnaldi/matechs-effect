import { pipe } from "@effect-ts/system/Function"

import * as A from "../../src/Array"
import * as E from "../../src/Either"
import { chainF } from "../../src/Prelude/DSL"
import * as EitherT from "../../src/Transformer/EitherT"
import * as InvariantT from "../../src/Transformer/InvariantT"
import * as R from "../../src/XPure/XReader"
import * as ReaderT from "../../src/XPure/XReaderT"

test("12", () => {
  const M = pipe(A.Monad, EitherT.monad, ReaderT.monad, InvariantT.monad("E"))

  pipe(
    R.access((k: number) => A.range(0, 10).map((n) => E.right(n + k))),
    chainF(M)((n) => R.succeed([E.right(n + 1)])),
    R.runEnv(10),
    (x) => {
      console.log(x)
    }
  )
})
