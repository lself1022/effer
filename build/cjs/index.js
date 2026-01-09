"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = exports.makeState = exports.makeReducer = exports.makeAsyncResult = exports.layer = exports.html = exports.NavService = exports.Effer = exports.AsyncReplaceDirective = void 0;
var _effect = require("effect");
var _Cause = require("effect/Cause");
var _Channel = require("effect/Channel");
var _Effect = require("effect/Effect");
var _Predicate = require("effect/Predicate");
var _Stream = require("effect/Stream");
var _litHtml = require("lit-html");
var _asyncReplace = require("lit-html/directives/async-replace.js");
var Nav = _interopRequireWildcard(require("@typed/navigation"));
var _id = require("@typed/id");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Create an HTML template result that can be rendered to the DOM
 */
const html = exports.html = _litHtml.html;
/**
 * Renders a template result to the container
 */
const render = exports.render = _litHtml.render;
class AsyncReplaceDirective extends _asyncReplace.AsyncReplaceDirective {}
exports.AsyncReplaceDirective = AsyncReplaceDirective;
const isQueue = val => (0, _Predicate.hasProperty)(val, _effect.Unify.ignoreSymbol) && (0, _Predicate.hasProperty)(val[_effect.Unify.ignoreSymbol], 'Dequeue');
const isStream = val => (0, _Predicate.hasProperty)(val, _Stream.StreamTypeId);
const isSubscriptionRef = val => (0, _Predicate.hasProperty)(val, _effect.SubscriptionRef.SubscriptionRefTypeId);
/**
 * The Effer service provides methods for attaching Attachable values to the template and queueing events
 */
class Effer extends /*#__PURE__*/_effect.Effect.Service()('Effer', {
  effect: /*#__PURE__*/_effect.Effect.gen(function* () {
    const attach = val => {
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
      return stream.pipe(_effect.Stream.toAsyncIterableEffect, _effect.Effect.andThen(iter => (0, _asyncReplace.asyncReplace)(iter)));
    };
    const queueMsg = (offer, mapper) => {
      if (mapper) {
        return e => offer(mapper(e));
      }
      return offer;
    };
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
    };
  })
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
exports.Effer = Effer;
const makeReducer = (initialState, updateFn) => _effect.Effect.gen(function* () {
  const subRef = yield* _effect.SubscriptionRef.make(initialState);
  const updateQueue = yield* _effect.Queue.unbounded();
  yield* _effect.Effect.gen(function* () {
    const msg = yield* updateQueue.take;
    yield* _effect.SubscriptionRef.updateEffect(subRef, state => updateFn(state, msg));
  }).pipe(_effect.Effect.forever, _effect.Effect.fork);
  const dispatch = msg => _effect.Queue.unsafeOffer(updateQueue, msg);
  return {
    stream: subRef.changes,
    dispatch
  };
});
exports.makeReducer = makeReducer;
const makeState = initialState => _effect.Effect.gen(function* () {
  yield* _effect.Effect.log('switched to regular fork...');
  const subRef = yield* _effect.SubscriptionRef.make(initialState);
  const updateQueue = yield* _effect.Queue.unbounded();
  yield* _effect.Effect.gen(function* () {
    const updateFn = yield* updateQueue.take;
    yield* _effect.SubscriptionRef.update(subRef, updateFn);
  }).pipe(_effect.Effect.forever, _effect.Effect.fork);
  const set = val => _effect.Queue.unsafeOffer(updateQueue, _ => val);
  const update = updateFn => _effect.Queue.unsafeOffer(updateQueue, updateFn);
  return {
    stream: subRef.changes,
    set,
    update
  };
});
/**
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
exports.makeState = makeState;
class NavService extends /*#__PURE__*/_effect.Context.Tag('NavService')() {
  static Live = /*#__PURE__*/_effect.Layer.effect(NavService, /*#__PURE__*/_effect.Effect.gen(function* () {
    const url = yield* _effect.Ref.make(new URL(window.navigation.currentEntry?.url));
    const pathStream = _effect.Stream.fromEventListener(window.navigation, 'navigate').pipe(_effect.Stream.map(e => new URL(e.destination.url)), _effect.Stream.merge(_effect.Stream.make(new URL(window.navigation.currentEntry?.url))), _effect.Stream.tap(u => _effect.Ref.set(url, u)));
    const getQueryParam = name => _effect.Effect.gen(function* () {
      const result = (yield* _effect.Ref.get(url)).searchParams.get(name);
      if (result === null) {
        yield* _effect.Effect.fail(new _Cause.NoSuchElementException());
      }
      return result;
    });
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
    };
  }));
}
exports.NavService = NavService;
const makeAsyncResult = effect => {
  const {
    Loading,
    Success,
    Failure,
    $is,
    $match
  } = _effect.Data.taggedEnum();
  const startStream = _effect.Stream.make(Loading());
  const resultStream = _effect.Stream.asyncPush(emit => _effect.Effect.gen(function* () {
    const result = yield* effect.pipe(_effect.Effect.map(data => Success({
      data
    })), _effect.Effect.mapError(error => Failure({
      error
    })), _effect.Effect.merge);
    emit.single(result);
  }));
  return {
    stream: _effect.Stream.concat(startStream, resultStream),
    is: $is,
    match: $match
  };
};
exports.makeAsyncResult = makeAsyncResult;
const layer = exports.layer = /*#__PURE__*/Effer.Default.pipe(/*#__PURE__*/_effect.Layer.provideMerge(NavService.Live), /*#__PURE__*/_effect.Layer.provide(/*#__PURE__*/Nav.fromWindow(window)), /*#__PURE__*/_effect.Layer.provide(_id.GetRandomValues.CryptoRandom));
//# sourceMappingURL=index.js.map