"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = exports.queueMsg = exports.html = exports.attach = exports.append = void 0;
var _effect = require("effect");
var _Channel = require("effect/Channel");
var _Effect = require("effect/Effect");
var _Predicate = require("effect/Predicate");
var _Stream = require("effect/Stream");
var _litHtml = require("lit-html");
var _asyncAppend = require("lit-html/directives/async-append.js");
var _asyncReplace = require("lit-html/directives/async-replace.js");
/**
 * @since 0.2.0
 */

/**
 * @since 0.2.0
 * Create an HTML template result that can be rendered to the DOM
 */
const html = exports.html = _litHtml.html;
/**
 * @since 0.2.0
 * Renders a template result to the container
 */
const render = (template, root) => _effect.Effect.sync(() => (0, _litHtml.render)(template, root));
exports.render = render;
const isQueue = val => (0, _Predicate.hasProperty)(val, _effect.Unify.ignoreSymbol) && (0, _Predicate.hasProperty)(val[_effect.Unify.ignoreSymbol], 'Dequeue');
const isStream = val => (0, _Predicate.hasProperty)(val, _Stream.StreamTypeId);
const isSubscriptionRef = val => (0, _Predicate.hasProperty)(val, _effect.SubscriptionRef.SubscriptionRefTypeId);
const attachableToStream = val => {
  let stream;
  if ((0, _Channel.isChannel)(val)) {
    stream = _effect.Stream.fromChannel(val);
  } else if (isSubscriptionRef(val)) {
    stream = val.changes;
  } else if ((0, _Effect.isEffect)(val) && !isQueue(val)) {
    stream = _effect.Stream.fromEffect(val);
  } else if (isQueue(val)) {
    stream = _effect.Stream.fromQueue(val);
  } else if (isStream(val)) {
    stream = val;
  } else {
    stream = _effect.Stream.fromPubSub(val);
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
const attach = val => attachableToStream(val).pipe(_effect.Stream.toAsyncIterableEffect, _effect.Effect.map(iter => (0, _asyncReplace.asyncReplace)(iter)));
/**
 * @since 0.2.0
 */
exports.attach = attach;
const append = to => _effect.Effect.map(_effect.Stream.toAsyncIterableEffect(to), _asyncAppend.asyncAppend);
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
exports.append = append;
const queueMsg = (offer, mapper) => {
  if (mapper) {
    return e => offer(mapper(e));
  }
  return offer;
};
exports.queueMsg = queueMsg;
//# sourceMappingURL=Dom.js.map