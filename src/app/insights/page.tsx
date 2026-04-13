"use client";

import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  History,
  Zap,
  Thermometer,
  Gauge
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Loader2 } from "lucide-react";

// Placeholder for future components
const HealthRing = ({ score, label }: { score: number, label: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative h-24 w-24 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle 
          cx="48" cy="48" r="40" 
          className="stroke-muted fill-none" 
          strokeWidth="8" 
        />
        <circle 
          cx="48" cy="48" r="40" 
          className="stroke-primary fill-none transition-all duration-1000" 
          strokeWidth="8" 
          strokeDasharray={`${2.51 * score} 251`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-lg font-black">{score}%</span>
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
  </div>
);

export default function InsightsPage() {
  const { report, loading, error } = useMaintenance();

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Analiziranje parametara pogona...</p>
      </div>
    );
  }

  const scores = report?.components || { 
    mixer: { score: 100 }, 
    conveyor: { score: 100 }, 
    silo: { score: 100 } 
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uvidi i Održavanje</h1>
          <p className="text-muted-foreground">AI analiza zdravlja pogona i prediktivna dijagnostika.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="glass py-1 px-3 border-green-500/20 text-green-500">
            <ShieldCheck className="h-3 w-3 mr-1" /> SISTEM ZAŠTIĆEN
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Overview */}
        <Card className="glass border-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> ZDRAVLJE KLJUČNIH KOMPONENTI
            </CardTitle>
            <CardDescription>Procena bazirana na real-time vibracijama i toploti</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-around py-8">
            <HealthRing score={scores.mixer.score} label="Mešalica" />
            <HealthRing score={scores.conveyor.score} label="Transportna Traka" />
            <HealthRing score={scores.silo.score} label="Silosni Sistem" />
            <HealthRing score={100} label="Sistem Vage" />
          </CardContent>
        </Card>

        {/* Predictive AI Alerts */}
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" /> AI PREDVIĐANJA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report?.alerts.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-4">Nema aktivnih upozorenja</p>
            )}
            {report?.alerts.map(alert => (
              <div key={alert.id} className={`p-3 border rounded-xl space-y-1 ${
                alert.type === 'URGENT' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
              }`}>
                <div className={`flex items-center gap-2 text-xs font-bold ${
                  alert.type === 'URGENT' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  <AlertTriangle className="h-3 w-3" /> {alert.type}
                </div>
                <p className="text-xs text-foreground font-medium">{alert.message}</p>
                <p className="text-[10px] text-muted-foreground">{alert.component}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Live Telemetry Stream for maintenance */}
         <Card className="glass border-none">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" /> KRITIČNI PARAMETRI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                   <span>Vibracija Mešalice</span>
                   <span className="text-green-500">12.4 mm/s²</span>
                 </div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 w-[12%]" />
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                   <span>Temperatura Motora</span>
                   <span className="text-orange-500">54.2 °C</span>
                 </div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 w-[54%]" />
                 </div>
               </div>
            </CardContent>
         </Card>

         {/* Maintenance History */}
         <Card className="glass border-none">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" /> ISTORIJA SERVISIRANJA
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="relative pl-6 border-l border-border space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-primary border-4 border-background" />
                    <p className="text-xs font-bold">Zamena senzora nivoa Silosa 2</p>
                    <p className="text-[10px] text-muted-foreground">12. April 2026. • Mehaničar: Marko M.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-muted border-4 border-background" />
                    <p className="text-xs font-bold">Kalibracija vage</p>
                    <p className="text-[10px] text-muted-foreground">10. April 2026. • Automatski proces</p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
