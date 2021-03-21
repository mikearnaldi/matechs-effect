// tracing: off

/* adapted from https://github.com/gcanti/fp-ts */

/**
 * Multi-way trees (aka rose trees) and forests, where a forest is
 *
 * ```ts
 * type Forest<A> = Array<Tree<A>>
 * ```
 */

import * as A from "../Array"
import { pipe } from "../Function"
import * as IO from "../IO"
import type { TreeURI } from "../Modules"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import { sequenceF } from "../Prelude"
import * as DSL from "../Prelude/DSL"
import { getApplicativeF } from "../Prelude/DSL"
import type { Equal } from "../Prelude/Equal"
import { makeEqual } from "../Prelude/Equal"
import type { Show } from "../Prelude/Show"
import type { Identity } from "../Structure/Identity"

export declare type Forest<A> = ReadonlyArray<Tree<A>>

export interface Tree<A> {
  readonly value: A
  readonly forest: Forest<A>
}

export function make<A>(value: A, forest: Forest<A> = A.empty): Tree<A> {
  return {
    value,
    forest
  }
}

export function getShow<A>(S: Show<A>): Show<Tree<A>> {
  function showSafe(t: Tree<A>): IO.IO<string> {
    if (t.forest === A.empty || t.forest.length === 0) {
      return IO.succeed(`make(${S.show(t.value)})`)
    }
    return pipe(
      t.forest,
      IO.forEachArray(showSafe),
      IO.map((forest) => `make(${S.show(t.value)}, [${forest.join(", ")}])`)
    )
  }
  return {
    show: (x) => IO.run(showSafe(x))
  }
}

export function getEqual<A>(E: Equal<A>): Equal<Tree<A>> {
  function equalsForestSafe(x: Forest<A>, y: Forest<A>, i = 0): IO.IO<boolean> {
    if (i === x.length) {
      return IO.succeed(true)
    }
    return pipe(
      IO.suspend(() => equalsSafe(x[i]!, y[i]!)),
      IO.chain((b) => (b ? equalsForestSafe(x, y, i + 1) : IO.succeed(false)))
    )
  }
  function equalsSafe(x: Tree<A>, y: Tree<A>): IO.IO<boolean> {
    return !E.equals(x.value, y.value)
      ? IO.succeed(false)
      : x.forest.length !== y.forest.length
      ? IO.succeed(false)
      : equalsForestSafe(x.forest, y.forest)
  }
  return makeEqual((x, y) => IO.run(equalsSafe(x, y)))
}

function draw(indentation: string, forest: Forest<string>): IO.IO<string> {
  return IO.gen(function* (_) {
    let r = ""
    const len = forest.length
    let tree: Tree<string>
    for (let i = 0; i < len; i++) {
      tree = forest[i]!
      const isLast = i === len - 1
      r += indentation + (isLast ? "└" : "├") + "─ " + tree.value
      r += yield* _(
        draw(indentation + (len > 1 && !isLast ? "│  " : "   "), tree.forest)
      )
    }
    return r
  })
}

/**
 * Neat 2-dimensional drawing of a forest
 */
export function drawForest(forest: Forest<string>): string {
  return IO.run(draw("\n", forest))
}

/**
 * Neat 2-dimensional drawing of a tree
 */
export function drawTree(tree: Tree<string>): string {
  return tree.value + drawForest(tree.forest)
}

/**
 * Build a tree from a seed value
 */
export function unfoldTree<A, B>(b: B, f: (b: B) => [A, Array<B>]): Tree<A> {
  return IO.run(unfoldTreeSafe(b, f))
}

/**
 * Build a tree from a seed value
 */
export function unfoldTreeSafe<A, B>(b: B, f: (b: B) => [A, Array<B>]): IO.IO<Tree<A>> {
  const [a, bs] = f(b)
  return pipe(
    IO.suspend(() => unfoldForestSafe(bs, f)),
    IO.map((forest) => ({ value: a, forest }))
  )
}

/**
 * Build a tree from a seed value
 */
export function unfoldForest<A, B>(
  bs: Array<B>,
  f: (b: B) => [A, Array<B>]
): Forest<A> {
  return IO.run(unfoldForestSafe(bs, f))
}

/**
 * Build a tree from a seed value
 */
export function unfoldForestSafe<A, B>(
  bs: Array<B>,
  f: (b: B) => [A, Array<B>]
): IO.IO<Forest<A>> {
  return pipe(
    bs,
    IO.forEachArray((b) => unfoldTreeSafe(b, f))
  )
}

/**
 * Monadic tree builder, in depth-first order
 */
