import { Chunk, Context, Data, Effect, Layer, Queue, Ref, Stream, SubscriptionRef, Unify } from "effect";
import { NoSuchElementException } from "effect/Cause";
import { type Channel } from "effect/Channel";
import { type PubSub } from "effect/PubSub";
import { type TemplateResult as _TemplateResult } from "lit-html";
import type { DirectiveClass, DirectiveResult as _DirectiveResult } from "lit-html/directive.js";
import { AsyncReplaceDirective as _AsyncReplaceDirective } from "lit-html/directives/async-replace.js";
/**
 * Create an HTML template result that can be rendered to the DOM
 */
export declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => _TemplateResult<1>;
/**
 * Renders a template result to the container
 */
export declare const render: {
    (value: unknown, container: import("lit-html").RenderRootNode, options?: import("lit-html").RenderOptions): import("lit-html").RootPart;
    setSanitizer: (newSanitizer: import("lit-html").SanitizerFactory) => void;
    createSanitizer: import("lit-html").SanitizerFactory;
    _testOnlyClearSanitizerFactoryDoNotCallOrElse: () => void;
};
export type TemplateResult = _TemplateResult;
export type DirectiveResult<C extends DirectiveClass = DirectiveClass> = _DirectiveResult<C>;
export declare class AsyncReplaceDirective extends _AsyncReplaceDirective {
}
/**
 * Types that can be attached to the DOM template using Effer's 'attach' method
 */
export type Attachable<A, E, R> = Channel<Chunk.Chunk<A>, unknown, E, unknown, unknown, unknown, R> | Effect.Effect<A, E, R> | SubscriptionRef.SubscriptionRef<A> | PubSub<A> | Queue.Queue<A> | Stream.Stream<A, E, R>;
declare const Effer_base: Effect.Service.Class<Effer, "Effer", {
    readonly effect: Effect.Effect<{
        /**
         * Attaches any Attachable value to the template:
         * ```ts
         * const Counter = () => Effect.gen(function*() {
         *   [ countRef, countQueue ] = yield* CounterService // service made with makeReducer or makeState
         *
         *   return html`
         *     <p>The count is ${yield* attach(countRef)}</p>
         *   `
         * })
         * ```
         */
        attach: <A, E = never, R = never>(val: Attachable<A, E, R>) => Effect.Effect<_DirectiveResult<typeof _AsyncReplaceDirective>, never, R>;
        /**
         * Used in place of an event handler callback, this function takes a queue to dispatch messages to,
         * as well as a mapping function from the DOM event to the queue's expected event type
         * ```ts
         * const Counter = () => Effect.gen(function*() {
         *   [ countRef, countQueue ] = yield* CounterService // service made with makeReducer
         *
         *   return html`
         *     <button
         *       ＠click=${queueMsg(countQueue, () => Increment())}
         *     > // Increment() is an action defined as part of the CounterService reducer
         *       The count is ${yield* attach(countRef)}
         *     </button>
         *   `
         * })
         * ```
         */
        queueMsg: <DOMEvent, Msg>(offer: (msg: Msg) => boolean, mapper?: (e: DOMEvent) => Msg) => ((msg: Msg) => boolean) | ((e: DOMEvent) => boolean);
    }, never, never>;
}>;
/**
 * The Effer service provides methods for attaching Attachable values to the template and queueing events
 */
export declare class Effer extends Effer_base {
}
/**
 * Creates a stream of the latest state value, and a queue to update the value.
 * @param initialState The starting state value
 * @param updateFn An effectful function that takes the old state, an update message, and returns a new state
 * @returns A tuple of the stream of the current state value and a queue to dispatch update messages
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
 * const [ countStream, countQueue ] = yield* makeReducer(0, counterReducer)
 * ```
 */
export declare const makeReducer: <A, M, E = never, R = never>(initialState: A, updateFn: (state: A, msg: M) => Effect.Effect<A, E, R>) => Effect.Effect<{
    stream: Stream.Stream<A, never, never>;
    dispatch: (msg: M) => boolean;
}, never, R>;
export declare const makeState: <A>(initialState: A) => Effect.Effect<{
    readonly stream: Stream.Stream<A, never, never>;
    readonly set: (val: A) => boolean;
    readonly update: (updateFn: (oldValue: A) => A) => boolean;
}, never, never>;
declare const NavService_base: Context.TagClass<NavService, "NavService", {
    url: Ref.Ref<URL>;
    pathStream: Stream.Stream<URL>;
    getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementException, never>;
    navigate: typeof window.navigation.navigate;
}>;
/**
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export declare class NavService extends NavService_base {
    static Live: Layer.Layer<NavService, never, never>;
}
export type RemoteData<T, E> = Data.TaggedEnum<{
    Loading: {};
    Success: {
        readonly data: T;
    };
    Failure: {
        readonly error: E;
    };
}> & {};
export declare const makeAsyncResult: <A, E, R>(effect: Effect.Effect<A, E, R>) => {
    stream: Stream.Stream<RemoteData<A, E>, never, R>;
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
        }>(cases: Cases & { [K in Exclude<keyof Cases, "Loading" | "Success" | "Failure">]: never; }): (value: RemoteData<A, E>) => Unify.Unify<ReturnType<Cases["Loading" | "Success" | "Failure"]>>;
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
        }>(value: RemoteData<A, E>, cases: Cases & { [K in Exclude<keyof Cases, "Loading" | "Success" | "Failure">]: never; }): Unify.Unify<ReturnType<Cases["Loading" | "Success" | "Failure"]>>;
    };
};
export declare const layer: Layer.Layer<Effer | NavService, never, never>;
export {};
//# sourceMappingURL=index.d.ts.map