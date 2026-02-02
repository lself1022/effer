/**
 * @since 1.0.0
 */
import { Context, Effect, Layer, Ref, Stream } from "effect";
import { NoSuchElementException } from "effect/Cause";
/**
 * @since 1.0.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export class NavService extends /*#__PURE__*/Context.Tag('NavService')() {
  static Live = /*#__PURE__*/Layer.effect(NavService, /*#__PURE__*/Effect.gen(function* () {
    const url = yield* Ref.make(new URL(window.navigation.currentEntry?.url));
    const pathStream = Stream.fromEventListener(window.navigation, 'navigate').pipe(Stream.map(e => new URL(e.destination.url)), Stream.merge(Stream.make(new URL(window.navigation.currentEntry?.url))), Stream.tap(u => Ref.set(url, u)));
    const getQueryParam = name => Effect.gen(function* () {
      const result = (yield* Ref.get(url)).searchParams.get(name);
      if (result === null) {
        yield* Effect.fail(new NoSuchElementException());
      }
      return result;
    });
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
    };
  }));
}
//# sourceMappingURL=Nav.js.map