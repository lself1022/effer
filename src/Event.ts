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
		'effer': Effect.Effect<void>;
	}
}

const EventQueue = BrowserStream.fromEventListenerWindow("effer").pipe(
	Stream.mapEffect(e => e),
	Stream.runDrain
)

const EventLayer = Layer.effectDiscard(EventQueue)