export function unfoldTreeM<M extends P.URIS, C>(
  M: P.Monad<M, C> & P.Applicative<M, C>
): <K, Q, W, X, I, S, R, E, A, B>(
  b: B,
  f: (b: B) => P.Kind<M, C, K, Q, W, X, I, S, R, E, [A, Array<B>]>
) => P.Kind<M, C, K, Q, W, X, I, S, R, E, Tree<A>>
export function unfoldTreeM<M>(
  M: P.Monad<P.UHKT<M>> & P.Applicative<P.UHKT<M>>
): <A, B>(b: B, f: (b: B) => P.HKT<M, [A, Array<B>]>) => P.HKT<M, Tree<A>> {
  const unfoldForestMM = unfoldForestM(M)
  const chain = DSL.chainF(M)
  const succeed = DSL.succeedF(M)
  return (b, f) =>
    pipe(
      f(b),
      chain(([a, bs]) =>
        pipe(
          unfoldForestMM(bs, f),
          chain((ts) => succeed({ value: a, forest: ts }))
        )
      )
    )
}

/**
 * Monadic forest builder, in depth-first order
 */
export function unfoldForestM<M extends P.URIS, C>(
  M: P.Monad<M, C> & P.Applicative<M, C>
): <K, Q, W, X, I, S, R, E, A, B>(
  bs: Array<B>,
  f: (b: B) => P.Kind<M, C, K, Q, W, X, I, S, R, E, [A, Array<B>]>
) => P.Kind<M, C, K, Q, W, X, I, S, R, E, Forest<A>>
export function unfoldForestM<M>(
  M: P.Monad<P.UHKT<M>> & P.Applicative<P.UHKT<M>>
): <A, B>(bs: Array<B>, f: (b: B) => P.HKT<M, [A, Array<B>]>) => P.HKT<M, Forest<A>> {
  const traverseM = A.forEachF(M)
  return (bs, f) =>
    pipe(
      bs,
      traverseM((b) => unfoldTreeM(M)(b, f))
    )
}

export function elem_<A>(E: Equal<A>): (fa: Tree<A>, a: A) => boolean {
  function goForest(forest: Forest<A>, a: A, i = 0): IO.IO<boolean> {
    if (i === forest.length) {
      return IO.succeed(false)
    }
    return pipe(
      IO.suspend(() => go(forest[i]!, a)),
      IO.chain((b) => (b ? IO.succeed(true) : goForest(forest, a, i + 1)))
    )
  }
  function go(fa: Tree<A>, a: A): IO.IO<boolean> {
    if (E.equals(a, fa.value)) {
      return IO.succeed(true)
    }
    return IO.suspend(() => goForest(fa.forest, a))
  }
  return (fa, a) => IO.run(go(fa, a))
}

export function elem<A>(E: Equal<A>): (a: A) => (fa: Tree<A>) => boolean {
  const el = elem_(E)
  return (a) => (fa) => el(fa, a)
}

/**
 * Fold a tree into a "summary" value in depth-first order.
 *
 * For each node in the tree, apply `f` to the `value` and the result of applying `f` to each `forest`.
 *
 * This is also known as the catamorphism on trees.
 */
export function fold<A, B>(f: (a: A, bs: readonly B[]) => B): (tree: Tree<A>) => B {
  function go(tree: Tree<A>): IO.IO<B> {
    return pipe(
      tree.forest,
      IO.forEachArray(go),
      IO.map((bs) => f(tree.value, bs))
    )
  }
  return (tree) => IO.run(go(tree))
}

export function map_<A, B>(fa: Tree<A>, f: (a: A) => B): Tree<B> {
  function go(node: Tree<A>): IO.IO<Tree<B>> {
    return pipe(
      node.forest,
      IO.forEachArray(go),
      IO.map((forest) => ({ value: f(node.value), forest }))
    )
  }

  return IO.run(go(fa))
}

export function of<A>(a: A): Tree<A> {
  return {
    value: a,
    forest: A.empty
  }
}

export function ap_<A, B>(fab: Tree<(a: A) => B>, fa: Tree<A>): Tree<B> {
  return chain_(fab, (f) => map_(fa, f))
}

export function chain_<A, B>(fa: Tree<A>, f: (a: A) => Tree<B>): Tree<B> {
  function go(node: Tree<A>): IO.IO<Tree<B>> {
    const { forest, value } = f(node.value)
    return pipe(
      node.forest,
      IO.forEachArray(go),
      IO.map((x) => ({ value, forest: [...forest, ...x] }))
    )
  }

  return IO.run(go(fa))
}

export function reduce_<A, B>(fa: Tree<A>, b: B, f: (b: B, a: A) => B): B {
  function go(node: Tree<A>, b: B): IO.IO<B> {
    return IO.gen(function* (_) {
      let r: B = f(b, node.value)
      const len = fa.forest.length
      for (let i = 0; i < len; i++) {
        r = yield* _(go(node.forest[i]!, r))
      }
      return r
    })
  }
  return IO.run(go(fa, b))
}

export function foldMap_<M>(M: Identity<M>) {
  return <A>(fa: Tree<A>, f: (a: A) => M): M =>
    reduce_(fa, M.identity, (acc, a) => M.combine(acc, f(a)))
}

