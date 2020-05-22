import { CMonad4MA, CApplicative4MAP, CApplicative4MA } from "../Base"
import { STypeOf, RTypeOf, ETypeOf, ATypeOf } from "../Base/Apply"
import * as T from "../Effect"
import type { Either } from "../Either"
import { done, Exit, raise, withRemaining } from "../Exit"
import {
  constant,
  FunctionN,
  Predicate,
  Refinement,
  tuple,
  unsafeCoerce
} from "../Function"
import type { Monoid } from "../Monoid"
import type { Option } from "../Option"
import { pipe } from "../Pipe"
import type { Semigroup } from "../Semigroup"
import { ManagedURI as URI } from "../Support/Common"

/**
 * A Managed<E, A> is a type that encapsulates the safe acquisition and release of a resource.
 *
 * This is a friendly monadic wrapper around bracketExit.
 */
export type ManagedT<S, R, E, A> = (
  _: R
) =>
  | Pure<A>
  | Encase<S, E, A>
  | Bracket<S, S, E, A>
  | Suspended<S, S, E, A>
  | Chain<S, S, E, any, A> // eslint-disable-line @typescript-eslint/no-explicit-any
  | BracketExit<S, S, E, A>

export interface Managed<S, R, E, A> {
  _TAG: () => "Managed"
  _E: () => E
  _A: () => A
  _S: () => S
  _R: (_: R) => void
}

export type Async<A> = Managed<unknown, unknown, never, A>
export type AsyncE<E, A> = Managed<unknown, unknown, E, A>
export type AsyncR<R, A> = Managed<unknown, R, never, A>
export type AsyncRE<R, E, A> = Managed<unknown, R, E, A>

export type Sync<A> = Managed<never, unknown, never, A>
export type SyncE<E, A> = Managed<never, unknown, E, A>
export type SyncR<R, A> = Managed<never, R, never, A>
export type SyncRE<R, E, A> = Managed<never, R, E, A>

const toM = <S, R, E, A>(_: ManagedT<S, R, E, A>): Managed<S, R, E, A> => _ as any
const fromM = <S, R, E, A>(_: Managed<S, R, E, A>): ManagedT<S, R, E, A> => _ as any

export interface Pure<A> {
  readonly _tag: "Pure"
  readonly value: A
}

/**
 * Lift a pure value into a resource
 * @param value
 */
export function pure<A>(value: A): Sync<A> {
  return toM(() => ({
    _tag: "Pure",
    value
  }))
}

export interface Encase<S, E, A> {
  readonly _tag: "Encase"
  readonly acquire: T.Effect<S, unknown, E, A>
}

/**
 * Create a Resource by wrapping an IO producing a value that does not need to be disposed
 *
 * @param res
 * @param f
 */
export function encaseEffect<S, R, E, A>(
  rio: T.Effect<S, R, E, A>
): Managed<S, R, E, A> {
  return toM((r) => ({
    _tag: "Encase",
    acquire: T.provide(r)(rio)
  }))
}

export function raiseError<E>(_: E): SyncE<E, never> {
  return encaseEffect(T.raiseError(_))
}

export interface Bracket<S, S2, E, A> {
  readonly _tag: "Bracket"
  readonly acquire: T.Effect<S, unknown, E, A>
  readonly release: FunctionN<[A], T.Effect<S2, unknown, E, unknown>>
}

/**
 * Create a resource from an acquisition and release function
 * @param acquire
 * @param release
 */
export function bracket<S, R, E, A, S2, R2, E2>(
  acquire: T.Effect<S, R, E, A>,
  release: FunctionN<[A], T.Effect<S2, R2, E2, unknown>>
): Managed<S | S2, R & R2, E | E2, A> {
  return toM((r) => ({
    _tag: "Bracket",
    acquire: T.provide(r)(acquire as T.Effect<S | S2, R & R2, E | E2, A>),
    release: (a) => T.provide(r)(release(a))
  }))
}

export interface BracketExit<S, S2, E, A> {
  readonly _tag: "BracketExit"

  readonly acquire: T.Effect<S, unknown, E, A>
  readonly release: FunctionN<[A, Exit<E, unknown>], T.Effect<S2, unknown, E, unknown>>
}

export function bracketExit<S, R, E, A, S2, R2, E2>(
  acquire: T.Effect<S, R, E, A>,
  release: FunctionN<[A, Exit<E, unknown>], T.Effect<S2, R2, E2, unknown>>
): Managed<S | S2, R & R2, E | E2, A> {
  return toM((r) => ({
    _tag: "BracketExit",
    acquire: T.provide(r)(acquire as T.Effect<S | S2, R, E, A>),
    release: (a, e) => T.provide(r)(release(a, e as any))
  }))
}

