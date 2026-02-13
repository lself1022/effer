/**
 * @since 1.0.0
 */
import { Effect, Layer, Ref, ServiceMap, Stream } from "effect";
import { NoSuchElementError } from "effect/Cause";
declare const Nav_base: ServiceMap.ServiceClass<Nav, "@effer/NavService", {
    url: Ref.Ref<URL>;
    pathStream: Stream.Stream<URL>;
    navigate: typeof window.navigation.navigate;
    getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementError, never>;
}>;
/**
 * @since 1.0.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export declare class Nav extends Nav_base {
}
export declare const BrowserLayer: Layer.Layer<Nav, never, never>;
export {};
//# sourceMappingURL=Nav.d.ts.map