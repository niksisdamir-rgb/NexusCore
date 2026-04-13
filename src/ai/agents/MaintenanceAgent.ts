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
    // 1. Fetch all assets to update their lifecycle stats
    const assets = await prisma.asset.findMany({
      include: { tickets: { where: { status: "OPEN" } } }
    });

    const recentLogs = await prisma.telemetryLog.findMany({
      take: 200,
      orderBy: { timestamp: "desc" }
    });

    // 2. Refresh Asset Usage & Health in DB
    // In a real SCADA, we'd sum up m3 from ProductionOrders since last install
    for (const asset of assets) {
       let wearFactor = 0;
       
       // Impact of vibration on health score
       const assetLogs = recentLogs.filter(l => l.vibrationLevel > 60);
       if (assetLogs.length > 10) wearFactor += 5;
       if (assetLogs.some(l => l.vibrationLevel > 90)) wearFactor += 15;

       // usage vs expected life
       const usageRatio = asset.currentUsage / asset.expectedLife;
       const ageImpact = usageRatio * 20; // Max 20% impact from pure age

       const newHealth = Math.max(0, Math.min(100, 100 - ageImpact - wearFactor));
       
       await prisma.asset.update({
         where: { id: asset.id },
         data: { 
           healthScore: newHealth,
           status: newHealth < 20 ? "FAILED" : (newHealth < 50 ? "MAINTENANCE" : "OPERATIONAL")
         }
       });

       // Auto-generate ticket if critical and no ticket exists
       if (newHealth < 30 && asset.tickets.length === 0) {
         await prisma.maintenanceTicket.create({
           data: {
             assetId: asset.id,
             title: `URGENT: Proactive maintenance for ${asset.name}`,
             description: `AI Predictor detected critical health score (${newHealth.toFixed(1)}%). Likely due to wear and recent vibration spikes.`,
             priority: "URGENT"
           }
         });
       }
    }

    return this.calculateReport(recentLogs, assets);
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

  private calculateReport(logs: any[], assets: any[]): DiagnosticsReport {
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

    // Map DB assets to component health format
    const mixerAsset = assets.find(a => a.type === "MOTOR" && a.name.includes("Mešalica"));
    const conveyorAsset = assets.find(a => a.type === "CONVEYOR");
    const siloAsset = assets.find(a => a.type === "SILO") || { healthScore: 98 };

    return {
      healthScore: Math.round(assets.reduce((acc, a) => acc + a.healthScore, 0) / (assets.length || 1)),
      components: {
        mixer: { 
          status: (mixerAsset?.healthScore || 100) < 50 ? "CRITICAL" : ((mixerAsset?.healthScore || 100) < 85 ? "WARNING" : "GOOD"), 
          score: mixerAsset?.healthScore || 100 
        },
        conveyor: { 
          status: (conveyorAsset?.healthScore || 100) < 50 ? "CRITICAL" : ((conveyorAsset?.healthScore || 100) < 85 ? "WARNING" : "GOOD"), 
          score: conveyorAsset?.healthScore || 100 
        },
        silo: { status: siloAsset.healthScore < 50 ? "CRITICAL" : "GOOD", score: siloAsset.healthScore }
      },
      alerts,
      recommendations: [
        "Planirati servis zamene trake u narednih 15 radnih sati.",
        "Proveriti pritezne vijke na motoru mešalice zbog vibracija.",
        "Analizirati kvalitet maziva u silositima (vlažnost)."
      ]
    };
  }
}
