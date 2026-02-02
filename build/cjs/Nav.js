"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavService = void 0;
var _effect = require("effect");
var _Cause = require("effect/Cause");
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
class NavService extends /*#__PURE__*/_effect.Context.Tag('NavService')() {
  static Live = /*#__PURE__*/_effect.Layer.effect(NavService, /*#__PURE__*/_effect.Effect.gen(function* () {
    const url = yield* _effect.Ref.make(new URL(window.navigation.currentEntry?.url));
    const pathStream = _effect.Stream.fromEventListener(window.navigation, 'navigate').pipe(_effect.Stream.map(e => new URL(e.destination.url)), _effect.Stream.merge(_effect.Stream.make(new URL(window.navigation.currentEntry?.url))), _effect.Stream.tap(u => _effect.Ref.set(url, u)));
    const getQueryParam = name => _effect.Effect.gen(function* () {
      const result = (yield* _effect.Ref.get(url)).searchParams.get(name);
      if (result === null) {
        yield* _effect.Effect.fail(new _Cause.NoSuchElementException());
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
exports.NavService = NavService;
//# sourceMappingURL=Nav.js.map