# Effer

An Effect native UI library based on lit-html.

## Installation

WIP.

## Creating a Counter with Effer

Example:

```ts
import { Data, Effect } from "effect";
import { Effer, html, makeReducer } from "effer";

type Msg = Data.TaggedEnum<{
    Increment: {};
    Decrement: {};
}>
const { Increment, Decrement, $match } = Data.taggedEnum<Msg>()

const makeCounterState = makeReducer(
    0, 
    (state: number, msg: Msg) => $match({
            Increment: () => Effect.succeed(state + 1),
            Decrement: () => Effect.succeed(state - 1),
        })(msg)
)

export class CounterService extends Effect.Service<CounterService>()('CounterService', {
    effect: makeCounterState
}) {}

const _Counter = () => Effect.gen(function*() {
    const { attach, queueMsg } = yield* Effer
    const [counterStream, counterQueue] = yield* CounterService

    return html`
        <section class="counter-container d-flex flex-row align-items-baseline justify-content-center">
            <button 
                class="btn btn-primary btn-sm counter-button" 
                id="decButton" 
                @click=${queueMsg(counterQueue, () => Increment())}
            >
                - 1
            </button>
            Count is ${attach(counterStream)}
            <button 
                class="btn btn-primary btn-sm counter-button" 
                id="incButton" 
                @click=${queueMsg(counterQueue, () => Decrement())}
            >
                + 1
            </button>
        </section>
    `
})

// Optional - make your component a service for ease of dependency management and mocking

export class Counter extends Effect.Service<Counter>()('Counter', {
    effect: _Counter(),
    dependencies: [CounterService.Default, Effer.Default]
}) {}
```


To bring our UI and business logic together, Effer gives us two tools: attach and queueMsg, both available in the Effer service.

```ts
const { attach, queueMsg } = yield* Effer
```

In the UI, we need to represent data changing over time. Effect gives us Streams as a way to do that. The attach method of the Effer service lets you "attach" a stream (or anything that can be converted to a Stream) to the UI, and the UI will automatically display the most up-to-date value of that Stream.

```ts
html`
    Count is ${attach(counterStream)}
`
```

Here is a complete list of what can be attached:

```ts
type Attachable<A,E,R> = 
    | Effect<A,E,R> 
    | SubscriptionRef<A>
    | PubSub<A> 
    | Queue<A> 
    | Stream<A,E,R>
    | Channel<Chunk.Chunk<A>, unknown, E, unknown, unknown, unknown, R> 
```

When we need to handle events from the UI, we do so with the queueMsg method of the Effer service. This function can go anywhere an event listener callback is expected (like onclick, onchange, etc.). It takes a queue to send the event to, and a function that maps from the DOM event to the queue's event that we want to dispatch:

```ts
html`
    <button 
        class="btn btn-primary btn-sm counter-button" 
        id="decButton" 
        @click=${queueMsg(counterQueue, (e: MouseEvent) => Increment())}
    >
`
```

To manage state, Effer provides two helper functions: makeReducer and makeState. These are very similar to useState and useEffect in React, except you use them outside your UI components as part of your business logic.

makeReducer lets you define a state and update it using events:

```ts
type Msg = Data.TaggedEnum<{
    Increment: {};
    Decrement: {};
}>
const { Increment, Decrement, $match } = Data.taggedEnum<Msg>()

const makeCounterState = makeReducer(
    0, 
    (state: number, msg: Msg) => $match({
            Increment: () => Effect.succeed(state + 1),
            Decrement: () => Effect.succeed(state - 1),
        })(msg)
)

// Making our state values a Service so we can easily pass it around
export class CounterService extends Effect.Service<CounterService>()('CounterService', {
    effect: makeCounterState
}) {}
```

We define the expected update messages as Increment and Decrement, and we provide a function that takes the old state and a message, and provides a new updated state. Now when we inject the service, we will get the stream of values as well as a queue to send updates to:

```ts
// counterQueue will accept either Increment or Decrement and the stream will update 
// according to the update function
const [counterStream, counterQueue] = yield* CounterService
```

makeState is very similar, but more simplified. We just provide an initial state, and the queue will accept new state values instead of messages. 

```ts
const makeCounterState = makeState(0)

// Making our state values a Service so we can easily pass it around
export class CounterService extends Effect.Service<CounterService>()('CounterService', {
    effect: makeCounterState
}) {}
```

```ts
// the counterQueue now accepts a number (the new count) instead of update messages
const [counterStream, counterQueue] = yield* CounterService
```
