// tracing: off

import * as FA from "@effect-ts/system/FreeAssociative"

import type { FreeAssociativeURI } from "../Modules"
import type { URI } from "../Prelude"
import * as P from "../Prelude"
import { makeAssociative } from "../Structure/Associative"
import { makeIdentity } from "../Structure/Identity"

export function getAssociative<A>() {
  return makeAssociative<FA.FreeAssociative<A>>(FA.concat_)
}

export function getIdentity<A>() {
  return makeIdentity<FA.FreeAssociative<A>>(FA.init<A>(), FA.concat_)
}

export const Covariant = P.instance<P.Covariant<[URI<FreeAssociativeURI>]>>({
  map: FA.map
})

export const Filter = P.instance<P.Filter<[URI<FreeAssociativeURI>]>>({
  filter: FA.filter
})

export const FilterMap = P.instance<P.FilterMap<[URI<FreeAssociativeURI>]>>({
  filterMap: FA.filterMap
})
