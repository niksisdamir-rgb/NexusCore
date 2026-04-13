/**
 * src/ai/workers/BackgroundWorker.ts
 *
 * Singleton background worker that:
 * - Simulates periodic sensor readings ingestion every 30s
 * - Keeps a heartbeat timestamp for the /api/ai/status endpoint
 *
 * Started via src/instrumentation.ts (Next.js server lifecycle hook).
 */

import { prisma } from "@/lib/db";
import { eventBus } from "@/lib/events";

interface WorkerState {
  running: boolean;
  startedAt: Date | null;
  lastRunAt: Date | null;
  lastError: string | null;
  totalRuns: number;
}

// ─── Singleton state ───────────────────────────────────────────────────────
const state: WorkerState = {
  running: false,
  startedAt: null,
  lastRunAt: null,
  lastError: null,
  totalRuns: 0,
};

let intervalHandle: ReturnType<typeof setInterval> | null = null;

// ─── Mock sensor data generator ────────────────────────────────────────────
function mockSensorValue(sensorId: string, sensorType: string): number {
  const noise = () => (Math.random() - 0.5) * 4;
  const base: Record<string, number> = {
    cement_silo_1:  61.7,
    sand_bin_1:     52.5,
    gravel_bin_1:   43.8,
    water_tank_1:   60.0,
    mixer_temp:     18.3,
    mixer_speed:    22.5,
    admix_pump_1:   4.2,
    output_scale_1: 2450,
  };
  const raw = (base[sensorId] ?? 50) + noise();
  if (sensorType === "LEVEL") return Math.max(0, Math.min(100, raw));
  return Math.max(0, raw);
}

const SENSORS = [
  { sensorId: "cement_silo_1",   sensorType: "LEVEL",       unit: "%" },
  { sensorId: "sand_bin_1",      sensorType: "LEVEL",       unit: "%" },
  { sensorId: "gravel_bin_1",    sensorType: "LEVEL",       unit: "%" },
  { sensorId: "water_tank_1",    sensorType: "LEVEL",       unit: "%" },
  { sensorId: "mixer_temp",      sensorType: "TEMPERATURE", unit: "°C" },
  { sensorId: "mixer_speed",     sensorType: "FLOW",        unit: "RPM" },
  { sensorId: "admix_pump_1",    sensorType: "FLOW",        unit: "L/min" },
  { sensorId: "output_scale_1",  sensorType: "WEIGHT",      unit: "kg" },
];

async function tick() {
  state.lastRunAt = new Date();
  state.totalRuns++;

  try {
    const dataBatch = SENSORS.map((s) => ({
      sensorId: s.sensorId,
      sensorType: s.sensorType,
      value: parseFloat(mockSensorValue(s.sensorId, s.sensorType).toFixed(2)),
      unit: s.unit,
    }));

    // 1. Persist to Database
    await prisma.sensorReading.createMany({
      data: dataBatch,
    });

    // 2. Broadcast via EventBus for Real-time SSE
    eventBus.emit("sensor_update", {
      timestamp: state.lastRunAt,
      readings: dataBatch,
      runIndex: state.totalRuns
    });

    state.lastError = null;
    console.log(`[BackgroundWorker] Tick #${state.totalRuns} — ${SENSORS.length} sensor readings ingested and broadcasted.`);
  } catch (err: any) {
    state.lastError = err.message;
    console.error("[BackgroundWorker] Tick error:", err.message);
    if (err.stack) console.error(err.stack);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────
export function startWorker(intervalMs = 5000) {
  if (state.running) {
    console.log("[BackgroundWorker] Already running, skipping start.");
    return;
  }

  state.running = true;
  state.startedAt = new Date();
  console.log(`[BackgroundWorker] Started — interval ${intervalMs}ms`);

  // Run immediately on start
  tick();
  intervalHandle = setInterval(tick, intervalMs);
}

export function stopWorker() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  state.running = false;
  console.log("[BackgroundWorker] Stopped.");
}

export function getWorkerStatus() {
  return { ...state };
}
