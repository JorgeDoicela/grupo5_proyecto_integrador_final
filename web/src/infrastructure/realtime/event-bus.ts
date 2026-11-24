export type RealtimeEventTopic = "knowledge-updated" | "evaluations-updated";

export interface RealtimeEventPayload {
  topic: RealtimeEventTopic;
  timestamp: string;
}

type Listener = (event: RealtimeEventPayload) => void;

class RealtimeEventBus {
  private readonly listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  publish(topic: RealtimeEventTopic): void {
    const payload: RealtimeEventPayload = {
      topic,
      timestamp: new Date().toISOString(),
    };
    for (const listener of this.listeners) {
      listener(payload);
    }
  }

  get subscriberCount(): number {
    return this.listeners.size;
  }
}

const globalForBus = globalThis as unknown as {
  realtimeEventBus: RealtimeEventBus | undefined;
};

export const realtimeEventBus =
  globalForBus.realtimeEventBus ?? new RealtimeEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForBus.realtimeEventBus = realtimeEventBus;
}
