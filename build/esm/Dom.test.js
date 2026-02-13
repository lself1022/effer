import { describe, expect } from "vitest";
import { it } from "@effect/vitest";
import { Effect, Queue, Stream } from "effect";
import { Dom } from "./index";
import { render } from 'vitest-browser-lit';
describe('Dom module', () => {
  describe('replace function', () => {
    it.effect('should replace stream values in the DOM', () => Effect.gen(function* () {
      const stream = Stream.make(1, 2, 3);
      const directive = yield* Dom.replace(stream);
      const template = Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = render(template);
      yield* Effect.promise(() => expect.element(screen.getByText('3')).toBeVisible());
    }));
  });
  describe('mapReplace function', () => {
    it.effect('should replace stream values in the DOM with mapped value', () => Effect.gen(function* () {
      const stream = Stream.make(1, 2, 3);
      const directive = yield* Dom.mapReplace(stream, val => Dom.html`<div><p>Number: </p>${val}</div>`);
      const template = Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = render(template);
      yield* Effect.promise(() => expect.element(screen.getByText('Number:')).toBeVisible());
      yield* Effect.promise(() => expect.element(screen.getByText('3')).toBeVisible());
    }));
  });
  describe('append function', () => {
    it.effect('should append stream values to the DOM', () => Effect.gen(function* () {
      const stream = Stream.make(1, 2, 3);
      const directive = yield* Dom.append(stream);
      const template = Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = render(template);
      yield* Effect.promise(() => expect.element(screen.getByText('123')).toBeVisible());
    }));
  });
  describe('mapAppend function', () => {
    it.effect('should map stream values with function then append to the DOM', () => Effect.gen(function* () {
      const stream = Stream.make(1, 2, 3);
      const directive = yield* Dom.mapAppend(stream, val => `A${val}`);
      const template = Dom.html`<div role='test-div'>${directive}</div>`;
      const screen = render(template);
      yield* Effect.promise(() => expect.element(screen.getByText('A1A2A3')).toBeVisible());
    }));
  });
  describe('queueMsg function', () => {
    it.effect('should offer mapped message to queue when DOM event triggered', () => Effect.gen(function* () {
      const queue = yield* Queue.unbounded();
      const template = Dom.html`
          <button 
            @click=${Dom.queueMsg(val => Queue.offerUnsafe(queue, val), e => 1)}
          >Test Button</button>
        `;
      const screen = render(template);
      yield* Effect.promise(() => screen.getByText('Test Button').click());
      const result = yield* Queue.take(queue);
      expect(result).toEqual(1);
    }));
  });
});
//# sourceMappingURL=Dom.test.js.map