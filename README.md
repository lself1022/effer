# Effer

An Effect native UI library based on lit-html.

## Installation

```
npm install effer
```

## Creating a Counter with Effer

Example:

```ts
// INSIDE counter.ts
import { Effect } from "effect";
import { Dom, State } from "effer";

// Our business logic is created seperately from our views
// This makes it easy to mock or modify the behavior of a component
export class CountState extends Effect.Service<CountState>()("CountState", {
  effect: State.simple<number>(0),
}) {}

export const Counter = () =>
  Effect.gen(function* () {
    const count = yield* CountState;

    return html`
      <section
        class="counter-container d-flex flex-row align-items-baseline justify-content-center"
      >
        <button
          class="btn btn-primary btn-sm counter-button"
          id="decButton"
          @click=${() => count.update((n) => n - 1)}
        >
          - 1
        </button>
        Count is ${yield* Dom.replace(count.stream)}
        <button
          class="btn btn-primary btn-sm counter-button"
          id="incButton"
          @click=${() => count.update((n) => n + 1)}
        >
          + 1
        </button>
      </section>
    `;
  });

// INSIDE main.ts
import { BrowserRuntime } from "@effect/platform-browser";
import { Effect, Layer } from "effect";
import { Dom } from "effer";
import { Counter } from "./counter";

Counter().pipe(
  Effect.andThen(
    // render our component to the DOM element with ID 'app'
    (app) => Dom.render(app, document.getElementById("app")!)
  ),
  Layer.effectDiscard, // transform the render effect into a Layer
  Layer.provide(CountState.Default), // inject our CountState
  Layer.launch, // launch our combined Effer app layer
  BrowserRuntime.runMain
);
```

In the UI, we need to represent data changing over time. Effect gives us Streams as a way to do that. The replace and append functions of Effer's Dom module let you "attach" a stream (or anything that can be converted to a Stream) to the UI. Replace will ensure only the most up-to-date value is shown, while append will append values to that point in the DOM as they are available.

```ts
Dom.html`<p>Count is ${yield* Dom.replace(counterStream)}</p>`;
```

Here is a complete list of what can be attached:

```ts
type Attachable<A, E, R> =
  | Effect<A, E, R>
  | SubscriptionRef<A>
  | PubSub<A>
  | Queue<A>
  | Stream<A, E, R>
  | Channel<Chunk.Chunk<A>, unknown, E, unknown, unknown, unknown, R>;
```

## Managing State

To manage state, Effer provides three helper functions in it's State module: reducer, simple, and async. Reducer and simple are very similar to useReducer and useState in React, except you use them outside your UI components as part of your business logic. Async lets you transform an async effect into a stream that gives Loading, Success, and Failure states, conveying the data in the success channel and error in the failure channel.

### reducer - For Complex State or Logic

reducer lets you define a state and update it by dispatching messages:

```ts
type Msg = Data.TaggedEnum<{
  Increment: {};
  Decrement: {};
}>;
const { Increment, Decrement, $match } = Data.taggedEnum<Msg>();

const makeCounterState = State.reducer(0, (state: number, msg: Msg) =>
  $match({
    Increment: () => Effect.succeed(state + 1),
    Decrement: () => Effect.succeed(state - 1),
  })(msg)
);

// Making our state values a Service so we can easily pass it around
export class CounterService extends Effect.Service<CounterService>()(
  "CounterService",
  {
    effect: makeCounterState,
  }
) {}
```

We define the expected update messages as Increment and Decrement, and we provide a function that takes the old state and a message, and provides a new updated state. Now when we inject the service, we will get an object with this interface:

```ts
{
  stream: Stream<A>; // where A represents our state type
  dispatch: (msg: M) => boolean; // where M represents the type of message we can use to update our state
}
```

### simple - For Simple State Management

State.simple is very similar, but more simplified. We just provide an initial state:

```ts
export class CounterService extends Effect.Service<CounterService>()(
  "CounterService",
  {
    effect: State.simple(0),
  }
) {}
```

And we get an object with this interface:

```ts
{
  stream: Stream<A>; // where A represents our state type
  set: (val: A) => boolean; // replace the current value with a new value
  update: (updateFn: (oldValue: A) => A) => boolean; // update with a function to access old value
}
```

### async - For Async State and Logic

If we have an effect that as asynchronous, like making an HTTP call, we can wrap that effect in State.async:

