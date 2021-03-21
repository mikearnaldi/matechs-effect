import { pipe } from "@effect-ts/system/Function"

import * as R from "../../src/Dictionary"
import * as E from "../../src/Either"
import { makeAssociative } from "../../src/Structure/Associative"

test("04", () => {
  const ValidationApplicative = E.getValidationApplicative(
    makeAssociative<string>((l, r) => `(${l})(${r})`)
  )

  const traverse = R.forEachF(ValidationApplicative)

  const result = pipe(
    { a: 0, b: 1, c: 2 },
    traverse((n) => (n > 3 ? E.left("bad") : E.right("good")))
  )

  console.log(result)
})
