"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nav = exports.BrowserLayer = void 0;
var _effect = require("effect");
var _Cause = require("effect/Cause");
var TypedNav = _interopRequireWildcard(require("@typed/navigation"));
var _id = require("@typed/id");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @since 0.2.0
 */

/**
 * @since 0.2.0
 * Effer's service to interact with navigation. Provides the current URL object, a stream of the
 * current app path, a method to get a query param from the URL, and a method to navigate the page.
 */
class Nav extends /*#__PURE__*/_effect.Context.Tag('@effer/NavService')() {}
exports.Nav = Nav;
const BrowserLayer = exports.BrowserLayer = /*#__PURE__*/_effect.Layer.effect(Nav, _effect.Effect.gen(function* () {
  const urlRef = yield* _effect.SubscriptionRef.make(new URL(window.navigation.currentEntry?.url));
  const pathStream = _effect.Stream.fromEventListener(window.navigation, 'navigate').pipe(_effect.Stream.map(e => new URL(e.destination.url)), _effect.Stream.merge(_effect.Stream.make(new URL(window.navigation.currentEntry?.url))), _effect.Stream.tap(u => _effect.SubscriptionRef.set(urlRef, u)), _effect.Stream.map(url => url.pathname));
  const getQueryParam = name => _effect.Effect.gen(function* () {
    const result = (yield* _effect.SubscriptionRef.get(urlRef)).searchParams.get(name);
    if (result === null) {
      yield* _effect.Effect.fail(new _Cause.NoSuchElementException());
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
})).pipe(/*#__PURE__*/_effect.Layer.provide(/*#__PURE__*/TypedNav.fromWindow(window)), /*#__PURE__*/_effect.Layer.provide(_id.GetRandomValues.CryptoRandom));
//# sourceMappingURL=Nav.js.map