import { NextRequest } from "next/server";
import { telemetryEmitter } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Define the event listener
      const onTelemetry = (event: any) => {
        const chunk = `event: telemetry\ndata: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      };

      // 2. Subscribe to the global emitter
      telemetryEmitter.on("telemetry", onTelemetry);

      // 3. Send initial heartbeat/keep-alive
      const heartbeat = `event: ping\ndata: ${JSON.stringify({ status: "connected" })}\n\n`;
      controller.enqueue(encoder.encode(heartbeat));

      // 4. Handle connection close
      req.signal.addEventListener("abort", () => {
        telemetryEmitter.off("telemetry", onTelemetry);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
