import { describe, expect, it, vi } from "vitest";
import { realtimeEventBus } from "@/infrastructure/realtime/event-bus";

describe("RealtimeEventBus (SSE)", () => {
  it("notifica a los suscriptores y limpia al desuscribirse", () => {
    const listener = vi.fn();
    const unsubscribe = realtimeEventBus.subscribe(listener);

    realtimeEventBus.publish("knowledge-updated");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]?.topic).toBe("knowledge-updated");

    unsubscribe();
    realtimeEventBus.publish("evaluations-updated");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
