"use strict";

var _vitest = require("vitest");
var _vitest2 = require("@effect/vitest");
var _effect = require("effect");
var _index = require("./index");
var _vitestBrowserLit = require("vitest-browser-lit");
(0, _vitest.describe)('Dom module', () => {
  (0, _vitest.describe)('attach function', () => {
    _vitest2.it.effect('should replace stream values in the DOM', () => _effect.Effect.gen(function* () {
      const stream = _effect.Stream.make(1, 2, 3);
      const directive = yield* _index.Dom.attach(stream);
      const template = _index.Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = (0, _vitestBrowserLit.render)(template);
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
  (0, _vitest.describe)('queueMsg function', () => {
    _vitest2.it.effect('should offer mapped message to queue when DOM event triggered', () => _effect.Effect.gen(function* () {
      const queue = yield* _effect.Queue.unbounded();
      const template = _index.Dom.html`
          <button 
            @click=${_index.Dom.queueMsg(val => queue.unsafeOffer(val), e => 1)}
          >Test Button</button>
        `;
      const screen = (0, _vitestBrowserLit.render)(template);
      yield* _effect.Effect.promise(() => screen.getByText('Test Button').click());
      const result = yield* queue.take;
      (0, _vitest.expect)(result).toEqual(1);
    }));
  });
});
//# sourceMappingURL=Dom.test.js.map