// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  name: string;
  amount: number;
  capacity: number;
  unit?: string;
}

export interface StreamReading {
  sensorId: string;
  value: number; // 0-100 %
  timestamp?: string;
}

export interface PlantOrder {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  recipeName?: string;
  volume?: number;
}

// ─── Plant Config ─────────────────────────────────────────────────────────────

export const PLANT_CONFIG = {
  silos: {
    position: [-5, 4, -3] as [number, number, number],
    height: 8,
    radius: 1.5,
    funnelHeight: 2,
    gap: 3.5,
    labels: ["Cement S1", "Cement S2"],
    sensors: ["cement_silo_1", "cement_silo_2"],
    fallbackName: "Cement",
  },
  bins: {
    position: [6, 2, 0] as [number, number, number],
    width: 3,
    height: 3,
    depth: 2.3,
    gap: 2.5,
    count: 4,
    sensors: ["sand_bin_1", "gravel_bin_1", "sand_bin_2", "gravel_bin_2"],
    names: ["Pesak", "Šljunak", "Pesak", "Šljunak"],
    fillColors: ["#d97706", "#78350f"],
  },
  conveyor: {
    position: [2.5, 2.5, 0] as [number, number, number],
    rotation: [0, 0, Math.PI / 6] as [number, number, number],
    length: 8,
  },
  mixer: {
    position: [-1, 3, 0] as [number, number, number],
  },
  waterTanks: {
    position: [-9, 1.5, 4] as [number, number, number],
    labels: ["Voda", "Aditiv"],
    sensors: ["water_tank_1", "additive_tank_1"],
  },
  scaffolding: {
    beamColor: "#4b5563",
    beamWidth: 0.12,
  },
  camera: {
    position: [15, 12, 18] as [number, number, number],
    fov: 40,
  },
} as const;

// ─── Fill-level color helper ───────────────────────────────────────────────────

export function levelToColor(level: number): string {
  if (level > 0.6) return "#22c55e"; // green
  if (level > 0.3) return "#f59e0b"; // amber
  return "#ef4444";                  // red
}
