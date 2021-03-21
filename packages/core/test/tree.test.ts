import * as Eq from "../src/Prelude/Equal"
import * as Tree from "../src/RoseTree"

const a = Tree.make("root", [Tree.make("leaf1"), Tree.make("leaf2")])
const b = Tree.make("root", [Tree.make("leaf1"), Tree.make("leaf2")])
const c = Tree.make("root", [Tree.make("leaf1"), Tree.make("leafx")])

const eqTree = Tree.getEqual(Eq.string)

it("should equal", () => {
  expect(eqTree.equals(a, b)).toEqual(true)
})
it("should not equal", () => {
  expect(eqTree.equals(a, c)).toEqual(false)
})
