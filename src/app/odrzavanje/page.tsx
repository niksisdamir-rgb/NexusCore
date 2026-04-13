"use client";

import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Zap,
  HardHat,
  RefreshCw,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";

export default function MaintenancePage() {
  const [report, setReport] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDiag, resAssets] = await Promise.all([
        fetch("/api/ai/diagnostics").then(r => r.json()),
        fetch("/api/assets").then(r => r.json())
      ]);
      
      if (resDiag.success) setReport(resDiag.report);
      if (resAssets.success) setAssets(resAssets.assets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async (assetId: number, ticketId: number) => {
    try {
       const res = await fetch("/api/assets", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "RESOLVE_TICKET", assetId, ticketId, data: { technician: "Amir Admin" } })
       });
       if (res.ok) {
         fetchData();
         alert("Ticket uspešno zatvoren. Servis logovan.");
       }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !report) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Analiziranje hardverskih patterna...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-card/50 p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <Stethoscope className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Održavanje</h1>
            <p className="text-muted-foreground mt-1">Dijagnostika vitalnih funkcija postrojenja u realnom vremenu.</p>
          </div>
        </div>
        
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-bold border border-border transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          RE-ANALIZA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Health Score & Gauges */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Global Health Score</h3>
            <div className="relative flex items-center justify-center">
               <div className="text-6xl font-black">{report?.healthScore}%</div>
               <svg className="absolute -inset-4 h-[120px] w-[120px] -rotate-90">
                 <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary/10" />
                 <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray={339} strokeDashoffset={339 - (339 * report?.healthScore / 100)} />
               </svg>
            </div>
            <p className="text-xs text-muted-foreground">Bazirano na poslednjih 100 ciklusa proizvodnje.</p>
            <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/20">SISTEM OPERATIVAN</div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-4">Status Komponenti</h3>
            <div className="space-y-6">
              {assets.map((asset) => (
                <ComponentGauge 
                  key={asset.id}
                  name={asset.name} 
                  score={asset.healthScore} 
                  status={asset.status === "FAILED" ? "CRITICAL" : (asset.healthScore < 60 ? "WARNING" : "GOOD")} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Alerts & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
           {/* Recommendations */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report?.recommendations.map((rec: string, i: number) => (
                <div key={i} className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 group hover:bg-blue-500/10 transition-colors">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><Zap className="h-4 w-4 text-blue-500" /></div>
                  <div className="text-[11px] font-medium leading-relaxed">{rec}</div>
                </div>
              ))}
           </div>

           {/* Active Alerts */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Operativni Tiketi ({assets.reduce((acc, a) => acc + a.tickets.filter((t:any) => t.status === 'OPEN').length, 0)})
                </h3>
              </div>
              <div className="divide-y divide-border">
                {assets.every(a => a.tickets.filter((t:any) => t.status === 'OPEN').length === 0) ? (
                  <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                    <ShieldCheck className="h-10 w-10 opacity-20" />
                    Svi tiketi su zatvoreni.
                  </div>
                ) : assets.map(asset => (
                  asset.tickets.filter((t:any) => t.status === 'OPEN').map((ticket: any) => (
                    <div key={ticket.id} className="p-6 flex items-start justify-between group hover:bg-muted/30 transition-colors">
                        <div className="flex gap-4">
                          <div className={`p-3 rounded-xl ${ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                             <Activity className={`h-5 w-5 ${ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase">{asset.name}</span>
                              <Badge variant="outline" className={`text-[8px] font-bold h-4 ${ticket.priority === 'URGENT' ? 'text-red-500 border-red-500/20' : 'text-amber-500 border-amber-500/20'}`}>
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="text-sm font-bold">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">{ticket.description}</p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                               <Clock className="h-3 w-3" />
                               Kreirano: {new Date(ticket.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleResolveTicket(asset.id, ticket.id)}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                          ZATVORI TIKET
                        </button>
                    </div>
                  ))
                ))}
              </div>
            </div>

            {/* Service Logs */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/10 font-bold text-xs uppercase tracking-widest">
                   Istorija Servisa (Logovi)
                </div>
                <div className="divide-y divide-border">
                   {assets.flatMap(a => a.logs).slice(0, 5).map((log: any) => (
                     <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-blue-500" />
                           <div>
                              <span className="font-bold">{assets.find(a => a.id === log.assetId)?.name}</span>
                              <span className="mx-2 text-muted-foreground">|</span>
                              <span>{log.description}</span>
                           </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                           {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                     </div>
                   ))}
                   {assets.flatMap(a => a.logs).length === 0 && (
                     <div className="p-8 text-center text-muted-foreground italic text-xs">Nema zabeleženih servisnih zapisa.</div>
                   )}
                </div>
            </div>


           {/* Safety Section */}
           <div className="p-6 bg-muted/40 border border-border rounded-2xl flex items-center gap-6">
              <div className="h-16 w-16 bg-card border border-border rounded-2xl flex items-center justify-center">
                <HardHat className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">Inženjerski Protokol</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Pratite AI preporuke za produženje životnog ciklusa mehanizacije. Svaka detektovana anomalija se automatski beleži u Dnevnik Održavanja.
                </p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold text-xs">
                Otvori Dokumentaciju <ArrowRight className="h-4 w-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function ComponentGauge({ name, score, status }: any) {
  const color = status === "CRITICAL" ? "text-red-500" : (status === "WARNING" ? "text-amber-500" : "text-green-500");
  const bgColor = status === "CRITICAL" ? "bg-red-500/10" : (status === "WARNING" ? "bg-amber-500/10" : "bg-green-500/10");

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span>{name}</span>
        <span className={color}>{score}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${status === 'CRITICAL' ? 'bg-red-500' : (status === 'WARNING' ? 'bg-amber-500' : 'bg-green-500')}`} 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
