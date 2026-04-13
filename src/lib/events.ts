import { EventEmitter } from "events";

/**
 * Global Event Bus for the NexusCore backend.
 * Facilitates real-time communication between background workers 
 * and API streaming routes (SSE).
 */
class GlobalEventBus extends EventEmitter {}

const globalForEvents = globalThis as unknown as {
  eventBus: GlobalEventBus | undefined;
};

// Global singleton instance
export const eventBus = globalForEvents.eventBus ?? new GlobalEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.eventBus = eventBus;
}

// Increase max listeners for many concurrent SSE connections
eventBus.setMaxListeners(100);
