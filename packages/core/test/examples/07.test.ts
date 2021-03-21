import { constant } from "@effect-ts/system/Function"

import * as E from "../../src/Either"
import * as DSL from "../../src/Prelude/DSL"
import { makeAssociative } from "../../src/Structure/Associative"
import * as X from "../../src/XPure"

test("07", () => {
  const A = E.struct({
    a: E.left(0),
    b: E.right(1),
    d: E.left("ok")
  })

  const ValidationApplicative = E.getValidationApplicative(
    makeAssociative<string>((l, r) => `${l} | ${r}`)
  )

  const structValidation = DSL.structF(ValidationApplicative)

  const result = structValidation({
    a: E.right(0),
    b: E.right(1),
    c: E.right(2),
    d: E.left("d"),
    e: E.left("e")
  })

  const C = X.struct({
    a: X.succeed(constant(0)),
    b: X.fail(0)
  })

  console.log(A)
  console.log(result)
  console.log(X.runEither(C))
})
