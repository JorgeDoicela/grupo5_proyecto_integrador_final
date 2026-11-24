import { NextRequest } from "next/server";
import {
  realtimeEventBus,
  type RealtimeEventPayload,
} from "@/infrastructure/realtime/event-bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // El cliente ya cerró el stream
        }
      };

      send(`event: connected\ndata: ${JSON.stringify({ status: "ok" })}\n\n`);

      const unsubscribe = realtimeEventBus.subscribe(
        (payload: RealtimeEventPayload) => {
          send(`event: update\ndata: ${JSON.stringify(payload)}\n\n`);
        }
      );

      const heartbeat = setInterval(() => {
        send(`: ping ${Date.now()}\n\n`);
      }, 25000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream ya cerrado
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
