// tracing: off

import * as P from "../Prelude"
import { ForEach } from "./instances"

/**
 * Like traverse(identity)
 */

export const sequence = P.sequenceF(ForEach)
/**
 * Matchers
 */
export const { match, matchIn, matchMorph, matchTag, matchTagIn } = P.matchers(ForEach)

/**
 * Conditionals
 */
const branch = P.conditionalF(ForEach)
const branch_ = P.conditionalF_(ForEach)

export { branch as if, branch_ as if_ }
