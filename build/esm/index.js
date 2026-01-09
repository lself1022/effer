import { Context, Data, Effect, Layer, Queue, Ref, Stream, SubscriptionRef, Unify } from "effect";
import { NoSuchElementException } from "effect/Cause";
import { isChannel } from "effect/Channel";
import { isEffect } from "effect/Effect";
import { hasProperty } from "effect/Predicate";
import { StreamTypeId } from "effect/Stream";
import { html as _html, render as _render } from "lit-html";
import { AsyncReplaceDirective as _AsyncReplaceDirective, asyncReplace } from "lit-html/directives/async-replace.js";
import * as Nav from "@typed/navigation";
import { GetRandomValues } from "@typed/id";
/**
 * Create an HTML template result that can be rendered to the DOM
 */
export const html = _html;
/**
 * Renders a template result to the container
 */
export const render = _render;
export class AsyncReplaceDirective extends _AsyncReplaceDirective {}
const isQueue = val => hasProperty(val, Unify.ignoreSymbol) && hasProperty(val[Unify.ignoreSymbol], 'Dequeue');
const isStream = val => hasProperty(val, StreamTypeId);
const isSubscriptionRef = val => hasProperty(val, SubscriptionRef.SubscriptionRefTypeId);
/**
 * The Effer service provides methods for attaching Attachable values to the template and queueing events
 */
export class Effer extends /*#__PURE__*/Effect.Service()('Effer', {
  effect: /*#__PURE__*/Effect.gen(function* () {
    const attach = val => {
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
      return stream.pipe(Stream.toAsyncIterableEffect, Effect.andThen(iter => asyncReplace(iter)));
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
export const makeReducer = (initialState, updateFn) => Effect.gen(function* () {
  const subRef = yield* SubscriptionRef.make(initialState);
  const updateQueue = yield* Queue.unbounded();
  yield* Effect.gen(function* () {
    const msg = yield* updateQueue.take;
    yield* SubscriptionRef.updateEffect(subRef, state => updateFn(state, msg));
  }).pipe(Effect.forever, Effect.fork);
  const dispatch = msg => Queue.unsafeOffer(updateQueue, msg);
  return {
    stream: subRef.changes,
    dispatch
  };
});
export const makeState = initialState => Effect.gen(function* () {
  yield* Effect.log('switched to regular fork...');
  const subRef = yield* SubscriptionRef.make(initialState);
  const updateQueue = yield* Queue.unbounded();
  yield* Effect.gen(function* () {
    const updateFn = yield* updateQueue.take;
    yield* SubscriptionRef.update(subRef, updateFn);
  }).pipe(Effect.forever, Effect.fork);
  const set = val => Queue.unsafeOffer(updateQueue, _ => val);
  const update = updateFn => Queue.unsafeOffer(updateQueue, updateFn);
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
export class NavService extends /*#__PURE__*/Context.Tag('NavService')() {
  static Live = /*#__PURE__*/Layer.effect(NavService, /*#__PURE__*/Effect.gen(function* () {
    const url = yield* Ref.make(new URL(window.navigation.currentEntry?.url));
    const pathStream = Stream.fromEventListener(window.navigation, 'navigate').pipe(Stream.map(e => new URL(e.destination.url)), Stream.merge(Stream.make(new URL(window.navigation.currentEntry?.url))), Stream.tap(u => Ref.set(url, u)));
    const getQueryParam = name => Effect.gen(function* () {
      const result = (yield* Ref.get(url)).searchParams.get(name);
      if (result === null) {
        yield* Effect.fail(new NoSuchElementException());
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
export const makeAsyncResult = effect => {
  const {
    Loading,
    Success,
    Failure,
    $is,
    $match
  } = Data.taggedEnum();
  const startStream = Stream.make(Loading());
  const resultStream = Stream.asyncPush(emit => Effect.gen(function* () {
    const result = yield* effect.pipe(Effect.map(data => Success({
      data
    })), Effect.mapError(error => Failure({
      error
    })), Effect.merge);
    emit.single(result);
  }));
  return {
    stream: Stream.concat(startStream, resultStream),
    is: $is,
    match: $match
  };
};
export const layer = /*#__PURE__*/Effer.Default.pipe(/*#__PURE__*/Layer.provideMerge(NavService.Live), /*#__PURE__*/Layer.provide(/*#__PURE__*/Nav.fromWindow(window)), /*#__PURE__*/Layer.provide(GetRandomValues.CryptoRandom));
//# sourceMappingURL=index.js.map