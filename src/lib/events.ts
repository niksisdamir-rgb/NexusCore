import { EventEmitter } from "events";

/**
 * Global telemetry event bus for the SCADA system.
 * Allows various API routes to emit events that are then 
 * streamed to all connected clients via SSE.
 */
class TelemetryEmitter extends EventEmitter {
  private static instance: TelemetryEmitter;

  private constructor() {
    super();
    // Increase listeners limit for industrial scalability
    this.setMaxListeners(100);
  }

  public static getInstance(): TelemetryEmitter {
    if (!TelemetryEmitter.instance) {
      TelemetryEmitter.instance = new TelemetryEmitter();
    }
    return TelemetryEmitter.instance;
  }

  /**
   * Helper to emit a typed telemetry event
   */
  public emitEvent(type: string, data: any) {
    this.emit("telemetry", {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substring(2, 11)
    });
  }
}

export const telemetryEmitter = TelemetryEmitter.getInstance();
