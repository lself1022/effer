/**
 * @since 1.0.0
 */

import { Chunk, Effect, Queue, Stream, SubscriptionRef, Unify, pipe } from "effect";
import { isChannel, type Channel } from "effect/Channel";
import { isEffect } from "effect/Effect";
import { hasProperty } from "effect/Predicate";
import { type PubSub } from "effect/PubSub";
import { html as _html, render as _render, type RenderRootNode, type TemplateResult } from "lit-html";
import { asyncAppend } from "lit-html/directives/async-append.js";
import { asyncReplace } from "lit-html/directives/async-replace.js";


/**
 * @since 1.0.0
 * Create an HTML template result that can be rendered to the DOM
 */
export const html = _html
/**
 * @since 1.0.0
 * Renders a template result to the container
 */
export const render = (template: TemplateResult, root: RenderRootNode) =>
    Effect.sync(() => _render(template, root));

/**
 * @since 1.0.0
 * Types that can be attached to the DOM template using Effer's 'replace' and 'append' methods
 */
export type Attachable<A,E,R> = 
    // | Channel<A, E, unknown, unknown, unknown, unknown, R> 
    | Effect.Effect<A,E,R> 
    | SubscriptionRef.SubscriptionRef<A>
    | PubSub<A> 
    | Queue.Queue<A,E> 
    | Stream.Stream<A,E,R>
// const isQueue= <A>(val: unknown): val is Queue.Queue<A> => hasProperty(val, Unify.ignoreSymbol) && hasProperty(val[Unify.ignoreSymbol], 'Dequeue')
// const isStream = <A,E,R>(val: unknown): val is Stream.Stream<A,E,R> => hasProperty(val, Stream)
const isSubscriptionRef = <A>(val: unknown): val is SubscriptionRef.SubscriptionRef<A> => SubscriptionRef.isSubscriptionRef(val)

const attachableToStream = <A,E=never,R=never>(val: Attachable<A,E,R>) => {
    let stream: Stream.Stream<A,E,R>;
    // if(isChannel(val)) {
    //     stream = Stream.fromChannel<A,E,R>(val)
    // } else 
    if (isSubscriptionRef<A>(val)) {
        stream = SubscriptionRef.changes<A>(val)
    } else if(isEffect(val) && !Queue.isQueue<A,E>(val)) {
        stream = Stream.fromEffect(val)
    } else if(Queue.isQueue<A,E>(val)) {
        stream = Stream.fromQueue<A,E>(val)
    } else if(Stream.isStream(val)) {
        stream = val
    } else {
        val
        stream = Stream.fromPubSub(val)
    }
    return stream
}

/**
 * @since 1.0.0
 * Attaches any Attachable value to the template, replacing old values as new values are produced:
 * ```ts
 * const Counter = () => Effect.gen(function*() {
 *   counter = yield* CounterService // service made with State.reducer or State.simple
 * 
 *   return html`
 *     <p>The count is ${yield* Dom.replace(counter.stream)}</p>
 *   `
 * })
 * ```
 */
export const replace = <A,E=never,R=never>(val: Attachable<A,E,R>) => attachableToStream(val).pipe(
    Stream.toAsyncIterableEffect,
    Effect.map(iter => asyncReplace(iter))
)

/**
 * @since 1.0.0
 */
export const mapReplace = <A, E, R>(val: Attachable<A,E,R>, fn: (value: A) => unknown) => pipe(
    attachableToStream(val),
    Stream.map(fn),
    Stream.toAsyncIterableEffect,
    Effect.map(asyncReplace)
  )

/**
 * @since 1.0.0
 */
export const append = <A, E, R>(to: Stream.Stream<A, E, R>) =>
    Effect.map(Stream.toAsyncIterableEffect(to), asyncAppend);
  
/**
 * @since 1.0.0
 */
export const mapAppend = <A, E, R>(
to: Stream.Stream<A, E, R>,
fn: (value: A) => unknown,
) => append(Stream.map(to, fn));

/**
 * @since 1.0.0
 * Used in place of an event handler callback, this function takes a queue to dispatch messages to, 
 * as well as a mapping function from the DOM event to the queue's expected event type
 * ```ts
 * const Counter = () => Effect.gen(function*() {
 *   const numberQueue = yield* Queue.unbounded<number>()
 * 
 *   return html`
 *     <button ＠click=${queueMsg(numberQueue, (e) => 0)}>
 *       Queue up a number!
 *     </button>
 *   `
 * })
 * ```
 */
export const queueMsg = <DOMEvent, Msg>(offer: (msg: Msg) => boolean, mapper?: (e: DOMEvent) => Msg) => {
    if (mapper) {
        return (e: DOMEvent) => offer(mapper(e));
    }
    return offer;
}