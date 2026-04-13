import { prisma } from "@/lib/db";
import { GeminiProvider } from "../llm/providers/GeminiProvider";
import { StreamData } from "@/hooks/useSensorStream";

export interface DiagnosticsReport {
  healthScore: number; // 0-100
  components: {
    mixer: ComponentHealth;
    conveyor: ComponentHealth;
    silo: ComponentHealth;
  };
  alerts: MaintenanceAlert[];
  recommendations: string[];
}

export interface ComponentHealth {
  status: "GOOD" | "WARNING" | "CRITICAL";
  score: number;
}

export interface MaintenanceAlert {
  id: string;
  type: "PREVENTIVE" | "URGENT" | "INFO";
  component: string;
  message: string;
  timestamp: string;
}

export class MaintenanceAgent {
  private llm = new GeminiProvider();

  async runDiagnostics(): Promise<DiagnosticsReport> {
    // ... (existing code remains for historical analysis)
    const recentLogs = await prisma.telemetryLog.findMany({
      take: 100,
      orderBy: { timestamp: "desc" }
    });
    return this.calculateReport(recentLogs);
  }

  /**
   * Real-time analysis of the current telemetry frame
   */
  public analyzeStream(data: StreamData): { healthScore: number, alerts: MaintenanceAlert[] } {
    const alerts: MaintenanceAlert[] = [];
    
    const vibration = data.readings.find(r => r.sensorType === "VIBRATION")?.value || 0;
    const temperature = data.readings.find(r => r.sensorType === "TEMPERATURE")?.value || 0;

    if (vibration > 80) {
      alerts.push({
        id: `v-rt-${Date.now()}`,
        type: "URGENT",
        component: "Mixer",
        message: "High vibration detected in Mixer!",
        timestamp: new Date().toISOString()
      });
    }

    if (temperature > 70) {
      alerts.push({
        id: `t-rt-${Date.now()}`,
        type: "URGENT",
        component: "Mixer Motor",
        message: "Overheating detected in Motor!",
        timestamp: new Date().toISOString()
      });
    }

    // Silo Check
    data.readings.filter(r => r.sensorId.startsWith("Silo")).forEach(r => {
      if (r.value < 5) {
        alerts.push({
          id: r.sensorId, // Use sensor ID so 3D scene can match it
          type: "INFO",
          component: `Silos ${r.sensorId}`,
          message: `${r.sensorId} is almost empty!`,
          timestamp: new Date().toISOString()
        });
      }
    });

    const baseScore = 100 - (alerts.length * 20);
    return { healthScore: Math.max(0, baseScore), alerts };
  }

  private calculateReport(logs: any[]): DiagnosticsReport {
    // Helper to calculate the full diagnostics report from historical logs
    // (Logic moved from runDiagnostics for cleaner code)
    const alerts: MaintenanceAlert[] = [];
    const highVibration = logs.filter(l => l.vibrationLevel > 80);
    if (highVibration.length > 5) {
      alerts.push({
        id: `v-${Date.now()}`,
        type: "URGENT",
        component: "Mixer Main Bearing",
        message: "Otkrivene povišene vibracije mešalice. Moguće habanje ležajeva.",
        timestamp: new Date().toISOString()
      });
    }
    
    const mixerScore = Math.max(0, 100 - (alerts.length * 20));
    return {
      healthScore: Math.round((mixerScore + 95 + 98) / 3),
      components: {
        mixer: { status: mixerScore < 50 ? "CRITICAL" : (mixerScore < 90 ? "WARNING" : "GOOD"), score: mixerScore },
        conveyor: { status: "GOOD", score: 95 },
        silo: { status: "GOOD", score: 98 }
      },
      alerts,
      recommendations: ["Podmazati ležajeve...", "Očistiti senzore..."]
    };
  }
}
