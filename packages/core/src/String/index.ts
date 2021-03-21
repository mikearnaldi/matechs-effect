// tracing: off

import "../Operator"

/**
 * Partially Ported from https://github.com/samhh/fp-ts-std
 * Partially Ported from https://github.com/0x706b/principia
 */
import * as A from "../Array"
import { pipe } from "../Function"
import type { Sum } from "../Newtype"
import { StringSum } from "../Newtype"
import * as NA from "../NonEmptyArray"
import * as O from "../Option"
import * as Eq from "../Prelude/Equal"
import * as C from "../Structure/Closure"
import * as I from "../Structure/Identity"

export const SumClosure = C.makeClosure<Sum<string>>((l, r) =>
  StringSum.wrap(`${StringSum.unwrap(l)}${StringSum.unwrap(r)}`)
)

export const SumIdentity = I.makeIdentity(StringSum.wrap(""), SumClosure.combine)

export const Equal = Eq.strict<string>()

/**
 * Check if a value is a string
 */
export function isString(u: unknown): u is string {
  return typeof u === "string"
}

/**
 * Check is a string is empty
 */
export function isEmpty(s: string): boolean {
  return s === ""
}

/**
 * Check if a string contains the given substring
 */
export function contains_(s: string, substr: string): boolean {
  return s.includes(substr)
}

/**
 * Check if a string contains the given substring
 *
 * @dataFirst contains_
 */
export function contains(substr: string): (s: string) => boolean {
  return (s) => s.includes(substr)
}

/**
 * Check if a string starts with the given substring
 */
export function startsWith_(s: string, substr: string): boolean {
  return s.startsWith(substr)
}

/**
 * Check if a string starts with the given substring
 *
 * @dataFirst startsWith_
 */
export function startsWith(substr: string): (s: string) => boolean {
  return (s) => startsWith_(s, substr)
}

/**
 * Check if a string ends with the given substring
 */
export function endsWith_(s: string, substr: string): boolean {
  return s.endsWith(substr)
}

/**
 * Check if a string ends with the given substring
 *
 * @dataFirst endsWith_
 */
export function endsWith(substr: string): (s: string) => boolean {
  return (s) => endsWith_(s, substr)
}

/**
 * The empty string
 */
export const empty = ""

/**
 * Converts a number into a string
 */
export function fromNumber(x: number): string {
  return String(x)
}

/**
 * Trim whitespace from both sides of a string
 */
export function trim(s: string): string {
  return s.trim()
}

/**
 * Trim whitespace from the left side of the string
 */
export function trimLeft(s: string): string {
  return s.trimLeft()
}

/**
 * Trim whitespace from the right side of the string
 */
export function trimRight(s: string): string {
  return s.trimRight()
}

/**
 * Prepend one string to another
 */
export function prepend_(s: string, prepend: string): string {
  return prepend + s
}

/**
 * Prepend one string to another
 *
 * @dataFirst prepend_
 */
export function prepend(prepend: string): (s: string) => string {
  return (s) => prepend + s
}

/**
 * Removes the given string from the beginning, if it exists
 */
export function unprepend_(s: string, s1: string): string {
  return s.startsWith(s1) ? s.substr(s1.length) : s
}

/**
 * Removes the given string from the beginning, if it exists
 *
 * @dataFirst unprepend_
 */
export function unprepend(s1: string): (s: string) => string {
  return (s) => unprepend_(s, s1)
}

/**
 * Append one string to another.
 */
export function append_(s: string, x: string): string {
  return s + x
}

/**
 * Append one string to another.
 *
 * @dataFirst append_
 */
export function append(x: string): (s: string) => string {
  return (s) => s + x
}

/**
 * Remove the end of a string, if it exists.
 */
export function unappend_(s: string, x: string): string {
  return s.endsWith(x) ? s.substring(0, s.lastIndexOf(x)) : s
}

/**
 * Remove the end of a string, if it exists.
 *
 * @dataFirst unappend_
 */
export function unappend(x: string): (s: string) => string {
  return (s) => unappend_(s, x)
}

/**
 * Surround a string. Equivalent to calling `prepend` and `append` with the
 * same outer value.
 */
export function surround_(s: string, x: string): string {
  return pipe(s, prepend(x), append(x))
}

/**
 * Surround a string. Equivalent to calling `prepend` and `append` with the
 * same outer value.
 *
 * @dataFirst surround_
 */
export function surround(x: string): (s: string) => string {
  return (s) => surround_(s, x)
}

/**
 * Remove the start and end of a string, if they both exist.
 */
export function unsurround_(s: string, x: string): string {
  return s.startsWith(x) && s.endsWith(x) ? pipe(s, unprepend(x), unappend(x)) : s
}

/**
 * Remove the start and end of a string, if they both exist.
 *
 * @dataFirst unsurround_
 */
export function unsurround(x: string): (s: string) => string {
  return (s) => unsurround_(s, x)
}

/**
 * Returns the substring between the start index (inclusive) and the end index
 * (exclusive).
 */
export function slice_(s: string, start: number, end: number): string {
  return s.slice(start, end)
}

