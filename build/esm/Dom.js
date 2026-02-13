/**
 * @since 1.0.0
 */
import { Effect, Queue, Stream, SubscriptionRef, pipe } from "effect";
import { isEffect } from "effect/Effect";
import { html as _html, render as _render } from "lit-html";
import { asyncAppend } from "lit-html/directives/async-append.js";
import { asyncReplace } from "lit-html/directives/async-replace.js";
/**
 * @since 1.0.0
 * Create an HTML template result that can be rendered to the DOM
 */
export const html = _html;
/**
 * @since 1.0.0
 * Renders a template result to the container
 */
export const render = (template, root) => Effect.sync(() => _render(template, root));
// const isQueue= <A>(val: unknown): val is Queue.Queue<A> => hasProperty(val, Unify.ignoreSymbol) && hasProperty(val[Unify.ignoreSymbol], 'Dequeue')
// const isStream = <A,E,R>(val: unknown): val is Stream.Stream<A,E,R> => hasProperty(val, Stream)
const isSubscriptionRef = val => SubscriptionRef.isSubscriptionRef(val);
const attachableToStream = val => {
  let stream;
  // if(isChannel(val)) {
  //     stream = Stream.fromChannel<A,E,R>(val)
  // } else 
  if (isSubscriptionRef(val)) {
    stream = SubscriptionRef.changes(val);
  } else if (isEffect(val) && !Queue.isQueue(val)) {
    stream = Stream.fromEffect(val);
  } else if (Queue.isQueue(val)) {
    stream = Stream.fromQueue(val);
  } else if (Stream.isStream(val)) {
    stream = val;
  } else {
    val;
    stream = Stream.fromPubSub(val);
  }
  return stream;
};
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
export const replace = val => attachableToStream(val).pipe(Stream.toAsyncIterableEffect, Effect.map(iter => asyncReplace(iter)));
/**
 * @since 1.0.0
 */
export const mapReplace = (val, fn) => pipe(attachableToStream(val), Stream.map(fn), Stream.toAsyncIterableEffect, Effect.map(asyncReplace));
/**
 * @since 1.0.0
 */
export const append = to => Effect.map(Stream.toAsyncIterableEffect(to), asyncAppend);
/**
 * @since 1.0.0
 */
export const mapAppend = (to, fn) => append(Stream.map(to, fn));
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
export const queueMsg = (offer, mapper) => {
  if (mapper) {
    return e => offer(mapper(e));
  }
  return offer;
};
//# sourceMappingURL=Dom.js.map