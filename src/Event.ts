import { BrowserStream } from "@effect/platform-browser";
import { Effect, Layer, Stream } from "effect";

declare global {
	interface WindowEventMap {
		'effer': Effect.Effect<void>;
	}
}

const EventRunner = BrowserStream.fromEventListenerWindow("effer").pipe(
	Stream.mapEffect(e => e),
	Stream.runDrain
)

export const EventLayer = Layer.effectDiscard(EventRunner)