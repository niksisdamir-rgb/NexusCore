import { prisma } from "@/lib/db";
import { GeminiProvider } from "../llm/providers/GeminiProvider";

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
    // 1. Fetch recent telemetry (last 100 logs)
    const recentLogs = await prisma.telemetryLog.findMany({
      take: 100,
      orderBy: { timestamp: "desc" }
    });

    // 2. Perform Heuristic Analysis
    const alerts: MaintenanceAlert[] = [];
    
    // Check for high vibration
    const highVibration = recentLogs.filter(l => l.vibrationLevel > 80);
    if (highVibration.length > 5) {
      alerts.push({
        id: `vibe-${Date.now()}`,
        type: "URGENT",
        component: "Mixer Main Bearing",
        message: "Otkrivene povišene vibracije mešalice. Moguće habanje ležajeva.",
        timestamp: new Date().toISOString()
      });
    }

    // Check for temp anomalies
    const avgTemp = recentLogs.reduce((acc, l) => acc + l.temperature, 0) / (recentLogs.length || 1);
    const hotLogs = recentLogs.filter(l => l.temperature > avgTemp + 15);
    if (hotLogs.length > 0) {
      alerts.push({
        id: `temp-${Date.now()}`,
        type: "PREVENTIVE",
        component: "Mixer Motor",
        message: "Detektovan porast temperature motora iznad normale.",
        timestamp: new Date().toISOString()
      });
    }

    // 3. AI Inference Summary
    const mixerScore = Math.max(0, 100 - (alerts.filter(a => a.component.includes("Mixer")).length * 20));

    // 4. Generate Recommendations via LLM (Mocked or simplified for now, as we need telemetry context)
    const recommendations = [
      "Podmazati ležajeve glavne mešalice u narednih 48h.",
      "Proveriti zategnutost kaiša transportne trake.",
      "Očistiti senzore vlažnosti u silosu."
    ];

    return {
      healthScore: Math.round((mixerScore + 95 + 98) / 3),
      components: {
        mixer: { status: mixerScore < 50 ? "CRITICAL" : (mixerScore < 90 ? "WARNING" : "GOOD"), score: mixerScore },
        conveyor: { status: "GOOD", score: 95 },
        silo: { status: "GOOD", score: 98 }
      },
      alerts,
      recommendations
    };
  }
}
