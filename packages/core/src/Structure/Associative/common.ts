// tracing: off

import type { Associative } from "./makeAssociative"
import { makeAssociative } from "./makeAssociative"

/**
 * Boolean `Associative`  under conjunction
 */
export const all: Associative<boolean> = makeAssociative((x, y) => x && y)

/**
 * Boolean `Associative` under disjunction
 */
export const any: Associative<boolean> = makeAssociative((x, y) => x || y)

/**
 * Number `Associative` under addition
 */
export const sum: Associative<number> = makeAssociative((x, y) => x + y)

/**
 * Number `Associative` under multiplication
 */
export const product: Associative<number> = makeAssociative((x, y) => x * y)

/**
 * String `Associative` under concatenation
 */
export const string: Associative<string> = makeAssociative((x, y) => x + y)

/**
 * Void `Associative`
 */
const void_: Associative<void> = makeAssociative(() => undefined as void)

export * from "./definition"
export { void_ as void }