export interface Suspended<S, S2, E, A> {
  readonly _tag: "Suspended"

  readonly suspended: T.Effect<S, unknown, E, Managed<S, unknown, E, A>>
}

/**
 * Lift an IO of a Resource into a resource
 * @param suspended
 */
export function suspend<S, R, E, S2, R2, E2, A>(
  suspended: T.Effect<S, R, E, Managed<S2, R2, E2, A>>
): Managed<S | S2, R & R2, E | E2, A> {
  return toM(
    (r) =>
      ({
        _tag: "Suspended",
        suspended: T.map_(T.provide(r)(suspended), (m) => (_: unknown) => fromM(m)(r))
      } as any)
  )
}

export interface Chain<S, S2, E, L, A> {
  readonly _tag: "Chain"
  readonly left: Managed<S, unknown, E, L>
  readonly bind: FunctionN<[L], Managed<S2, unknown, E, A>>
}

/**
 * Compose dependent resourcess.
 *
 * The scope of left will enclose the scope of the resource produced by bind
 * @param left
 * @param bind
 */
export function chain_<S, R, E, L, S2, R2, E2, A>(
  left: Managed<S, R, E, L>,
  bind: FunctionN<[L], Managed<S2, R2, E2, A>>
): Managed<S | S2, R & R2, E | E2, A> {
  return toM((r) => ({
    _tag: "Chain",
    left: provideAll(r)(left as Managed<S | S2, R, E | E2, L>),
    bind: (l) => provideAll(r)(bind(l))
  }))
}

/**
 * Map a resource
 * @param res
 * @param f
 */
export function map_<S, R, E, L, A>(
  res: Managed<S, R, E, L>,
  f: FunctionN<[L], A>
): Managed<S, R, E, A> {
  return chain_(res, (r) => pure(f(r)) as Managed<S, R, E, A>)
}

/**
 * Zip two resources together with the given function.
 *
 * The scope of resa will enclose the scope of resb
 * @param resa
 * @param resb
 * @param f
 */
export function zipWith<S, R, E, A, S2, R2, E2, B, C>(
  resa: Managed<S, R, E, A>,
  resb: Managed<S2, R2, E2, B>,
  f: FunctionN<[A, B], C>
): Managed<S | S2, R & R2, E | E2, C> {
  return chain_(resa, (a) => map_(resb, (b) => f(a, b)))
}

/**
 * Zip two resources together as a tuple.
 *
 * The scope of resa will enclose the scope of resb
 * @param resa
 * @param resb
 */
export function zip<S, R, E, A, S2, R2, E2, B>(
  resa: Managed<S, R, E, A>,
  resb: Managed<S2, R2, E2, B>
): Managed<S | S2, R & R2, E | E2, readonly [A, B]> {
  return zipWith(resa, resb, (a, b) => [a, b] as const)
}

/**
 * Fold two exits, while running functions when one succeeds but other one
 * fails. Gives error priority to first passed exit (aExit).
 *
 * @param aExit
 * @param bExit
 * @param onBFail - run when a succeeds, but b fails
 * @param onAFail - run when b succeeds, but a fails
 */
function foldExitsWithFallback<E, A, B, S, S2, R, R2>(
  aExit: Exit<E, A>,
  bExit: Exit<E, B>,
  onBFail: FunctionN<[A], T.Effect<S, R, E, unknown>>,
  onAFail: FunctionN<[B], T.Effect<S2, R2, E, unknown>>
): T.AsyncRE<R & R2, E, [A, B]> {
  return aExit._tag === "Done"
    ? bExit._tag === "Done"
      ? unsafeCoerce<T.Sync<[A, B]>, T.AsyncRE<R & R2, E, [A, B]>>(
          T.pure(tuple(aExit.value, bExit.value))
        )
      : pipe(
          onBFail(aExit.value),
          T.foldExit(
            (_) => T.completed(withRemaining(bExit, _)),
            () => T.raised(bExit)
          )
        )
    : bExit._tag === "Done"
    ? pipe(
        onAFail(bExit.value),
        T.foldExit(
          (_) => T.completed(withRemaining(aExit, _)),
          () => T.raised(aExit)
        )
      )
    : T.completed(withRemaining(aExit, bExit))
}

/**
 * Zip two resources together with provided function, while allocating and
 * releasing them in parallel and always prioritizing error of first passed
 * resource.
 *
 * @param resa
 * @param resb
 * @param f
 */
