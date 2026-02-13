"use strict";

var _vitest = require("vitest");
var _vitest2 = require("@effect/vitest");
var _effect = require("effect");
var _index = require("./index");
var _vitestBrowserLit = require("vitest-browser-lit");
(0, _vitest.describe)('Dom module', () => {
  (0, _vitest.describe)('replace function', () => {
    _vitest2.it.effect('should replace stream values in the DOM', () => _effect.Effect.gen(function* () {
      const stream = _effect.Stream.make(1, 2, 3);
      const directive = yield* _index.Dom.replace(stream);
      const template = _index.Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = (0, _vitestBrowserLit.render)(template);
      yield* _effect.Effect.promise(() => _vitest.expect.element(screen.getByText('3')).toBeVisible());
    }));
  });
  (0, _vitest.describe)('mapReplace function', () => {
    _vitest2.it.effect('should replace stream values in the DOM with mapped value', () => _effect.Effect.gen(function* () {
      const stream = _effect.Stream.make(1, 2, 3);
      const directive = yield* _index.Dom.mapReplace(stream, val => _index.Dom.html`<div><p>Number: </p>${val}</div>`);
      const template = _index.Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = (0, _vitestBrowserLit.render)(template);
      yield* _effect.Effect.promise(() => _vitest.expect.element(screen.getByText('Number:')).toBeVisible());
      yield* _effect.Effect.promise(() => _vitest.expect.element(screen.getByText('3')).toBeVisible());
    }));
  });
  (0, _vitest.describe)('append function', () => {
    _vitest2.it.effect('should append stream values to the DOM', () => _effect.Effect.gen(function* () {
      const stream = _effect.Stream.make(1, 2, 3);
      const directive = yield* _index.Dom.append(stream);
      const template = _index.Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = (0, _vitestBrowserLit.render)(template);
      yield* _effect.Effect.promise(() => _vitest.expect.element(screen.getByText('123')).toBeVisible());
    }));
  });
  (0, _vitest.describe)('mapAppend function', () => {
    _vitest2.it.effect('should map stream values with function then append to the DOM', () => _effect.Effect.gen(function* () {
      const stream = _effect.Stream.make(1, 2, 3);
      const directive = yield* _index.Dom.mapAppend(stream, val => `A${val}`);
      const template = _index.Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = (0, _vitestBrowserLit.render)(template);
      yield* _effect.Effect.promise(() => _vitest.expect.element(screen.getByText('A1A2A3')).toBeVisible());
    }));
  });
  (0, _vitest.describe)('queueMsg function', () => {
    _vitest2.it.effect('should offer mapped message to queue when DOM event triggered', () => _effect.Effect.gen(function* () {
      const queue = yield* _effect.Queue.unbounded();
      const template = _index.Dom.html`
          <button 
            @click=${_index.Dom.queueMsg(val => _effect.Queue.offerUnsafe(queue, val), e => 1)}
          >Test Button</button>
        `;
      const screen = (0, _vitestBrowserLit.render)(template);
      yield* _effect.Effect.promise(() => screen.getByText('Test Button').click());
      const result = yield* _effect.Queue.take(queue);
      (0, _vitest.expect)(result).toEqual(1);
    }));
  });
});
//# sourceMappingURL=Dom.test.js.map