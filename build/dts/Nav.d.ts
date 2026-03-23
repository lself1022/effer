/**
 * @since 0.2.0
 */
import { Context, Effect, Layer, Stream, SubscriptionRef } from "effect";
import { NoSuchElementException } from "effect/Cause";
declare const Nav_base: Context.TagClass<Nav, "@effer/NavService", {
    urlRef: SubscriptionRef.SubscriptionRef<URL>;
    pathStream: Stream.Stream<string>;
    getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementException, never>;
    navigate: typeof window.navigation.navigate;
}>;
/**
 * @since 0.2.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export declare class Nav extends Nav_base {
}
export declare const BrowserLayer: Layer.Layer<Nav, never, never>;
export {};
//# sourceMappingURL=Nav.d.ts.map