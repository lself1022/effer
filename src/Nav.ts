/**
 * @since 0.2.0
 */

import { Context, Effect, Layer, Ref, Stream } from "effect";
import { NoSuchElementException } from "effect/Cause";
import * as TypedNav from "@typed/navigation";
import { GetRandomValues } from "@typed/id";
import { TemplateResult } from "lit-html";

/**
 * @since 0.2.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export class Nav extends Context.Tag('@effer/NavService')<
    Nav, 
    {
        url: Ref.Ref<URL>;
        pathStream: Stream.Stream<URL>;
        router: <R>(routeFn: (path: string) => Effect.Effect<TemplateResult<1>, never, R>) => Stream.Stream<Effect.Effect<TemplateResult<1>, never, R>, never, never>;
        getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementException, never>
        navigate: typeof window.navigation.navigate;
    }
>() {}

export const BrowserLayer = Layer.effect(Nav, Effect.gen(function*() {
    const url = yield* Ref.make<URL>(new URL(window.navigation.currentEntry?.url!))
    const pathStream = Stream.fromEventListener<NavigateEvent>(window.navigation, 'navigate').pipe(
        Stream.map(e => new URL(e.destination.url)),
        Stream.merge(Stream.make(new URL(window.navigation.currentEntry?.url!))),
        Stream.tap(u => Ref.set(url, u))
    )
    const getQueryParam = (name: string) => Effect.gen(function*() {
        const result: string | null = (yield* Ref.get(url)).searchParams.get(name)
        if(result === null) {
            yield* Effect.fail(new NoSuchElementException())
        }
        return result!
    })
    const router = <R>(routeFn: (path: string) => Effect.Effect<TemplateResult<1>, never, R>): Stream.Stream<Effect.Effect<TemplateResult<1>, never, R>, never, never> => pathStream.pipe(
        Stream.map(url => url.pathname),
        Stream.map(routeFn)
    )
    return {
        /**
         * @since 0.2.0
         * The current URL object
         */
        url,
        /**
         * @since 0.2.0
         * A stream of the current app path ('/', '/actuator', etc.)
         */
        pathStream,
        /**
         * @since 0.2.0
         * Takes a function that maps the current pathname to an Effer template:
         * ```ts
         * const App = () => Effect.gen(function*() {
         *   const nav = yield* Nav
         *   const page = Nav.router(
         *      (path: string) => {
         *          switch(path) {
         *              case '/counters':
         *                  return Counter // an Effer template of type Effect<TemplateResult, never, R>
         *              case '/todos':
         *                  return Todos // an Effer template of type Effect<TemplateResult, never, R>
         *          }
         *      }
         *   )
         * 
         *   return html`
         *      <main>
         *          ${ yield* Dom.attach(page) }
         *      </main>
         *   `
         * })
         * ```
         */
        router,
        /**
         * @since 0.2.0
         * Method used to navigate. Accepts a URL string and navigates the page
         */
        navigate: window.navigation.navigate,
        /**
         * @since 0.2.0
         * Get a value from the current URL's query params
         */
        getQueryParam
    }
})).pipe(
    Layer.provide(TypedNav.fromWindow(window)),
    Layer.provide(GetRandomValues.CryptoRandom)
)