/**
 * Returns the substring between the start index (inclusive) and the end index
 * (exclusive).
 *
 * @dataFirst slice_
 */
export function slice(start: number, end: number): (s: string) => string {
  return (s) => s.slice(start, end)
}

/**
 * Keep the specified number of characters from the start of a string.
 *
 * If `n` is larger than the available number of characters, the string will
 * be returned whole.
 *
 * If `n` is not a positive number, an empty string will be returned.
 *
 * If `n` is a float, it will be rounded down to the nearest integer.
 */
export function takeLeft_(s: string, n: number): string {
  return s.slice(0, Math.max(n, 0))
}

/**
 * Keep the specified number of characters from the start of a string.
 *
 * If `n` is larger than the available number of characters, the string will
 * be returned whole.
 *
 * If `n` is not a positive number, an empty string will be returned.
 *
 * If `n` is a float, it will be rounded down to the nearest integer.
 *
 * @dataFirst takeLeft_
 */
export function takeLeft(n: number): (s: string) => string {
  return (s) => takeLeft_(s, n)
}

/**
 * Keep the specified number of characters from the end of a string.
 *
 * If `n` is larger than the available number of characters, the string will
 * be returned whole.
 *
 * If `n` is not a positive number, an empty string will be returned.
 *
 * If `n` is a float, it will be rounded down to the nearest integer.
 */
export function takeRight_(s: string, n: number): string {
  return s.slice(Math.max(0, s.length - Math.floor(n)), Infinity)
}

/**
 * Keep the specified number of characters from the end of a string.
 *
 * If `n` is larger than the available number of characters, the string will
 * be returned whole.
 *
 * If `n` is not a positive number, an empty string will be returned.
 *
 * If `n` is a float, it will be rounded down to the nearest integer.
 *
 * @dataFirst takeRight_
 */
export function takeRight(n: number): (s: string) => string {
  return (s) => takeRight_(s, n)
}

/**
 * Match a string with a RegExp
 */
export function match_(s: string, r: RegExp): O.Option<RegExpMatchArray> {
  return O.fromNullable(s.match(r))
}

/**
 * Match a string with a RegExp
 *
 * @dataFirst match_
 */
export function match(r: RegExp): (s: string) => O.Option<RegExpMatchArray> {
  return (s) => match_(s, r)
}

/**
 * Match a string with a global RegExp
 */
export function matchAll_(
  s: string,
  r: RegExp
): O.Option<NA.NonEmptyArray<RegExpMatchArray>> {
  return O.chain_(O.fromNullable(s.matchAll(r)), (x) => pipe(x, A.from, NA.fromArray))
}

/**
 * Matches a string with a global RegExp
 *
 * @dataFirst matchAll_
 */
export function matchAll(
  r: RegExp
): (s: string) => O.Option<NA.NonEmptyArray<RegExpMatchArray>> {
  return (s) => matchAll_(s, r)
}

/**
 * Split a string into substrings using the specified separator and return them
 * as an array.
 */
export function split_(s: string, on: string | RegExp): A.Array<string> {
  return s.split(on)
}

/**
 * Split a string into substrings using the specified separator and return them
 * as an array.
 *
 * @dataFirst split_
 */
export function split(on: string | RegExp): (s: string) => A.Array<string> {
  return (s) => s.split(on)
}

/**
 * Apply an endomorphism upon an array of characters against a string.
 * This is useful as it allows you to run many polymorphic functions targeting
 * arrays against strings without having to rewrite them.
 */
export function under_(
  s: string,
  f: (chars: A.Array<string>) => A.Array<string>
): string {
  return pipe(s, split(""), f, A.join(""))
}

/**
 * Apply an endomorphism upon an array of characters against a string.
 * This is useful as it allows you to run many polymorphic functions targeting
 * arrays against strings without having to rewrite them.
 *
 * @dataFirst under_
 */
export function under(
  f: (chars: A.Array<string>) => A.Array<string>
): (s: string) => string {
  return (s) => under_(s, f)
}

/**
 * Reverse a string
 */
export function reverse(s: string): string {
  return under_(s, A.reverse)
}

/**
 * Split a string into substrings using any recognised newline as the separator.
 */
export function lines(s: string): A.Array<string> {
  return split_(s, /\r\n|\r|\n/)
}

/**
 * Join newline-separated strings together.
 */
export function unlines(as: A.Array<string>): string {
  return A.join_(as, "\n")
}

/**
 * Test a string with a RegExp
 */
export function test_(s: string, r: RegExp): boolean {
  return r.test(s)
}

/**
 * Test a string with a RegExp
 *
 * @dataFirst test_
 */
export function test(r: RegExp): (s: string) => boolean {
  return (s) => r.test(s)
}

/**
 * Replace the first (or all, with a global RegExp) occurrence of a matched substring with a replacement.
 */
export function replace_(s: string, test: string | RegExp, r: string): string {
  return s.replace(test, r)
}

/**
 * Replace the first (or all, with a global RegExp) occurrence of a matched substring with a replacement.
 *
 * @dataFirst replace_
 */
export function replace(test: string | RegExp, r: string): (s: string) => string {
  return (s) => s.replace(test, r)
}
