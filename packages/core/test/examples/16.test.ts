/* eslint-disable @typescript-eslint/no-namespace */
import { pipe } from "@effect-ts/system/Function"

import * as E from "../../src/Either"
import * as DSL from "../../src/Prelude/DSL"
import * as ReaderT from "../../src/Transformer/ReaderT"

namespace ReaderEither {
  export const Monad = ReaderT.monad(E.Monad)
  export const Access = ReaderT.access(E.Monad)
  export const Fail = ReaderT.fail({ ...E.Monad, ...E.Fail })

  export const chain = DSL.chainF(Monad)
  export const succeed = DSL.succeedF(Monad)

  export const { access } = Access
  export const { fail } = Fail
}

test("16", () => {
  pipe(
    ReaderEither.access((n: number) => n + 1),
    ReaderEither.chain((n) =>
      n > 2 ? ReaderEither.fail("bad") : ReaderEither.succeed(n)
    ),
    (f) => {
      console.log(f(1))
    }
  )
})
