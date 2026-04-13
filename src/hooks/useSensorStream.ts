"use client";

import { useEffect, useState, useCallback } from "react";

export interface SensorReading {
  sensorId: string;
  sensorType: string;
  value: number;
  unit: string;
}

export interface StreamData {
  timestamp: string;
  readings: SensorReading[];
  runIndex: number;
}

/**
 * useSensorStream
 * 
 * Custom hook to subscribe to the real-time SCADA telemetry stream.
 * Connects via Server-Sent Events (SSE).
 */
export function useSensorStream() {
  const [data, setData] = useState<StreamData | null>(null);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    function connect() {
      setStatus("connecting");
      // Use standard EventSource for SSE
      eventSource = new EventSource("/api/sensors/stream");

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
          setStatus("live");
          setError(null);
        } catch (e) {
          console.error("Failed to parse SSE message:", e);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Connection error:", err);
        setStatus("offline");
        setError("Veza sa serverom je prekinuta. Pokušaj ponovnog povezivanja...");
        eventSource?.close();
        
        // Exponential backoff or simple retry
        setTimeout(connect, 5000);
      };

      eventSource.onopen = () => {
        console.log("SSE Stream connected.");
        setStatus("live");
      };
    }

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { data, status, error };
}
