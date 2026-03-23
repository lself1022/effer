/**
 * @since 0.2.0
 */
import { Context, Effect, Layer, Stream, SubscriptionRef } from "effect";
import { NoSuchElementException } from "effect/Cause";
import * as TypedNav from "@typed/navigation";
import { GetRandomValues } from "@typed/id";
/**
 * @since 0.2.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
export class Nav extends /*#__PURE__*/Context.Tag('@effer/NavService')() {}
export const BrowserLayer = /*#__PURE__*/Layer.effect(Nav, Effect.gen(function* () {
  const urlRef = yield* SubscriptionRef.make(new URL(window.navigation.currentEntry?.url));
  const pathStream = Stream.fromEventListener(window.navigation, 'navigate').pipe(Stream.map(e => new URL(e.destination.url)), Stream.merge(Stream.make(new URL(window.navigation.currentEntry?.url))), Stream.tap(u => SubscriptionRef.set(urlRef, u)), Stream.map(url => url.pathname));
  const getQueryParam = name => Effect.gen(function* () {
    const result = (yield* SubscriptionRef.get(urlRef)).searchParams.get(name);
    if (result === null) {
      yield* Effect.fail(new NoSuchElementException());
    }
    return result;
  });
  return {
    /**
     * @since 0.2.0
     * The current URL object in a SubscriptionRef
     */
    urlRef,
    /**
     * @since 0.2.0
     * A stream of the current app path ('/', '/actuator', etc.)
     */
    pathStream,
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
  };
})).pipe(/*#__PURE__*/Layer.provide(/*#__PURE__*/TypedNav.fromWindow(window)), /*#__PURE__*/Layer.provide(GetRandomValues.CryptoRandom));
//# sourceMappingURL=Nav.js.map