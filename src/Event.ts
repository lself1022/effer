import { BrowserStream } from "@effect/platform-browser";
import { Effect, Layer, Stream } from "effect";

export class EfferEvent extends Event {
	static readonly eventName = 'effer';
	
	constructor(public readonly effect: Effect.Effect<void>) {
		super(EfferEvent.eventName, { bubbles: true });
	}
}

declare global {
	interface WindowEventMap {
		'effer': EfferEvent;
	}
}

const EventRunner = BrowserStream.fromEventListenerWindow("effer").pipe(
	Stream.mapEffect(e => e.effect),
	Stream.runDrain,
	Effect.forever,
	Effect.fork
)

export const EventLayer = Layer.effectDiscard(EventRunner)