export function parZipWith<S, S2, R, R2, E, E2, A, B, C>(
  resa: Managed<S, R, E, A>,
  resb: Managed<S2, R2, E2, B>,
  f: FunctionN<[A, B], C>
): AsyncRE<R & R2, E | E2, C> {
  const alloc = T.raceFold(
    allocate(resa as Managed<S, R, E | E2, A>),
    allocate(resb),
    (aExit, bFiber) =>
      T.chain_(bFiber.wait, (bExit) =>
        foldExitsWithFallback(
          aExit,
          bExit,
          (aLeak) => aLeak.release,
          (bLeak) => bLeak.release
        )
      ),
    (bExit, aFiber) =>
      T.chain_(aFiber.wait, (aExit) =>
        foldExitsWithFallback(
          aExit,
          bExit,
          (aLeak) => aLeak.release,
          (bLeak) => bLeak.release
        )
      )
  )

  return map_(
    bracket(alloc, ([aLeak, bLeak]) =>
      T.raceFold(
        aLeak.release,
        bLeak.release,
        (aExit, bFiber) =>
          T.chain_(bFiber.wait, (bExit) =>
            foldExitsWithFallback(
              aExit,
              bExit,
              () => T.unit,
              () => T.unit
            )
          ),
        (bExit, aFiber) =>
          T.chain_(aFiber.wait, (aExit) =>
            foldExitsWithFallback(
              aExit,
              bExit,
              () => T.unit,
              () => T.unit
            )
          )
      )
    ),
    ([aLeak, bLeak]) => f(aLeak.a, bLeak.a)
  )
}

/**
 * Zip two resources together into tuple, while allocating and releasing them
 * in parallel and always prioritizing error of resa.
 *
 * @param resa
 * @param resb
 */
export function parZip<S, S2, R, R2, E, A, B>(
  resa: Managed<S, R, E, A>,
  resb: Managed<S2, R2, E, B>
): AsyncRE<R & R2, E, [A, B]> {
  return parZipWith(resa, resb, tuple)
}

/**
 * Parallel form of ap_
 * @param iof
 * @param ioa
 */
export function parAp_<S, S2, R, R2, E, E2, A, B>(
  iof: Managed<S, R, E, FunctionN<[A], B>>,
  ioa: Managed<S2, R2, E2, A>
): AsyncRE<R & R2, E | E2, B> {
  return parZipWith(iof, ioa, (f, a) => f(a))
}

/**
 * Flipped version of ap
 * @param resfab
 * @param resa
 */
export function ap_<S, R, E, A, B, S2, R2, E2>(
  resfab: Managed<S, R, E, FunctionN<[A], B>>,
  resa: Managed<S2, R2, E2, A>
): Managed<S | S2, R & R2, E | E2, B> {
  return zipWith(resfab, resa, (f, a) => f(a))
}

/**
 * Map a resource to a static value
 *
 * This creates a resource of the provided constant b where the produced A has the same lifetime internally
 * @param fa
 * @param b
 */
export function as<S, R, E, A, B>(fa: Managed<S, R, E, A>, b: B): Managed<S, R, E, B> {
  return map_(fa, constant(b))
}

/**
 * Curried form of as
 * @param b
 */
export function to<B>(
  b: B
): <S, R, E, A>(fa: Managed<S, R, E, A>) => Managed<S, R, E, B> {
  return (fa) => as(fa, b)
}

/**
 * Construct a new 'hidden' resource using the produced A with a nested lifetime
 * Useful for performing initialization and cleanup that clients don't need to see
 * @param left
 * @param bind
 */
export function chainTap<S, R, E, A, S2, R2, E2>(
  left: Managed<S, R, E, A>,
  bind: FunctionN<[A], Managed<S2, R2, E2, unknown>>
): Managed<S | S2, R & R2, E | E2, A> {
  return chain_(left, (a) => as(bind(a), a))
}

/**
 * Curried form of chainTap
 * @param bind
 */
export function chainTapWith<S, R, E, A>(
  bind: FunctionN<[A], Managed<S, R, E, unknown>>
): <S2, R2, E2>(_: Managed<S2, R2, E2, A>) => Managed<S | S2, R & R2, E | E2, A> {
  return (inner) => chainTap(inner, bind)
}

/**
 * Curried data last form of use
 * @param f
 */
export function consume<S, R, E, A, B>(
  f: FunctionN<[A], T.Effect<S, R, E, B>>
): <S2, R2, E2>(ma: Managed<S2, R2, E2, A>) => T.Effect<S | S2, R & R2, E | E2, B> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return (r) => use(r, f)
}

/**
 * Create a Resource from the fiber of an IO.
 * The acquisition of this resource corresponds to forking rio into a fiber.
 * The destruction of the resource is interrupting said fiber.
 * @param rio
 */
