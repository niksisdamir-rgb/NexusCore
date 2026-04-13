/**
 * src/instrumentation.ts
 *
 * Next.js instrumentation hook — runs once when the server starts.
 * Used to bootstrap the NexusCore background worker.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in the Node.js server runtime (not edge, not client)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startWorker } = await import("./ai/workers/BackgroundWorker");
    startWorker(5000); // 5-second interval for real-time SCADA
    console.log("[Instrumentation] NexusCore BackgroundWorker registered.");
  }
}
