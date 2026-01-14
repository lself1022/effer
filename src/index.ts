import { Chunk, Console, Context, Data, Effect, Layer, Queue, Ref, Stream, SubscriptionRef, Unify } from "effect";
import { NoSuchElementException } from "effect/Cause";
import { type Channel, isChannel } from "effect/Channel";
import { isEffect } from "effect/Effect";
import { hasProperty } from "effect/Predicate";
import { type PubSub } from "effect/PubSub";
import { StreamTypeId } from "effect/Stream";
import { type TemplateResult as _TemplateResult, html as _html, render as _render } from "lit-html";
import type { DirectiveClass, DirectiveResult as _DirectiveResult } from "lit-html/directive.js";
import { AsyncReplaceDirective as _AsyncReplaceDirective, asyncReplace } from "lit-html/directives/async-replace.js";
import * as Nav from "@typed/navigation";
import { GetRandomValues } from "@typed/id";

/**
 * Create an HTML template result that can be rendered to the DOM
 */
export const html = _html
/**
 * Renders a template result to the container
 */
export const render = _render

export type TemplateResult = _TemplateResult
export type DirectiveResult<C extends DirectiveClass = DirectiveClass> = _DirectiveResult<C>
export class AsyncReplaceDirective extends _AsyncReplaceDirective {}

/**
 * Types that can be attached to the DOM template using Effer's 'attach' method
 */
export type Attachable<A,E,R> = 
    | Channel<Chunk.Chunk<A>, unknown, E, unknown, unknown, unknown, R> 
    | Effect.Effect<A,E,R> 
    | SubscriptionRef.SubscriptionRef<A>
    | PubSub<A> 
    | Queue.Queue<A> 
    | Stream.Stream<A,E,R>
const isQueue= <A>(val: unknown): val is Queue.Queue<A> => hasProperty(val, Unify.ignoreSymbol) && hasProperty(val[Unify.ignoreSymbol], 'Dequeue')
const isStream = <A,E,R>(val: unknown): val is Stream.Stream<A,E,R> => hasProperty(val, StreamTypeId)
const isSubscriptionRef = <A>(val: unknown): val is SubscriptionRef.SubscriptionRef<A> => hasProperty(val, SubscriptionRef.SubscriptionRefTypeId)

/**
 * The Effer service provides methods for attaching Attachable values to the template and queueing events
 */
export class Effer extends Effect.Service<Effer>()('Effer', {
    effect: Effect.gen(function*() {
        const attach = <A,E=never,R=never>(val: Attachable<A,E,R>) => {
            let stream: Stream.Stream<A,E,R>;
            if(isChannel(val)) {
                stream = Stream.fromChannel<A,E,R>(val)
            } else if (isSubscriptionRef<A>(val)) {
                stream = val.changes
            } else if(isEffect(val) && !isQueue<A>(val)) {
                stream = Stream.fromEffect(val)
            } else if(isQueue<A>(val)) {
                stream = Stream.fromQueue(val)
            } else if(isStream<A,E,R>(val)) {
                stream = val
            } else {
                stream = Stream.fromPubSub(val)
            }
            return stream.pipe(
                Stream.toAsyncIterableEffect,
                Effect.andThen(iter => asyncReplace(iter))
            )
        }
        const queueMsg = <DOMEvent, Msg>(offer: (msg: Msg) => boolean, mapper?: (e: DOMEvent) => Msg) => {
            if (mapper) {
                return (e: DOMEvent) => offer(mapper(e));
            }
            return offer;
        }

        return {
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
            attach,
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
            queueMsg
        }
    }),
    // dependencies: [Registry.layer]
}) {}

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
export const makeReducer = <A,M,E=never,R=never>(initialState: A, updateFn: (state: A, msg: M) => Effect.Effect<A,E,R>) => Effect.gen(function*() {
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

export const makeState = <A>(initialState: A) => Effect.gen(function*() {
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
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export class NavService extends Context.Tag('NavService')<
    NavService, 
    {
        url: Ref.Ref<URL>;
        pathStream: Stream.Stream<URL>;
        getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementException, never>
        navigate: typeof window.navigation.navigate;
    }
>() {
    static Live = Layer.effect(NavService, Effect.gen(function*() {
        const url = yield* Ref.make<URL>(new URL(window.navigation.currentEntry?.url!))
        const pathStream = Stream.fromEventListener<NavigateEvent>(window.navigation, 'navigate').pipe(
            Stream.map(e => new URL(e.destination.url)),
            Stream.merge(Stream.make(new URL(window.navigation.currentEntry?.url!))),
            Stream.tap(u => Ref.set(url, u))
        )
        const getQueryParam = (name: string) => Effect.gen(function*() {
            const result: string | null = (yield* Ref.get(url)).searchParams.get(name)
            if(result === null) {
                yield* Effect.fail(new NoSuchElementException())
            }
            return result!
        })
        return {
            /**
             * The current URL object
             */
            url,
            /**
             * A stream of the current app path ('/', '/actuator', etc.)
             */
            pathStream,
            /**
             * Method used to navigate. Accepts a URL string and navigates the page
             */
            navigate: window.navigation.navigate,
            /**
             * Get a value from the current URL's query params
             */
            getQueryParam
        }
    }))
}

export type Result<A,E> = Data.TaggedEnum<{
    Loading: {}
    Success: { readonly data: A }
    Failure: { readonly error: E }
}> & {}

export const makeAsyncResult = <A,E,R>(effect: Effect.Effect<A,E,R>) => {
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


export const layer = Effer.Default.pipe(
    Layer.provideMerge(NavService.Live),
    Layer.provide(Nav.fromWindow(window)),
    Layer.provide(GetRandomValues.CryptoRandom),
)