/**
 * @since 1.0.0
 */

import { Effect, Layer, Ref, ServiceMap, Stream } from "effect";
import { NoSuchElementError } from "effect/Cause";

/**
 * @since 1.0.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
// export class Nav extends Context.Tag('@effer/NavService')<
//     Nav, 
//     {
//         url: Ref.Ref<URL>;
//         pathStream: Stream.Stream<URL>;
//         getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementError, never>
//         navigate: typeof window.navigation.navigate;
//     }
// >() {}

export class Nav extends ServiceMap.Service<Nav, {
    url: Ref.Ref<URL>
    pathStream: Stream.Stream<URL>
    navigate: typeof window.navigation.navigate
    getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementError, never>
}>()("@effer/NavService") {}
  
export const BrowserLayer = Layer.effect(
    Nav, 
    Effect.gen(function*() {
        const url = yield* Ref.make<URL>(new URL(window.navigation.currentEntry?.url!))
        const pathStream = Stream.fromEventListener<NavigateEvent>(window.navigation, 'navigate').pipe(
            Stream.map(e => new URL(e.destination.url)),
            Stream.merge(Stream.make(new URL(window.navigation.currentEntry?.url!))),
            Stream.tap(u => Ref.set(url, u))
        )
        const getQueryParam = (name: string) => Effect.gen(function*() {
            const result: string | null = (yield* Ref.get(url)).searchParams.get(name)
            if(result === null) {
                yield* Effect.fail(new NoSuchElementError())
            }
            return result!
        })
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
        }
    })
)