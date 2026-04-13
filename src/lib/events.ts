import { EventEmitter } from "events";

/**
 * Global Event Bus for the NexusCore backend.
 * Facilitates real-time communication between background workers 
 * and API streaming routes (SSE).
 */
class GlobalEventBus extends EventEmitter {}

// Global singleton instance
const eventBus = new GlobalEventBus();

// Increase max listeners for many concurrent SSE connections
eventBus.setMaxListeners(100);

export { eventBus };
