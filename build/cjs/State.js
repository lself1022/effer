"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simple = exports.reducer = exports.async = void 0;
var _effect = require("effect");
/**
 * @since 1.0.0
 */

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
const reducer = (initialState, updateFn) => _effect.Effect.gen(function* () {
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
/**
 * @since 1.0.0
 */
exports.reducer = reducer;
const simple = initialState => _effect.Effect.gen(function* () {
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
 * @since 1.0.0
 */
exports.simple = simple;
const async = effect => {
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
exports.async = async;
//# sourceMappingURL=State.js.map