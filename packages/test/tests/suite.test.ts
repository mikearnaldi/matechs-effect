import { assert, run, testM, suite, arb, provideGenerator } from "../src";
import { effect as T, stream as S } from "@matechs/effect";
import { Do } from "fp-ts-contrib/lib/Do";
import { flow } from "fp-ts/lib/function";
import { withTimeout, withRetryPolicy } from "../src/impl";
import { pipe } from "fp-ts/lib/pipeable";
import { limitRetries } from "retry-ts";
import * as fc from "fast-check";
import { sequenceS } from "fp-ts/lib/Apply";

interface Sum {
  sum: {
    a: number;
    b: number;
    e: number;
  };
}

interface Mul {
  mul: {
    a: number;
    b: number;
    e: number;
  };
}

interface Div {
  div: {
    a: number;
    b: number;
    e: number;
  };
}

interface Sub {
  sub: {
    a: number;
    b: number;
    e: number;
  };
}

const demoSuite = suite("demo")(
  testM("sum")(
    Do(T.effect)
      .bind("env", T.accessEnvironment<Sum>())
      .bindL("c", ({ env: { sum: { a, b } } }) =>
        T.delay(
          T.sync(() => a + b),
          100
        )
      )
      .return((s) => assert.deepEqual(s.c, s.env.sum.e))
  ),
  testM("mul")(
    Do(T.effect)
      .bind("env", T.accessEnvironment<Mul>())
      .bindL("c", ({ env: { mul: { a, b } } }) =>
        T.delay(
          T.sync(() => a * b),
          100
        )
      )
      .return((s) => assert.deepEqual(s.c, s.env.mul.e))
  )
);

const demo2Suite = suite("demo2")(
  testM("sub")(
    Do(T.effect)
      .bind("env", T.accessEnvironment<Sub>())
      .bindL("c", ({ env: { sub: { a, b } } }) =>
        T.delay(
          T.sync(() => a - b),
          500
        )
      )
      .return((s) => assert.deepEqual(s.c, s.env.sub.e))
  ),
  testM("div")(
    Do(T.effect)
      .bind("env", T.accessEnvironment<Div>())
      .bindL("c", ({ env: { div: { a, b } } }) =>
        T.delay(
          T.sync(() => a / b),
          500
        )
      )
      .return((s) => assert.deepEqual(s.c, s.env.div.e))
  )
);

const comboSuite = suite("combo")(
  demoSuite,
  withTimeout(600)(demo2Suite),
  testM("simple")(T.sync(() => assert.deepEqual(1, 1)))
);

const flackySuite = suite("flacky")(
  testM("random")(
    pipe(
      T.sync(() => Math.random()),
      T.map((n) => assert.deepEqual(n < 0.3, true))
    )
  ),
  pipe(
    testM("random2")(
      pipe(
        T.sync(() => Math.random()),
        T.map((n) => assert.deepEqual(n < 0.1, true))
      )
    ),
    withRetryPolicy(limitRetries(200))
  )
);

const genSuite = suite("generative")(
  testM("generate integers")(
    pipe(
      sequenceS(S.stream)({
        a: arb(fc.nat()),
        b: arb(fc.nat())
      }),
      S.map((x) => assert.deepEqual(x.a > 0 && x.b > 0, true)),
      S.take(1000),
      S.drain
    )
  )
);

const provideSum = T.provideS<Sum>({
  sum: {
    a: 1,
    b: 2,
    e: 3
  }
});

const provideMul = T.provideS<Mul>({
  mul: {
    a: 2,
    b: 3,
    e: 6
  }
});

const provideSub = T.provideS<Sub>({
  sub: {
    a: 3,
    b: 2,
    e: 1
  }
});

const provideDiv = T.provideS<Div>({
  div: {
    a: 6,
    b: 3,
    e: 2
  }
});

run(
  pipe(comboSuite, withTimeout(300)),
  pipe(flackySuite, withRetryPolicy(limitRetries(10))),
  genSuite
)(flow(provideMul, provideSub, provideSum, provideDiv, provideGenerator));
