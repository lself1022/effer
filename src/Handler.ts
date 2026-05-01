import { Data, Effect, Queue, Stream, SubscriptionRef } from "effect";

export const make = <M,E=never,R=never>(handlerFn: (msg: M) => Effect.Effect<void, E,R>) => Effect.gen(function*() {
    const updateQueue = yield* Queue.unbounded<M>()

    yield* Effect.gen(function*() {
        const msg = yield* updateQueue.take
        yield* handlerFn(msg)
    }).pipe(
        Effect.forever,
        Effect.fork
    )
    const dispatch = (msg: M) => Queue.unsafeOffer(updateQueue, msg)
    return { dispatch }
})