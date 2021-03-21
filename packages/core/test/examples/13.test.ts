// NOTE: namespaces are used to scope things in the demo, in real usage don't use namespaces!

/* eslint-disable @typescript-eslint/no-namespace */

import { pipe } from "@effect-ts/system/Function"
import { NoSuchElementException } from "@effect-ts/system/GlobalExceptions"
import { isEither, isOption } from "@effect-ts/system/Utils"

import * as Either from "../../src/Either"
import * as Option from "../../src/Option"
import { GenHKT } from "../../src/Prelude/DSL"
import * as DSL from "../../src/Prelude/DSL"
import * as S from "../../src/Prelude/Selective"
import { makeAssociative } from "../../src/Structure/Associative"
import * as EitherT from "../../src/Transformer/EitherT"
import type { XIO } from "../../src/XPure/XIO"
import * as IO from "../../src/XPure/XIO"
import * as Reader from "../../src/XPure/XReader"
import * as ReaderT from "../../src/XPure/XReaderT"

//
// IO[Either[X, A]]
//

namespace IOEither {
  export const Monad = pipe(IO.Monad, EitherT.monad)
  export const Applicative = pipe(IO.Applicative, EitherT.applicative)
  export const Run = pipe(IO.Covariant, EitherT.run)
  export const Fail = pipe(IO.Monad, EitherT.fail)
}

//
// Reader[I, IO[Either[X, A]]]
//

namespace ReaderIOEither {
  //
  export const Monad = pipe(IOEither.Monad, ReaderT.monad)
  export const Applicative = pipe(IOEither.Applicative, ReaderT.applicative)
  export const Run = pipe(IOEither.Run, ReaderT.run)
  export const Fail = pipe(IOEither.Fail, ReaderT.fail)
  export const Access = pipe(IOEither.Monad, ReaderT.access)
  export const Provide = pipe(IOEither.Monad, ReaderT.provide)

  export const { access, any, both, either, fail, flatten, map, provide } = {
    ...Monad,
    ...Applicative,
    ...Run,
    ...Fail,
    ...Access,
    ...Provide
  }

  export const succeed = DSL.succeedF(Monad)
  export const accessM = DSL.accessMF({ ...Monad, ...Access })

  export const Do = DSL.doF(Monad)()
  export const bind = DSL.bindF(Monad)

  export const provideSome = DSL.provideSomeF({
    ...Monad,
    ...Access,
    ...Provide
  })

  export const getValidation = DSL.getValidationF({
    ...Monad,
    ...Applicative,
    ...Run,
    ...Fail
  })

  export const StringValidation = getValidation(
    makeAssociative<string>((l, r) => `${l}, ${r}`)
  )

  export const structValidation = DSL.structF(StringValidation)

  type Stack<R, E, A> = Reader.XReader<R, XIO<Either.Either<E, A>>>

  const adapter: {
    <A>(_: Option.Option<A>): GenHKT<Stack<unknown, NoSuchElementException, A>, A>
    <E, A>(_: Either.Either<E, A>): GenHKT<Stack<unknown, E, A>, A>
    <R, E, A>(_: Stack<R, E, A>): GenHKT<Stack<R, E, A>, A>
  } = (_: any) => {
    if (isOption(_)) {
      return new GenHKT(
        _._tag === "None" ? fail(new NoSuchElementException()) : succeed(_.value)
      )
    }
    if (isEither(_)) {
      return new GenHKT(_._tag === "Left" ? fail(_.left) : succeed(_.right))
    }
    return new GenHKT(_)
  }

  export const gen = DSL.genF(Monad, { adapter })
}

//
// Reader[I, IO[A]]
//

namespace ReaderIO {
  export const RIOMonad = pipe(IO.Monad, ReaderT.monad)
  export const RIOApplicative = pipe(IO.Applicative, ReaderT.applicative)
  export const RIOSelectiveM = S.monad(RIOMonad)
  export const RIOSelectiveA = S.applicative(RIOApplicative)

  export const succeed = DSL.succeedF(RIOMonad)

  export const branchM = S.branchF(RIOSelectiveM)
  export const branchA = S.branchF(RIOSelectiveA)
}

test("13", () => {
  pipe(
    ReaderIOEither.Do,
    ReaderIOEither.bind("x", () => ReaderIOEither.succeed("0")),
    ReaderIOEither.bind("y", () => ReaderIOEither.succeed("1")),
    ReaderIOEither.bind("v", () =>
      ReaderIOEither.structValidation({
        a: ReaderIOEither.fail("foo"),
        b: ReaderIOEither.fail("bar"),
        c: ReaderIOEither.access((r: number) => r + 1)
      })
    ),
    ReaderIOEither.map(({ v: { a, b, c }, x, y }) => `${a}${b}${c}${x}${y}`),
    ReaderIO.branchA(
      ReaderIO.succeed((s) => `error: ${s}`),
      ReaderIO.succeed((s) => `success: ${s}`)
    ),
    Reader.runEnv(2),
    IO.run,
    (x) => {
      console.log(x)
    }
  )
})

test("13 generator", () => {
  const result = ReaderIOEither.gen(function* (_) {
    const a = yield* _(ReaderIOEither.access((_: { a: number }) => _.a))
    const b = yield* _(ReaderIOEither.access((_: { b: number }) => _.b))
    const c = yield* _(Either.right(2))
    const d = yield* _(Option.some(3))

    if (a + b + c + d > 10) {
      yield* _(ReaderIOEither.fail("error"))
    }

    return a + b + c + d
  })

  expect(pipe(result, Reader.runEnv({ a: 1, b: 2 }), IO.run)).toEqual(Either.right(8))
})
