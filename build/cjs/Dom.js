"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replace = exports.render = exports.queueMsg = exports.mapReplace = exports.mapAppend = exports.html = exports.append = void 0;
var _effect = require("effect");
var _Effect = require("effect/Effect");
var _litHtml = require("lit-html");
var _asyncAppend = require("lit-html/directives/async-append.js");
var _asyncReplace = require("lit-html/directives/async-replace.js");
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * Create an HTML template result that can be rendered to the DOM
 */
const html = exports.html = _litHtml.html;
/**
 * @since 1.0.0
 * Renders a template result to the container
 */
const render = (template, root) => _effect.Effect.sync(() => (0, _litHtml.render)(template, root));
// const isQueue= <A>(val: unknown): val is Queue.Queue<A> => hasProperty(val, Unify.ignoreSymbol) && hasProperty(val[Unify.ignoreSymbol], 'Dequeue')
// const isStream = <A,E,R>(val: unknown): val is Stream.Stream<A,E,R> => hasProperty(val, Stream)
exports.render = render;
const isSubscriptionRef = val => _effect.SubscriptionRef.isSubscriptionRef(val);
const attachableToStream = val => {
  let stream;
  // if(isChannel(val)) {
  //     stream = Stream.fromChannel<A,E,R>(val)
  // } else 
  if (isSubscriptionRef(val)) {
    stream = _effect.SubscriptionRef.changes(val);
  } else if ((0, _Effect.isEffect)(val) && !_effect.Queue.isQueue(val)) {
    stream = _effect.Stream.fromEffect(val);
  } else if (_effect.Queue.isQueue(val)) {
    stream = _effect.Stream.fromQueue(val);
  } else if (_effect.Stream.isStream(val)) {
    stream = val;
  } else {
    val;
    stream = _effect.Stream.fromPubSub(val);
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
const replace = val => attachableToStream(val).pipe(_effect.Stream.toAsyncIterableEffect, _effect.Effect.map(iter => (0, _asyncReplace.asyncReplace)(iter)));
/**
 * @since 1.0.0
 */
exports.replace = replace;
const mapReplace = (val, fn) => (0, _effect.pipe)(attachableToStream(val), _effect.Stream.map(fn), _effect.Stream.toAsyncIterableEffect, _effect.Effect.map(_asyncReplace.asyncReplace));
/**
 * @since 1.0.0
 */
exports.mapReplace = mapReplace;
const append = to => _effect.Effect.map(_effect.Stream.toAsyncIterableEffect(to), _asyncAppend.asyncAppend);
/**
 * @since 1.0.0
 */
exports.append = append;
const mapAppend = (to, fn) => append(_effect.Stream.map(to, fn));
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
exports.mapAppend = mapAppend;
const queueMsg = (offer, mapper) => {
  if (mapper) {
    return e => offer(mapper(e));
  }
  return offer;
};
exports.queueMsg = queueMsg;
//# sourceMappingURL=Dom.js.map