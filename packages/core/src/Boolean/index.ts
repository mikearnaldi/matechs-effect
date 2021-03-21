// tracing: off

import "../Operator"

/**
 * Partially Ported from https://github.com/samhh/fp-ts-std
 * Partially Ported from https://github.com/0x706b/principia
 */
import * as A from "../Array"
import type { Predicate } from "../Function"
import type { Prod, Sum } from "../Newtype"
import { And, BooleanProd, BooleanSum, Or } from "../Newtype"
import * as Eq from "../Prelude/Equal"
import * as C from "../Structure/Closure"
import * as I from "../Structure/Identity"

export const ConjunctionClosure = C.makeClosure<And>((l, r) =>
  And.wrap(And.unwrap(l) && And.unwrap(r))
)

export const DisjunctionClosure = C.makeClosure<Or>((l, r) =>
  Or.wrap(Or.unwrap(l) || Or.unwrap(r))
)

export const ProdClosure = C.makeClosure<Prod<boolean>>((l, r) =>
  BooleanProd.wrap(BooleanProd.unwrap(l) && BooleanProd.unwrap(r))
)

export const SumClosure = C.makeClosure<Sum<boolean>>((l, r) =>
  BooleanSum.wrap(BooleanSum.unwrap(l) || BooleanSum.unwrap(r))
)

export const ConjunctionIdentity = I.makeIdentity(
  And.wrap(true),
  ConjunctionClosure.combine
)

export const DisjunctionIdentity = I.makeIdentity(
  Or.wrap(false),
  DisjunctionClosure.combine
)

export const ProdIdentity = I.makeIdentity(BooleanProd.wrap(false), ProdClosure.combine)

export const SumIdentity = I.makeIdentity(BooleanSum.wrap(false), SumClosure.combine)

export const Equal = Eq.strict<boolean>()

export function fold<A, B>(
  onFalse: () => A,
  onTrue: () => B
): (value: boolean) => A | B {
  return (value) => (value ? onTrue() : onFalse())
}

export function not(a: boolean) {
  return !a
}

export function invert(b: boolean): boolean {
  return !b
}

export function and_(x: boolean, y: boolean): boolean {
  return x && y
}

export function and(y: boolean): (x: boolean) => boolean {
  return (x) => x && y
}

export function or_(x: boolean, y: boolean): boolean {
  return x || y
}

export function or(y: boolean): (x: boolean) => boolean {
  return (x) => x || y
}

export function xor_(x: boolean, y: boolean): boolean {
  return (x && !y) || (!x && y)
}

export function xor(y: boolean): (x: boolean) => boolean {
  return (x) => (x && !y) || (!x && y)
}

export function allPass_<A>(a: A, ps: A.Array<Predicate<A>>): boolean {
  return ps.every((f) => f(a))
}

export function allPass<A>(ps: A.Array<Predicate<A>>): (a: A) => boolean {
  return (a) => ps.every((f) => f(a))
}

export function anyPass_<A>(a: A, ps: A.Array<Predicate<A>>): boolean {
  return ps.some((f) => f(a))
}

export function anyPass<A>(ps: A.Array<Predicate<A>>): (a: A) => boolean {
  return (a) => ps.some((f) => f(a))
}

export function andPass_<A>(f: Predicate<A>, g: Predicate<A>): Predicate<A> {
  return (a) => and_(f(a), g(a))
}

export function andPass<A>(g: Predicate<A>): (f: Predicate<A>) => Predicate<A> {
  return (f) => andPass_(f, g)
}

export function orPass_<A>(f: Predicate<A>, g: Predicate<A>): Predicate<A> {
  return (a) => or_(f(a), g(a))
}

export function orPass<A>(g: Predicate<A>): (f: Predicate<A>) => Predicate<A> {
  return (f) => orPass_(f, g)
}
