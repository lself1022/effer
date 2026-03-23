/**
 * @since 0.2.0
 */
import { Effect, Stream, SubscriptionRef, Unify } from "effect";
import { isChannel } from "effect/Channel";
import { isEffect } from "effect/Effect";
import { hasProperty } from "effect/Predicate";
import { StreamTypeId } from "effect/Stream";
import { html as _html, render as _render } from "lit-html";
import { asyncAppend } from "lit-html/directives/async-append.js";
import { asyncReplace } from "lit-html/directives/async-replace.js";
/**
 * @since 0.2.0
 * Create an HTML template result that can be rendered to the DOM
 */
export const html = _html;
/**
 * @since 0.2.0
 * Renders a template result to the container
 */
export const render = (template, root) => Effect.sync(() => _render(template, root));
const isQueue = val => hasProperty(val, Unify.ignoreSymbol) && hasProperty(val[Unify.ignoreSymbol], 'Dequeue');
const isStream = val => hasProperty(val, StreamTypeId);
const isSubscriptionRef = val => hasProperty(val, SubscriptionRef.SubscriptionRefTypeId);
const attachableToStream = val => {
  let stream;
  if (isChannel(val)) {
    stream = Stream.fromChannel(val);
  } else if (isSubscriptionRef(val)) {
    stream = val.changes;
  } else if (isEffect(val) && !isQueue(val)) {
    stream = Stream.fromEffect(val);
  } else if (isQueue(val)) {
    stream = Stream.fromQueue(val);
  } else if (isStream(val)) {
    stream = val;
  } else {
    stream = Stream.fromPubSub(val);
  }
  return stream;
};
/**
 * @since 0.2.0
 * Attaches any Attachable value to the template, replacing old values as new values are produced:
 * ```ts
 * const Counter = () => Effect.gen(function*() {
 *   counter = yield* CounterService // service made with State.reducer or State.simple
 *
 *   return html`
 *     <p>The count is ${yield* Dom.attach(counter.stream)}</p>
 *   `
 * })
 * ```
 */
export const attach = val => attachableToStream(val).pipe(Stream.toAsyncIterableEffect, Effect.map(iter => asyncReplace(iter)));
/**
 * @since 0.2.0
 */
export const append = to => Effect.map(Stream.toAsyncIterableEffect(to), asyncAppend);
/**
 * @since 0.2.0
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