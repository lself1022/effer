"use strict";

var _vitest = require("vitest");
var _vitest2 = require("@effect/vitest");
var _effect = require("effect");
var _index = require("./index");
(0, _vitest.describe)('State module', () => {
  (0, _vitest.describe)('reducer function', () => {
    _vitest2.it.scoped('should update state based on dispatched messages', () => _effect.Effect.gen(function* () {
      const initialState = {
        count: 0
      };
      const counter = yield* _index.State.reducer(initialState, (state, msg) => _effect.Match.type().pipe(_effect.Match.tag('INCREMENT', () => _effect.Effect.succeed({
        ...state,
        count: state.count + 1
      })), _effect.Match.exhaustive)(msg));
      const getCount = (yield* _effect.Stream.toPull(counter.stream)).pipe(_effect.Effect.andThen(chunk => _effect.Chunk.head(chunk)), _effect.Effect.andThen(state => state.count));
      let result = yield* getCount;
      (0, _vitest.expect)(result).toEqual(0);
      counter.dispatch({
        _tag: 'INCREMENT'
      });
      result = yield* getCount;
      (0, _vitest.expect)(result).toEqual(1);
    }));
  });
  (0, _vitest.describe)('simple function', () => {
    _vitest2.it.scoped('should set new value with set method', () => _effect.Effect.gen(function* () {
      const counter = yield* _index.State.simple(0);
      const getCount = (yield* _effect.Stream.toPull(counter.stream)).pipe(_effect.Effect.andThen(chunk => _effect.Chunk.head(chunk)));
      let result = yield* getCount;
      (0, _vitest.expect)(result).toEqual(0);
      counter.set(1);
      result = yield* getCount;
      (0, _vitest.expect)(result).toEqual(1);
    }));
    _vitest2.it.scoped('should update value with update method', () => _effect.Effect.gen(function* () {
      const counter = yield* _index.State.simple(0);
      const getCount = (yield* _effect.Stream.toPull(counter.stream)).pipe(_effect.Effect.andThen(chunk => _effect.Chunk.head(chunk)));
      let result = yield* getCount;
      (0, _vitest.expect)(result).toEqual(0);
      counter.update(count => count + 1);
      result = yield* getCount;
      (0, _vitest.expect)(result).toEqual(1);
    }));
  });
  (0, _vitest.describe)('async function', () => {
    _vitest2.it.scoped('should return loading and success states for async effect', () => _effect.Effect.gen(function* () {
      const asyncFn = async () => {
        setTimeout(() => {}, 2000);
        return 0;
      };
      const asyncEffect = _effect.Effect.promise(asyncFn);
      const result = _index.State.async(asyncEffect);
      const getState = (yield* _effect.Stream.toPull(result.stream)).pipe(_effect.Effect.andThen(chunk => _effect.Chunk.head(chunk)));
      let state = yield* getState;
      (0, _vitest.expect)(result.is('Loading')(state)).toBeTruthy();
      setTimeout(() => {}, 2000);
      state = yield* getState;
      (0, _vitest.expect)(result.is('Success')(state) && state.data).toEqual(0);
    }));
    _vitest2.it.scoped('should return error state for failed async effect', () => _effect.Effect.gen(function* () {
      class TestError extends _effect.Data.Error {}
      const asyncEffect = _effect.Effect.gen(function* () {
        setTimeout(() => {}, 2000);
        yield* new TestError({
          message: 'an error'
        });
        return 0;
      });
      const result = _index.State.async(asyncEffect);
      const getState = (yield* _effect.Stream.toPull(result.stream)).pipe(_effect.Effect.andThen(chunk => _effect.Chunk.head(chunk)));
      let state = yield* getState;
      (0, _vitest.expect)(result.is('Loading')(state)).toBeTruthy();
      setTimeout(() => {}, 2000);
      state = yield* getState;
      (0, _vitest.expect)(result.is('Failure')(state) && state.error.message).toEqual('an error');
    }));
  });
});
//# sourceMappingURL=State.test.js.map