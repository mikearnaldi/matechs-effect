/*
  based on: https://github.com/rzeigler/waveguide-streams/blob/master/src/step.ts
  credits to original author
 */

/* tested in wave */
/* istanbul ignore file */

import { option as O, function as F, pipeable as P } from "fp-ts";
import { SinkStep, sinkDone, sinkCont, isSinkDone } from "./step";
import { ConcurrentQueue } from "../queue";
import * as T from "../effect";
import { effect } from "../effect";

export interface Sink<R, E, S, A, B> {
  readonly initial: T.Effect<R, E, SinkStep<A, S>>;
  step: (state: S, next: A) => T.Effect<R, E, SinkStep<A, S>>;
  extract: (step: S) => T.Effect<R, E, B>;
}

export interface SinkPure<S, A, B> {
  readonly initial: SinkStep<A, S>;
  step: (state: S, next: A) => SinkStep<A, S>;
  extract: (state: S) => B;
}

/**
 * Step a sink repeatedly.
 * If the sink completes before consuming all of the input, then the done state will include the ops leftovers
 * and anything left in the array
 * @param sink
 * @param s
 * @param multi
 */
export function stepMany<R, E, S, A, B>(
  sink: Sink<R, E, S, A, B>,
  s: S,
  multi: readonly A[]
): T.Effect<R, E, SinkStep<A, S>> {
  function go(current: SinkStep<A, S>, i: number): T.Effect<R, E, SinkStep<A, S>> {
    if (i === multi.length) {
      return T.pure(current);
    } else if (isSinkDone(current)) {
      return T.pure(sinkDone(current.state, current.leftover.concat(multi.slice(i))));
    } else {
      return effect.chain(sink.step(current.state, multi[i]), (next) => go(next, i + 1));
    }
  }
  return go(sinkCont(s), 0);
}

export function liftPureSink<S, A, B>(sink: SinkPure<S, A, B>): Sink<T.NoEnv, T.NoErr, S, A, B> {
  return {
    initial: T.pure(sink.initial),
    step: (state: S, next: A) => T.pure(sink.step(state, next)),
    extract: F.flow(sink.extract, T.pure)
  };
}

export function collectArraySink<R, E, A>(): Sink<R, E, A[], A, A[]> {
  const initial = T.pure(sinkCont([] as A[]));

  function step(state: A[], next: A): T.Effect<R, E, SinkStep<never, A[]>> {
    return T.pure(sinkCont([...state, next]));
  }

  return { initial, extract: T.pure, step };
}

export function drainSink<R, E, A>(): Sink<R, E, void, A, void> {
  const initial = T.pure(sinkCont(undefined));
  const extract = F.constant(T.unit);
  function step(_state: void, _next: A): T.Effect<R, E, SinkStep<never, void>> {
    return T.pure(sinkCont(undefined));
  }
  return { initial, extract, step };
}

/**
 * A sink that consumes no input to produce a constant b
 * @param b
 */
export function constSink<R, E, A, B>(b: B): Sink<R, E, void, A, B> {
  const initial = T.pure(sinkDone(undefined as void, []));
  const extract = F.constant(T.pure(b));
  function step(_state: void, _next: A): T.Effect<R, E, SinkStep<any, void>> {
    return T.pure(sinkDone(undefined as void, []));
  }
  return { initial, extract, step };
}

/**
 * A sink that produces the head element of a stream (if any elements are emitted)
 */
export function headSink<R, E, A>(): Sink<R, E, O.Option<A>, A, O.Option<A>> {
  const initial = T.pure(sinkCont(O.none));

  function step(_state: O.Option<A>, next: A): T.Effect<R, E, SinkStep<any, O.Option<A>>> {
    return T.pure(sinkDone(O.some(next), []));
  }
  return { initial, extract: T.pure, step };
}

/**
 * A sink that produces the last element of a stream (if any elements are emitted)
 */
export function lastSink<R, E, A>(): Sink<R, E, O.Option<A>, A, O.Option<A>> {
  const initial = T.pure(sinkCont(O.none));

  function step(_state: O.Option<A>, next: A): T.Effect<R, E, SinkStep<never, O.Option<A>>> {
    return T.pure(sinkCont(O.some(next)));
  }
  return { initial, extract: T.pure, step };
}

/**
 * A sink that evalutes an action for every element of a sink and produces no value
 * @param f
 */
export function evalSink<R, E, A>(
  f: F.FunctionN<[A], T.Effect<R, E, unknown>>
): Sink<R, E, void, A, void> {
  const initial = T.pure(sinkCont(undefined as void));

  function step(_state: void, next: A): T.Effect<R, E, SinkStep<never, void>> {
    return P.pipe(
      f(next),
      T.apSecond(T.pure(sinkCont(_state)) as T.Effect<R, E, SinkStep<never, void>>)
    );
  }

  const extract = F.constant(T.unit);

  return { initial, extract, step };
}

/**
 * A sink that consumes elements for which a predicate does not hold.
 *
 * Returns the first element for which the predicate did hold if such an element is found.
 * @param f
 */
export function drainWhileSink<R, E, A>(
  f: F.Predicate<A>
): Sink<R, E, O.Option<A>, A, O.Option<A>> {
  const initial = sinkCont(O.none as O.Option<A>);

  function step(_state: O.Option<A>, a: A): SinkStep<any, O.Option<A>> {
    return f(a) ? sinkCont(O.none) : sinkDone(O.some(a), []);
  }

  const extract = F.identity;

  return liftPureSink({ initial, extract, step });
}

/**
 * A sink that offers elements into a concurrent queue
 *
 * @param queue
 */
export function queueSink<R, E, A>(
  queue: ConcurrentQueue<A>
): Sink<T.AsyncContext & R, E, void, A, void> {
  const initial = T.pure(sinkCont(undefined));

  function step(_state: void, a: A): T.Effect<T.AsyncContext & R, E, SinkStep<A, void>> {
    return T.as(queue.offer(a), sinkCont(undefined));
  }

  const extract = F.constant(T.unit);
  return { initial, extract, step };
}

/**
 * A sink that offers elements into a queue after wrapping them in an option.
 *
 * The sink will offer one final none into the queue when the stream terminates
 * @param queue
 */
export function queueOptionSink<R, E, A>(
  queue: ConcurrentQueue<O.Option<A>>
): Sink<T.AsyncContext & R, E, void, A, void> {
  const initial = T.pure(sinkCont(undefined));

  function step(_state: void, a: A): T.Effect<T.AsyncContext & R, E, SinkStep<A, void>> {
    return T.as(queue.offer(O.some(a)), sinkCont(undefined));
  }

  const extract = F.constant(queue.offer(O.none));
  return { initial, extract, step };
}

/**
 * Map the output value of a sink
 * @param sink
 * @param f
 */
export function map<R, E, S, A, B, C>(
  sink: Sink<R, E, S, A, B>,
  f: F.FunctionN<[B], C>
): Sink<R, E, S, A, C> {
  return {
    ...sink,
    extract: F.flow(sink.extract, T.map(f))
  };
}
