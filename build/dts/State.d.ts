/**
 * @since 1.0.0
 */
import { Effect, Stream } from "effect";
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
 * const {stream, dispatch} = yield* State.reducer(0, counterReducer)
 * ```
 */
export declare const reducer: <A, M, E = never, R = never>(initialState: A, updateFn: (state: A, msg: M) => Effect.Effect<A, E, R>) => Effect.Effect<{
    stream: Stream.Stream<A, never, never>;
    dispatch: (msg: M) => boolean;
}, never, R>;
/**
 * @since 1.0.0
 */
export declare const simple: <A>(initialState: A) => Effect.Effect<{
    readonly stream: Stream.Stream<A, never, never>;
    readonly set: (val: A) => boolean;
    readonly update: (updateFn: (oldValue: A) => A) => boolean;
}, never, never>;
export type Loading = {
    _tag: 'Loading';
};
export declare const Loading: () => void;
/**
 * @since 1.0.0
 */
export declare const async: <A, E, R>(effect: Effect.Effect<A, E, R>) => {
    stream: Stream.Stream<void | import("effect/Result").Result<A, E>, never, R>;
};
//# sourceMappingURL=State.d.ts.map