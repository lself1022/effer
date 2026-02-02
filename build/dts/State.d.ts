/**
 * @since 1.0.0
 */
import { Data, Effect, Stream } from "effect";
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
/**
 * @since 1.0.0
 */
export type Result<A, E> = Data.TaggedEnum<{
    Loading: {};
    Success: {
        readonly data: A;
    };
    Failure: {
        readonly error: E;
    };
}> & {};
/**
 * @since 1.0.0
 */
export declare const async: <A, E, R>(effect: Effect.Effect<A, E, R>) => {
    stream: Stream.Stream<Result<A, E>, never, R>;
    is: <Tag extends "Loading" | "Success" | "Failure">(tag: Tag) => (u: unknown) => u is Extract<{
        readonly _tag: "Loading";
    }, {
        readonly _tag: Tag;
    }> | Extract<{
        readonly _tag: "Success";
        readonly data: A;
    }, {
        readonly _tag: Tag;
    }> | Extract<{
        readonly _tag: "Failure";
        readonly error: E;
    }, {
        readonly _tag: Tag;
    }>;
    match: {
        <const Cases extends {
            readonly Loading: (args: {
                readonly _tag: "Loading";
            }) => any;
            readonly Success: (args: {
                readonly _tag: "Success";
                readonly data: A;
            }) => any;
            readonly Failure: (args: {
                readonly _tag: "Failure";
                readonly error: E;
            }) => any;
        }>(cases: Cases & { [K in Exclude<keyof Cases, "Loading" | "Success" | "Failure">]: never; }): (value: Result<A, E>) => import("effect/Unify").Unify<ReturnType<Cases["Loading" | "Success" | "Failure"]>>;
        <const Cases extends {
            readonly Loading: (args: {
                readonly _tag: "Loading";
            }) => any;
            readonly Success: (args: {
                readonly _tag: "Success";
                readonly data: A;
            }) => any;
            readonly Failure: (args: {
                readonly _tag: "Failure";
                readonly error: E;
            }) => any;
        }>(value: Result<A, E>, cases: Cases & { [K in Exclude<keyof Cases, "Loading" | "Success" | "Failure">]: never; }): import("effect/Unify").Unify<ReturnType<Cases["Loading" | "Success" | "Failure"]>>;
    };
};
//# sourceMappingURL=State.d.ts.map