/**
 * @since 1.0.0
 */

import { Data, Effect, Queue, Stream, SubscriptionRef } from "effect";

/**
 * @since 1.0.0
 * Creates a stream of the latest state value, and a queue to update the value.
 * @param initialState The starting state value
 * @param updateFn An effectful function that takes the old state, an update message, and returns a new state
 * @returns An object with a stream field representing a stream of the current state value and a dispatch method for dispatching update messages
 * 
 * ```ts
 * type Msg = Data.TaggedEnum<{
 *   Increment: {};
 *   Decrement: {};
 * }>
 * const { Increment, Decrement, $match } = Data.taggedEnum<Msg>()
 * const counterReducer = (state: number, msg: Msg) => $match({
 *   Increment: () => Effect.succeed(state + 1),
 *   Decrement: () => Effect.succeed(state - 1)
 * })
 * 
 * // Inside an Effect
 * const {stream, dispatch} = yield* reducer(0, counterReducer)
 * ```
 */
export const reducer = <A,M,E=never,R=never>(initialState: A, updateFn: (state: A, msg: M) => Effect.Effect<A,E,R>) => Effect.gen(function*() {
    const subRef = yield* SubscriptionRef.make<A>(initialState)
    const updateQueue = yield* Queue.unbounded<M>()

    yield* Effect.gen(function*() {
        const msg = yield* updateQueue.take
        yield* SubscriptionRef.updateEffect(subRef, state => updateFn(state, msg))
    }).pipe(
        Effect.forever,
        Effect.fork
    )
    const dispatch = (msg: M) => Queue.unsafeOffer(updateQueue, msg)

    return {stream: subRef.changes, dispatch}
})

/**
 * @since 1.0.0
 */
export const simple = <A>(initialState: A) => Effect.gen(function*() {
    const subRef = yield* SubscriptionRef.make<A>(initialState)
    const updateQueue = yield* Queue.unbounded<(val: A) => A>()

    yield* Effect.gen(function*() {
        const updateFn = yield* updateQueue.take
        yield* SubscriptionRef.update(subRef, updateFn)
    }).pipe(
        Effect.forever,
        Effect.fork
    )
    const set = (val: A) => Queue.unsafeOffer(updateQueue, _ => val) 
    const update = (updateFn: (oldValue: A) => A) => Queue.unsafeOffer(updateQueue,updateFn)
    return {stream: subRef.changes, set, update} as const
})

/**
 * @since 1.0.0
 */
export type Result<A,E> = Data.TaggedEnum<{
    Loading: {}
    Success: { readonly data: A }
    Failure: { readonly error: E }
}> & {}

/**
 * @since 1.0.0
 */
export const async = <A,E,R>(effect: Effect.Effect<A,E,R>) => {
    const { Loading, Success, Failure, $is, $match } = Data.taggedEnum<Result<A,E>>()
    const startStream = Stream.make(Loading())
    const resultStream: Stream.Stream<Result<A,E>,never,R> = Stream.asyncPush<Result<A,E>,never,R>(
        emit => Effect.gen(function*() {
            const result = yield* effect.pipe(
                Effect.map(data => Success({data})),
                Effect.mapError(error => Failure({error})),
                Effect.merge
            )
            emit.single(result)
        })
    )

    return {stream: Stream.concat(startStream, resultStream), is: $is, match: $match}
}