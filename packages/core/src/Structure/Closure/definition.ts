// tracing: off

/**
 * Base combine
 */
export interface Closure<A> {
  readonly _Closure: "Closure"
  readonly combine: (x: A, y: A) => A
}
