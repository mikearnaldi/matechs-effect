import { pipe } from "@effect-ts/system/Function"
import { intersect } from "@effect-ts/system/Utils"

import * as T from "../../src/Effect"
import * as Ex from "../../src/Effect/Exit"
import * as O from "../../src/Option"
import * as P from "../../src/Prelude"
import * as OptionT from "../../src/Transformer/OptionT"

export namespace EO {
  export const EffectOption = intersect(
    OptionT.monad(T.Monad),
    OptionT.applicative(T.Applicative),
    OptionT.access(intersect(T.Access, T.Covariant)),
    OptionT.provide(T.Provide)
  )

  export const { access, any, both, flatten, map, provide } = EffectOption

  export const chain = P.chainF(EffectOption)
  export const succeed = P.succeedF(EffectOption)
  export const ap = P.apF(EffectOption)
  export const bind = P.bindF(EffectOption)
  export const do_ = P.doF(EffectOption)
  export const struct = P.structF(EffectOption)
  export const tuple = P.tupleF(EffectOption)
  export const gen = P.genF(EffectOption)
}

it("use effectOption", async () => {
  const program = EO.gen(function* (_) {
    const x = yield* _(EO.succeed(1))
    const y = yield* _(EO.succeed(2))
    return x + y
  })

  const res = await pipe(
    program,
    EO.chain((n) => EO.access(({ base }: { base: number }) => n + base)),
    EO.provide({ base: 1 }),
    T.runPromiseExit
  )

  expect(res).toEqual(Ex.succeed(O.some(4)))
})
