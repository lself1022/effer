"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simple = exports.reducer = exports.async = exports.Loading = void 0;
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
 * const {stream, dispatch} = yield* State.reducer(0, counterReducer)
 * ```
 */
const reducer = (initialState, updateFn) => _effect.Effect.gen(function* () {
  const subRef = yield* _effect.SubscriptionRef.make(initialState);
  const updateQueue = yield* _effect.Queue.unbounded();
  yield* _effect.Effect.gen(function* () {
    const msg = yield* _effect.Queue.take(updateQueue);
    yield* _effect.SubscriptionRef.updateEffect(subRef, state => updateFn(state, msg));
  }).pipe(_effect.Effect.forever, _effect.Effect.forkChild);
  const dispatch = msg => _effect.Queue.offerUnsafe(updateQueue, msg);
  return {
    stream: _effect.SubscriptionRef.changes(subRef),
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
    const updateFn = yield* _effect.Queue.take(updateQueue);
    yield* _effect.SubscriptionRef.update(subRef, updateFn);
  }).pipe(_effect.Effect.forever, _effect.Effect.forkChild);
  const set = val => _effect.Queue.offerUnsafe(updateQueue, _ => val);
  const update = updateFn => _effect.Queue.offerUnsafe(updateQueue, updateFn);
  return {
    stream: _effect.SubscriptionRef.changes(subRef),
    set,
    update
  };
});
exports.simple = simple;
const Loading = () => {
  _tag: 'Loading';
};
/**
 * @since 1.0.0
 */
exports.Loading = Loading;
const async = effect => {
  const startStream = _effect.Stream.make(Loading());
  const resultStream = effect.pipe(_effect.Effect.result, _effect.Stream.fromEffect);
  // const resultStream: Stream.Stream<Result<A,E>,never,R> = Stream.asyncPush<Result<A,E>,never,R>(
  //     emit => Effect.gen(function*() {
  //         const result = yield* effect.pipe(
  //             Effect.map(data => Success({data})),
  //             Effect.mapError(error => Failure({error})),
  //             Effect.merge
  //         )
  //         emit.single(result)
  //     })
  // )
  return {
    stream: _effect.Stream.concat(startStream, resultStream)
  };
};
exports.async = async;
//# sourceMappingURL=State.js.map