/**
 * @since 1.0.0
 */
import { Context, Effect, Layer, Ref, Stream } from "effect";
import { NoSuchElementException } from "effect/Cause";
declare const NavService_base: Context.TagClass<NavService, "NavService", {
    url: Ref.Ref<URL>;
    pathStream: Stream.Stream<URL>;
    getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementException, never>;
    navigate: typeof window.navigation.navigate;
}>;
/**
 * @since 1.0.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export declare class NavService extends NavService_base {
    static Live: Layer.Layer<NavService, never, never>;
}
export {};
//# sourceMappingURL=Nav.d.ts.map