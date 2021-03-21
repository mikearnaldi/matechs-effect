// tracing: off

import "../Operator"

import type { Effect, EffectURI } from "@effect-ts/system/Effect"

import type { Array } from "../Array"
import type { Async } from "../Async"
import type { Const } from "../Const"
import type { Dictionary } from "../Dictionary"
import type { Layer } from "../Effect/Layer"
import type { Either } from "../Either"
import type { FreeAssociative } from "../FreeAssociative"
import type { Id } from "../Id"
import type { IO } from "../IO"
import type { List } from "../List"
import type { NonEmptyArray } from "../NonEmptyArray"
import type { Option } from "../Option"
import type { Bounded } from "../Prelude/Bounded"
import type { Equal } from "../Prelude/Equal"
import type { Ord } from "../Prelude/Ord"
import type { Show } from "../Prelude/Show"
import type { Reader } from "../Reader"
import type { Tree } from "../RoseTree"
import type { Closure } from "../Structure/Closure"
import type { Commutative } from "../Structure/Commutative"
import type { Identity } from "../Structure/Identity"
import type { Inverse } from "../Structure/Inverse"
import type { Sync } from "../Sync"
import type { Ix, IxC } from "../Transformer/IndexedT"
import type { StateIn, StateOut } from "../Transformer/StateT/Classic"
import type { XPure } from "../XPure"
import type { XIO } from "../XPure/XIO"
import type { XReader } from "../XPure/XReader"
import type { XState } from "../XPure/XState"

export { EffectURI } from "@effect-ts/system/Effect"

export const ArrayURI = "Array"
export type ArrayURI = typeof ArrayURI

export const NonEmptyArrayURI = "NonEmptyArray"
export type NonEmptyArrayURI = typeof NonEmptyArrayURI

export const BoundedURI = "Bounded"
export type BoundedURI = typeof BoundedURI

export const ClosureURI = "Closure"
export type ClosureURI = typeof ClosureURI

export const CommutativeURI = "Commutative"
export type CommutativeURI = typeof CommutativeURI

export const EitherURI = "Either"
export type EitherURI = typeof EitherURI

export const EqualURI = "Equal"
export type EqualURI = typeof EqualURI

export const IdentityURI = "Identity"
export type IdentityURI = typeof IdentityURI

export const InverseURI = "Inverse"
export type InverseURI = typeof InverseURI

export const IterableURI = "IterableURI"
export type IterableURI = typeof IterableURI

export const OrdURI = "Ord"
export type OrdURI = typeof OrdURI

export const DictionaryURI = "Dictionary"
export type DictionaryURI = typeof DictionaryURI

export const ShowURI = "Show"
export type ShowURI = typeof ShowURI

export const XIOURI = "XIO"
export type XIOURI = typeof XIOURI

export const XReaderURI = "XReader"
export type XReaderURI = typeof XReaderURI

export const XStateURI = "XState"
export type XStateURI = typeof XStateURI

export const ReaderURI = "Reader"
export type ReaderURI = typeof ReaderURI

export const StateInURI = "StateIn"
export type StateInURI = typeof StateInURI

export const ParametricStateInURI = "ParametricStateIn"
export type ParametricStateInURI = typeof ParametricStateInURI

export const StateOutURI = "StateOut"
export type StateOutURI = typeof StateOutURI

export const IxURI = "Ix"
export type IxURI = typeof IxURI

export const TaskURI = "Task"
export type TaskURI = typeof TaskURI

export const ConstURI = "Const"
export type ConstURI = typeof ConstURI

export const LayerURI = "Layer"
export type LayerURI = typeof LayerURI

export const SyncURI = "Sync"
export type SyncURI = typeof SyncURI

export const XPureURI = "XPure"
export type XPureURI = typeof XPureURI

export const IOURI = "IO"
export type IOURI = typeof IOURI

export const XPureReaderCategoryURI = "XPureReaderCategory"
export type XPureReaderCategoryURI = typeof XPureReaderCategoryURI

export const XPureStateCategoryURI = "XPureStateCategory"
export type XPureStateCategoryURI = typeof XPureStateCategoryURI

export const IdURI = "Id"
export type IdURI = typeof IdURI

export const EffectCategoryURI = "EffectCategory"
export type EffectCategoryURI = typeof EffectCategoryURI

export const FreeAssociativeURI = "FreeAssociative"
export type FreeAssociativeURI = typeof FreeAssociativeURI

export const AsyncURI = "Async"
export type AsyncURI = typeof AsyncURI

export const TreeURI = "Tree"
export type TreeURI = typeof TreeURI

export const OptionURI = "Option"
export type OptionURI = typeof OptionURI

export const ListURI = "List"
export type ListURI = typeof ListURI

declare module "../Prelude/HKT" {
  interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    [ArrayURI]: Array<A>
    [BoundedURI]: Bounded<A>
    [ClosureURI]: Closure<A>
    [CommutativeURI]: Commutative<A>
    [EitherURI]: Either<E, A>
    [EqualURI]: Equal<A>
    [IdentityURI]: Identity<A>
    [InverseURI]: Inverse<A>
    [IterableURI]: Iterable<A>
    [OrdURI]: Ord<A>
    [DictionaryURI]: Dictionary<A>
    [ShowURI]: Show<A>
    [EffectURI]: Effect<R, E, A>
    [EffectCategoryURI]: Effect<I, E, A>
    [XIOURI]: XIO<A>
    [XReaderURI]: XReader<R, A>
    [XStateURI]: XState<S, A>
    [ReaderURI]: Reader<R, A>
    [ConstURI]: Const<E, A>
    [LayerURI]: Layer<R, E, A>
    [SyncURI]: Sync<R, E, A>
    [XPureURI]: XPure<S, S, R, E, A>
    [XPureReaderCategoryURI]: XPure<S, S, I, E, A>
    [XPureStateCategoryURI]: XPure<I, A, R, E, A>
    [IdURI]: Id<A>
    [NonEmptyArrayURI]: NonEmptyArray<A>
    [FreeAssociativeURI]: FreeAssociative<A>
    [AsyncURI]: Async<R, E, A>
    [TreeURI]: Tree<A>
    [OptionURI]: Option<A>
    [ListURI]: List<A>
    [IOURI]: IO<A>
    [StateInURI]: StateIn<S, A>
    [StateOutURI]: StateOut<S, A>
    [IxURI]: TC extends IxC<infer _I, infer _O> ? Ix<_I, _O, A> : any
  }
  interface URItoIndex<K> {
    [ListURI]: number
    [ArrayURI]: number
    [NonEmptyArrayURI]: number
    [DictionaryURI]: string
  }
}
