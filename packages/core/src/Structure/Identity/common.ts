// tracing: off

import * as A from "../Associative/common"
import type { Identity } from "./definition"
import { makeIdentity } from "./makeIdentity"

/**
 * Derive `Identity` from `Associative` and `identity`
 */
export function fromAssociative<A>(A: A.Associative<A>) {
  return (identity: A) => makeIdentity(identity, A.combine)
}

/**
 * Boolean `Identity` under conjunction
 */
export const all: Identity<boolean> = makeIdentity(true, A.all.combine)

/**
 * Boolean `Identity` under disjunction
 */
export const any: Identity<boolean> = fromAssociative(A.any)(false)

/**
 * Number `Identity` under multiplication
 */
export const product: Identity<number> = fromAssociative(A.product)(1)

/**
 * String `Identity` under concatenation
 */
export const string: Identity<string> = fromAssociative(A.string)("")

/**
 * Number `Identity` under addition
 */
export const sum: Identity<number> = fromAssociative(A.sum)(0)

/**
 * Void `Identity`
 */
const void_: Identity<void> = fromAssociative(A.void)(undefined)

export { void_ as void }
