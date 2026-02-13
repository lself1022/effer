/**
 * @since 1.0.0
 */
import { Effect, Queue, Stream, SubscriptionRef } from "effect";
import { type PubSub } from "effect/PubSub";
import { type RenderRootNode, type TemplateResult } from "lit-html";
/**
 * @since 1.0.0
 * Create an HTML template result that can be rendered to the DOM
 */
export declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult<1>;
/**
 * @since 1.0.0
 * Renders a template result to the container
 */
export declare const render: (template: TemplateResult, root: RenderRootNode) => Effect.Effect<import("lit-html").RootPart, never, never>;
/**
 * @since 1.0.0
 * Types that can be attached to the DOM template using Effer's 'replace' and 'append' methods
 */
export type Attachable<A, E, R> = Effect.Effect<A, E, R> | SubscriptionRef.SubscriptionRef<A> | PubSub<A> | Queue.Queue<A, E> | Stream.Stream<A, E, R>;
/**
 * @since 1.0.0
 * Attaches any Attachable value to the template, replacing old values as new values are produced:
 * ```ts
 * const Counter = () => Effect.gen(function*() {
 *   counter = yield* CounterService // service made with State.reducer or State.simple
 *
 *   return html`
 *     <p>The count is ${yield* Dom.replace(counter.stream)}</p>
 *   `
 * })
 * ```
 */
export declare const replace: <A, E = never, R = never>(val: Attachable<A, E, R>) => Effect.Effect<import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/async-replace.js").AsyncReplaceDirective>, never, R>;
/**
 * @since 1.0.0
 */
export declare const mapReplace: <A, E, R>(val: Attachable<A, E, R>, fn: (value: A) => unknown) => Effect.Effect<import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/async-replace.js").AsyncReplaceDirective>, never, R>;
/**
 * @since 1.0.0
 */
export declare const append: <A, E, R>(to: Stream.Stream<A, E, R>) => Effect.Effect<import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/async-append.js").AsyncAppendDirective>, never, R>;
/**
 * @since 1.0.0
 */
export declare const mapAppend: <A, E, R>(to: Stream.Stream<A, E, R>, fn: (value: A) => unknown) => Effect.Effect<import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/async-append.js").AsyncAppendDirective>, never, R>;
/**
 * @since 1.0.0
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
export declare const queueMsg: <DOMEvent, Msg>(offer: (msg: Msg) => boolean, mapper?: (e: DOMEvent) => Msg) => ((msg: Msg) => boolean) | ((e: DOMEvent) => boolean);
//# sourceMappingURL=Dom.d.ts.map