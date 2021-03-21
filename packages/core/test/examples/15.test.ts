/* eslint-disable @typescript-eslint/no-namespace */
import { pipe, tuple } from "@effect-ts/system/Function"

import * as DSL from "../../src/Prelude/DSL"
import * as StateT from "../../src/Transformer/StateT/Classic"
import * as IO from "../../src/XPure/XIO"

namespace StateIO {
  export const Monad = StateT.monad(IO.Monad)

  export const chain = DSL.chainF(Monad)
  export const succeed = DSL.succeedF(Monad)
}

test("15", () => {
  pipe(
    (s: number) => IO.succeed(tuple(1, s)),
    StateIO.chain((n) => StateIO.succeed(n + 1)),
    (f) => {
      console.log(IO.run(f(1)))
    }
  )
})