export function fiber<S, R, E, A>(
  rio: T.Effect<S, R, E, A>
): AsyncRE<R, never, T.Fiber<E, A>> {
  return bracket(T.fork(rio), (fiber) => fiber.interrupt)
}

/**
 * Use a resource to produce a program that can be run.s
 * @param res
 * @param f
 */
export function use<S, R, E, A, S2, R2, E2, B>(
  res: Managed<S, R, E, A>,
  f: FunctionN<[A], T.Effect<S2, R2, E2, B>>
): T.Effect<S | S2, R & R2, E | E2, B> {
  return T.accessM((r: R & R2) => {
    const c = fromM(res)(r)
    switch (c._tag) {
      case "Pure":
        return f(c.value)
      case "Encase":
        return T.chain_(c.acquire, f)
      case "Bracket":
        return T.bracket(c.acquire, c.release, f)
      case "BracketExit":
        return T.bracketExit(c.acquire, (a, e) => c.release(a, e as any), f)
      case "Suspended":
        return T.chain_(c.suspended, consume(f))
      case "Chain":
        return use(c.left, (a) => use(c.bind(a), f))
    }
  })
}

export interface Leak<S, R, E, A> {
  a: A
  release: T.Effect<S, R, E, unknown>
}

/**
 * Create an IO action that will produce the resource for this managed along with its finalizer
 * action seperately.
 *
 * If an error occurs during allocation then any allocated resources should be cleaned up, but once the
 * Leak object is produced it is the callers responsibility to ensure release is invoked.
 * @param res
 */
export function allocate<S, R, E, A>(
  res: Managed<S, R, E, A>
): T.Effect<S, R, E, Leak<S, R, E, A>> {
  return T.accessM((r: R) => {
    const c = fromM(res)(r)

    switch (c._tag) {
      case "Pure":
        return T.pure({ a: c.value, release: T.unit })
      case "Encase":
        return T.map_(c.acquire, (a) => ({ a, release: T.unit }))
      case "Bracket":
        return T.map_(c.acquire, (a) => ({ a, release: c.release(a) }))
      case "BracketExit":
        // best effort, because we cannot know what the exit status here
        return T.map_(c.acquire, (a) => ({
          a,
          release: c.release(a, done(undefined))
        }))
      case "Suspended":
        return T.chain_(c.suspended, allocate)
      case "Chain":
        return T.bracketExit(
          allocate(c.left),
          (leak, exit) => (exit._tag === "Done" ? T.unit : leak.release),
          (leak) =>
            T.map_(
              allocate(c.bind(leak.a)),
              // Combine the finalizer actions of the outer and inner resource
              (innerLeak) => ({
                a: innerLeak.a,
                release: T.onComplete_(innerLeak.release, leak.release)
              })
            )
        )
    }
  })
}

/**
 * Use a resource to provide part of the environment to an effect
 * @param man
 * @param ma
 */
export function provide<S2, R3, E2, R2>(
  man: Managed<S2, R3, E2, R2>,
  inverted: "regular" | "inverted" = "regular"
): T.Provider<R3, R2, E2, S2> {
  return (ma) => use(man, (r) => T.provide(r, inverted)(ma))
}

export function getSemigroup<S, R, E, A>(
  Semigroup: Semigroup<A>
): Semigroup<Managed<S, R, E, A>> {
  return {
    concat(x: Managed<S, R, E, A>, y: Managed<S, R, E, A>): Managed<S, R, E, A> {
      return zipWith(x, y, Semigroup.concat)
    }
  }
}

export function getMonoid<S, R, E, A>(Monoid: Monoid<A>): Monoid<Managed<S, R, E, A>> {
  return {
    ...getSemigroup(Monoid),
    empty: pure(Monoid.empty) as Managed<S, R, E, A>
  }
}

function provideAll<R>(r: R) {
  return <S, E, A>(ma: Managed<S, R, E, A>): Managed<S, unknown, E, A> =>
    toM<S, unknown, E, A>(() => fromM(ma)(r))
}

export const ap: <S1, R, E, A>(
  fa: Managed<S1, R, E, A>
) => <S2, R2, E2, B>(
  fab: Managed<S2, R2, E2, (a: A) => B>
) => Managed<S1 | S2, R & R2, E | E2, B> = (fa) => (fab) => ap_(fab, fa)

export const apFirst: <S1, R, E, B>(
  fb: Managed<S1, R, E, B>
) => <A, S2, R2, E2>(
  fa: Managed<S2, R2, E2, A>
) => Managed<S1 | S2, R & R2, E | E2, A> = (fb) => (fa) =>
  ap_(
    map_(fa, (a) => () => a),
    fb
  )

