import { describe, expect } from "vitest";
import { it } from "@effect/vitest";
import { Effect, Queue, Stream } from "effect";
import { Dom } from "./index";
import { render } from 'vitest-browser-lit'

describe('Dom module', () => {

    describe('attach function', () => {

        it.effect('should replace stream values in the DOM', () => Effect.gen(function* () {
          const stream = Stream.make(1, 2, 3);
          const directive = yield* Dom.attach(stream);
          const template = Dom.html`<div role='test-div'>${directive}</div>`;
          const screen = render(template)
          yield* Effect.promise(() => expect.element(screen.getByText('3')).toBeVisible())
        }))

    })

    describe('append function', () => {

      it.effect('should append stream values to the DOM', () => Effect.gen(function* () {
        const stream = Stream.make(1, 2, 3);
        const directive = yield* Dom.append(stream);
        const template = Dom.html`<div role='test-div'>${directive}</div>`;
        const screen = render(template)
        yield* Effect.promise(() => expect.element(screen.getByText('123')).toBeVisible())
      }))

    })

    describe('queueMsg function', () => {

      it.effect('should offer mapped message to queue when DOM event triggered', () => Effect.gen(function* () {
        const queue = yield* Queue.unbounded<number>();
        const template = Dom.html`
          <button 
            @click=${Dom.queueMsg((val: number) => queue.unsafeOffer(val), (e) => 1)}
          >Test Button</button>
        `;
        const screen = render(template);
        yield* Effect.promise(() => screen.getByText('Test Button').click());
        const result = yield* queue.take;
        expect(result).toEqual(1);
      }))

  })
})