```ts
const posts = yield * State.async(getPostsAsyncEffect); // an async effect wrapped in State.async
```

When you wrap an `Effect<A,E,R>` in State.async, you get 3 things. The first is a `Stream<Result<A,E>, never, R>` where `Result<A,E>` is:

```ts
export type Result<A, E> = Data.TaggedEnum<{
  Loading: {};
  Success: { readonly data: A };
  Failure: { readonly error: E };
}> & {};
```

The other thing State.async gives us is a helper function called `match()` for matching the state of the streaming Result values:

```ts
const posts = yield * State.async(getPostsAsyncEffect); // an async effect wrapped in makeAsyncResult
// mapping the state of our Result to what we want to display on screen
const postsTable = posts.stream.pipe(
  Stream.map(
    posts.match({
      Loading: () => html`<h1>Loading...</h1>`, // if the async effect is still loading, show this
      Success: ({ data }) => data.map((post) => PostCard(post)), // if it loaded successfully, show the PostCard component
      Failure: ({ error }) => html`<p>Error retrieving data: ${error}</p>`, // if it errored out, show this
    })
  )
);
```

Note that since `Result<A,E>` is a TaggedEnum, `match()` is exactly the same as the `$match()` function you get from creating a TaggedEnum. See the [Effect Documentation](https://effect.website/docs/data-types/data/#union-of-tagged-structs)

## Logic Outside of State Flows

If you have logic that doesn't fit into a state or reducer update, Effer offers the queueMessage function. This function can go anywhere an event listener callback is expected (like @click, @change, etc.). It takes a queue to send the message to, and a function that maps from the DOM event to the queue's message type that we want to dispatch:

```ts
Dom.html`
  <button
    class="btn btn-primary btn-sm counter-button"
    id="decButton"
    @click=${Dom.queueMsg(counterQueue, (e: MouseEvent) => Increment())}
  ></button>
`;
```

You can then take that queue (in this case, counterQueue) and run it into a Stream, working with the events as you need to.

## Navigation and URLs

Effer offers a Nav service for handling things related to navigation and URLs. Here is its interface:

```ts
interface Nav {
  url: Ref.Ref<URL>; // the current URL as a Ref
  pathStream: Stream.Stream<URL>; // a stream of the current URL value for reacting to changes
  getQueryParam: (
    name: string
  ) => Effect.Effect<string, NoSuchElementException, never>; // helper to get a query param from the URL
  navigate: typeof window.navigation.navigate; // the window's navigate() method
}
```

You can use this inside of an Effect (like an Effer component) to navigate like so:

```ts
export const App = () =>
  Effect.gen(function* () {
    const { pathStream } = yield* Nav.Nav; // get the pathStream from Nav
    // a function that maps from a path string to the Effer component we want to display
    const navFn = (path: string) => {
      switch (path) {
        case "/counters":
          return yield * Counter;
        case "/todos":
          return yield * Todos;
        case "/posts":
          return yield * Posts;
        default:
          return yield * Todos;
      }
    };

    // getting the pathname from the pathStream then running that through our nav function
    const page = pathStream.pipe(
      Stream.map((url) => url.pathname),
      Stream.map(navFn)
    );
    // attaching the page stream to the template so the current page displays
    return Dom.html` <main class="w-100">${yield* Dom.replace(page)}</main> `;
  }).pipe(
    Effect.provide(Nav.BrowserLayer) // Providing the Nav service via the browser APIs
  );
```

You can also use Nav to retrieve query params from the current URL:

```ts
const { getQueryParam } = yield* Nav.Nav;
// Getting a "count" query param and parsing it into an integer
const startingCount: number =
  yield *
  getQueryParam("count").pipe(
    Effect.map(parseInt),
    Effect.orElseSucceed(() => 0)
  );
```

## Live Examples

You can see example code and play around with Effer by forking this CodeSandbox [HERE](https://codesandbox.io/p/devbox/effer-examples-cj8lcy)

Where to find specific examples:

- the `replace()` function: All of the Effer components in the sandboxs use replace
- the `State.simple()` function: counter.ts
- the `State.reducer()` function: todo.controller.ts
- the `State.async()` function: posts.api.ts and posts.view.ts
- handling navigation: app.ts
- getting a query param: counter.ts
- using browser storage: todo.controller.ts
- making HTTP requests/working with Effect clients: posts.api.ts and posts.view.ts
- working with third party libraries like AG Grid: todo.controller.ts and todo.view.ts