export const apSecond = <S1, R, E, B>(fb: Managed<S1, R, E, B>) => <A, S2, R2, E2>(
  fa: Managed<S2, R2, E2, A>
): Managed<S1 | S2, R & R2, E | E2, B> =>
  ap_(
    map_(fa, () => (b: B) => b),
    fb
  )

export const chain: <S1, R, E, A, B>(
  f: (a: A) => Managed<S1, R, E, B>
) => <S2, R2, E2>(ma: Managed<S2, R2, E2, A>) => Managed<S1 | S2, R & R2, E | E2, B> = (
  f
) => (fa) => chain_(fa, f)

export const chainFirst: <S1, R, E, A, B>(
  f: (a: A) => Managed<S1, R, E, B>
) => <S2, R2, E2>(ma: Managed<S2, R2, E2, A>) => Managed<S1 | S2, R & R2, E | E2, A> = (
  f
) => (ma) => chain_(ma, (x) => map_(f(x), () => x))

export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <S, R>(
    ma: Managed<S, R, E, A>
  ) => Managed<S, R, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <S, R>(
    ma: Managed<S, R, E, A>
  ) => Managed<S, R, E, A>
} = <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E) => <S, R>(
  ma: Managed<S, R, E, A>
): Managed<S, R, E, A> =>
  chain_(ma, (a) =>
    predicate(a)
      ? encaseEffect(T.completed(raise(onFalse(a))))
      : encaseEffect(T.completed(done(a)))
  )

export const flatten: <S1, S2, R, E, R2, E2, A>(
  mma: Managed<S1, R, E, Managed<S2, R2, E2, A>>
) => Managed<S1 | S2, R & R2, E | E2, A> = (mma) => chain_(mma, (x) => x)

export const fromEither: <E, A>(ma: Either<E, A>) => Managed<never, unknown, E, A> = (
  ma
) => encaseEffect(T.encaseEither(ma))

export const fromOption: <E>(
  onNone: () => E
) => <A>(ma: Option<A>) => Managed<never, unknown, E, A> = (onNone) => (ma) =>
  encaseEffect(T.encaseOption(ma, onNone))

export const map: <A, B>(
  f: (a: A) => B
) => <S, R, E>(fa: Managed<S, R, E, A>) => Managed<S, R, E, B> = (f) => (fa) =>
  map_(fa, f)

export const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    a: A
  ) => Managed<never, unknown, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (
    a: A
  ) => Managed<never, unknown, E, A>
} = <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E) => (
  a: A
): Managed<never, unknown, E, A> =>
  predicate(a) ? pure(a) : encaseEffect(T.completed(raise(onFalse(a))))

export const parAp: <S1, R, E, A>(
  fa: Managed<S1, R, E, A>
) => <S2, R2, E2, B>(
  fab: Managed<S2, R2, E2, (a: A) => B>
) => Managed<unknown, R & R2, E | E2, B> = (fa) => (fab) => parAp_(fab, fa)

export const parApFirst: <S1, R, E, B>(
  fb: Managed<S1, R, E, B>
) => <A, S2, R2, E2>(
  fa: Managed<S2, R2, E2, A>
) => Managed<unknown, R & R2, E | E2, A> = (fb) => (fa) =>
  parAp_(
    map_(fa, (a) => () => a),
    fb
  )

export const parApSecond = <S1, R, E, B>(fb: Managed<S1, R, E, B>) => <A, S2, R2, E2>(
  fa: Managed<S2, R2, E2, A>
): Managed<unknown, R & R2, E | E2, B> =>
  parAp_(
    map_(fa, () => (b: B) => b),
    fb
  )

export const managed: CMonad4MA<URI> & CApplicative4MA<URI> = {
  URI,
  _F: "curried",
  of: pure,
  map,
  ap,
  chain
}

export function par<I>(
  I: CApplicative4MA<URI> & I
): CApplicative4MAP<URI> & T.Erase<I, CApplicative4MA<URI>>
export function par<I>(I: CApplicative4MA<URI> & I): CApplicative4MAP<URI> & I {
  return {
    ...I,
    _CTX: "async",
    ap: parAp
  }
}

/**
 * Used to merge types of the form Managed<S, R, E, A> | Managed<S2, R2, E2, A2> into Managed<S | S2, R & R2, E | E2, A | A2>
 * @param _
 */
export function compact<H extends Managed<any, any, any, any>>(
  _: H
): Managed<STypeOf<H>, RTypeOf<H>, ETypeOf<H>, ATypeOf<H>> {
  return _ as any
}
