import { Effect, Effectable, Queue } from "effect";
import { DirectiveResult } from "lit-html/directive.js";
import { AsyncReplaceDirective } from "lit-html/directives/async-replace.js";


// interface Component<R> extends Effect.Effect<DirectiveResult<typeof AsyncReplaceDirective>, never, R> {

// }

export interface ComponentDef<M,R> {
    controller: (msg: M) => Effect.Effect<void, never, R>,
    view: (dispatch: (msg: M) => void) => Effect.Effect<DirectiveResult<typeof AsyncReplaceDirective>, never, R>
}

export const make = <M,R>(componentDef: ComponentDef<M,R>) => new Component(componentDef)

export class Component<M,R> extends Effectable.Class<DirectiveResult<typeof AsyncReplaceDirective>, never, R> {
    componentDef: ComponentDef<M,R>

    constructor(componentDef: ComponentDef<M,R>) {
        super()
        this.componentDef = componentDef
    }
    commit(): Effect.Effect<DirectiveResult<typeof AsyncReplaceDirective>, never, R> {
        const componentDef = this.componentDef
        return Effect.gen(function*() {
            const updateQueue = yield* Queue.unbounded<M>()

            yield* Effect.gen(function*() {
                const msg = yield* updateQueue.take
                yield* componentDef.controller(msg)
            }).pipe(
                Effect.forever,
                Effect.fork
            )
            const dispatch = (msg: M) => Queue.unsafeOffer(updateQueue, msg)
            return yield* componentDef.view(dispatch)
        })
    }
}

type Msg = "Increment" | "Decrement"

const Counter = make({
    controller(msg) {
        
    },
})