export function reduceRight_<A, B>(fa: Tree<A>, b: B, f: (a: A, b: B) => B): B {
  function go(node: Tree<A>, b: B): IO.IO<B> {
    return IO.gen(function* (_) {
      let r: B = b
      const len = node.forest.length
      for (let i = len - 1; i >= 0; i--) {
        r = yield* _(go(node.forest[i]!, r))
      }
      return f(node.value, r)
    })
  }
  return IO.run(go(fa, b))
}

export const forEachF = P.implementForEachF<[URI<TreeURI>]>()((_) => (G) => {
  const traverseF = A.forEachF(G)
  const r = <A, B>(f: (a: A) => P.HKT<typeof _.G, B>) => (
    ta: Tree<A>
  ): P.HKT<typeof _.G, Tree<B>> =>
    pipe(
      f(ta.value),
      G.map((value: B) => (forest: Forest<B>) => ({
        value,
        forest
      })),
      DSL.apF(G)(
        pipe(
          ta.forest,
          traverseF((t) => r(f)(t))
        )
      )
    )
  return r
})

export const ForEach = P.instance<P.ForEach<[URI<TreeURI>]>>({
  forEachF,
  map
})

export const sequence = sequenceF(ForEach)

export function extract<A>(wa: Tree<A>): A {
  return wa.value
}

export function extend_<A, B>(wa: Tree<A>, f: (wa: Tree<A>) => B): Tree<B> {
  function go(node: Tree<A>): IO.IO<Tree<B>> {
    return pipe(
      node.forest,
      IO.forEachArray(go),
      IO.map((forest) => ({ value: f(node), forest }))
    )
  }
  return IO.run(go(wa))
}

export function extend<A, B>(f: (fa: Tree<A>) => B) {
  return (ma: Tree<A>): Tree<B> => extend_(ma, f)
}

export function ap<A>(fa: Tree<A>) {
  return <B>(fab: Tree<(a: A) => B>): Tree<B> => ap_(fab, fa)
}

export function apFirst<B>(fb: Tree<B>) {
  return <A>(fa: Tree<A>): Tree<A> =>
    ap_(
      map_(fa, (a) => () => a),
      fb
    )
}

export function apFirst_<A, B>(fa: Tree<A>, fb: Tree<B>): Tree<A> {
  return ap_(
    map_(fa, (a) => () => a),
    fb
  )
}

export function apSecond<B>(fb: Tree<B>) {
  return <A>(fa: Tree<A>): Tree<B> =>
    ap_(
      map_(fa, () => (b: B) => b),
      fb
    )
}

export function apSecond_<A, B>(fa: Tree<A>, fb: Tree<B>): Tree<B> {
  return ap_(
    map_(fa, () => (b: B) => b),
    fb
  )
}

export function chain<A, B>(f: (a: A) => Tree<B>) {
  return (ma: Tree<A>): Tree<B> => chain_(ma, f)
}

export function tap<A, B>(f: (a: A) => Tree<B>) {
  return (ma: Tree<A>): Tree<A> => chain_(ma, (x) => map_(f(x), () => x))
}

export function tap_<A, B>(ma: Tree<A>, f: (a: A) => Tree<B>): Tree<A> {
  return chain_(ma, (x) => map_(f(x), () => x))
}

export function duplicate<A>(ma: Tree<A>): Tree<Tree<A>> {
  return extend_(ma, (x) => x)
}

export function flatten<A>(mma: Tree<Tree<A>>): Tree<A> {
  return chain_(mma, (x) => x)
}

export function foldMap<M>(M: Identity<M>) {
  return <A>(f: (a: A) => M) => (fa: Tree<A>): M => foldMap_(M)(fa, f)
}

export function map<A, B>(f: (a: A) => B) {
  return (fa: Tree<A>): Tree<B> => map_(fa, f)
}

export function reduce<A, B>(b: B, f: (b: B, a: A) => B) {
  return (fa: Tree<A>): B => reduce_(fa, b, f)
}

export function reduceRight<A, B>(b: B, f: (a: A, b: B) => B) {
  return (fa: Tree<A>): B => reduceRight_(fa, b, f)
}

export const Foldable = P.instance<P.Foldable<[URI<TreeURI>]>>({
  foldMap,
  reduce,
  reduceRight
})

export const Monad = P.instance<P.Monad<[URI<TreeURI>]>>({
  any: () => of({}),
  flatten,
  map
})

export const Applicative = getApplicativeF(Monad)

export const gen = DSL.genF(Monad)

export const bind = DSL.bindF(Monad)

const do_ = DSL.doF({ ...Applicative, ...Monad })()

export { do_ as do }
export { branch as if, branch_ as if_ }

export const struct = DSL.structF(Applicative)

export const tuple = DSL.tupleF(Applicative)

/**
 * Matchers
 */
export const { match, matchIn, matchMorph, matchTag, matchTagIn } = DSL.matchers(Monad)

/**
 * Conditionals
 */
const branch = DSL.conditionalF(Monad)
const branch_ = DSL.conditionalF_(Monad)
