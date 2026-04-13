import { useEffect, useState, useCallback } from "react";

export interface TelemetryEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}

export function useTelemetry() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<TelemetryEvent | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/telemetry");

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("Telemetry stream connected");
    };

    eventSource.onerror = (err) => {
      console.error("Telemetry stream error:", err);
      setIsConnected(false);
      // EventSource automatically retries by default
    };

    eventSource.addEventListener("telemetry", (e) => {
      try {
        const payload = JSON.parse(e.data) as TelemetryEvent;
        setEvents((prev) => [payload, ...prev].slice(0, 50)); // Keep last 50
        setLastEvent(payload);
      } catch (err) {
        console.error("Error parsing telemetry event:", err);
      }
    });

    eventSource.addEventListener("ping", () => {
       // Keep-alive handled by browser, but we can log if needed
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    lastEvent,
    clearEvents
  };
}
