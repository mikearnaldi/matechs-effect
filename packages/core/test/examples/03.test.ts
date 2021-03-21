import { pipe } from "@effect-ts/system/Function"

import * as A from "../../src/Array"
import * as E from "../../src/Either"
import { makeAssociative } from "../../src/Structure/Associative"

test("03", () => {
  const ValidationApplicative = E.getValidationApplicative(
    makeAssociative<string>((l, r) => `(${l})(${r})`)
  )

  const traverse = A.forEachF(ValidationApplicative)

  const result = pipe(
    [0, 1, 2, 3],
    traverse((n) => (n > 3 ? E.left("bad") : E.right("good")))
  )

  console.log(result)
})
