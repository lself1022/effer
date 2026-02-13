"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nav = exports.BrowserLayer = void 0;
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
// export class Nav extends Context.Tag('@effer/NavService')<
//     Nav, 
//     {
//         url: Ref.Ref<URL>;
//         pathStream: Stream.Stream<URL>;
//         getQueryParam: (name: string) => Effect.Effect<string, NoSuchElementError, never>
//         navigate: typeof window.navigation.navigate;
//     }
// >() {}
class Nav extends /*#__PURE__*/_effect.ServiceMap.Service()("@effer/NavService") {}
exports.Nav = Nav;
const BrowserLayer = exports.BrowserLayer = /*#__PURE__*/_effect.Layer.effect(Nav, /*#__PURE__*/_effect.Effect.gen(function* () {
  const url = yield* _effect.Ref.make(new URL(window.navigation.currentEntry?.url));
  const pathStream = _effect.Stream.fromEventListener(window.navigation, 'navigate').pipe(_effect.Stream.map(e => new URL(e.destination.url)), _effect.Stream.merge(_effect.Stream.make(new URL(window.navigation.currentEntry?.url))), _effect.Stream.tap(u => _effect.Ref.set(url, u)));
  const getQueryParam = name => _effect.Effect.gen(function* () {
    const result = (yield* _effect.Ref.get(url)).searchParams.get(name);
    if (result === null) {
      yield* _effect.Effect.fail(new _Cause.NoSuchElementError());
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
//# sourceMappingURL=Nav.js.map