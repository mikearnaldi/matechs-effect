import type * as Chunk from "../core"

/**
 * Determines whether a predicate is satisfied for all elements of this chunk.
 */
export function every_<A>(self: Chunk.Chunk<A>, f: (a: A) => boolean): boolean {
  const iterator = self.arrayLikeIterator()
  let next = iterator.next()

  while (!next.done) {
    const array = next.value
    const len = array.length
    let i = 0
    while (i < len) {
      const a = array[i]!
      if (!f(a)) {
        return false
      }
      i++
    }
    next = iterator.next()
  }

  return true
}

/**
 * Determines whether a predicate is satisfied for all elements of this chunk.
 *
 * @dataFirst every_
 */
export function every<A>(f: (a: A) => boolean): (self: Chunk.Chunk<A>) => boolean {
  return (self) => every_(self, f)
}
