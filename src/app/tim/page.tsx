"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  BarChart3, 
  Zap, 
  UserCheck,
  ChevronRight,
  Target,
  Search,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function WorkforcePage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/workforce");
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading && !analysis) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground italic">Analiziranje timskog učinka...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tim & Smene</h1>
            <p className="text-muted-foreground mt-1">Analitika ljudskih resursa i operativna efikasnost postrojenja.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <input placeholder="Pretraži operatera..." className="pl-9 h-10 w-64 bg-background border border-border rounded-lg text-sm" />
           </div>
           <button 
             onClick={fetchAnalysis}
             className="p-2 hover:bg-muted rounded-lg border border-border transition-all"
           >
             <RefreshCw className={loading ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Leaderboard Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" /> Top Operateri
            </div>
            <div className="divide-y divide-border">
              {analysis?.operators.map((op: any, i: number) => (
                <div key={op.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                        {op.name.charAt(0)}
                      </div>
                      {i === 0 && <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 border-2 border-card"><Award className="h-3 w-3 text-white" /></div>}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{op.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{op.totalVolume.toFixed(1)} m³ isporučeno</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-primary">{op.efficiencyScore}%</div>
                    <Badge className="text-[8px] h-3 px-1">{op.precisionRank}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl space-y-3">
             <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-500">
               <Target className="h-4 w-4" /> Shift Comparison
             </h3>
             <p className="text-xs leading-relaxed italic text-muted-foreground">
               "{analysis?.shiftComparison}"
             </p>
          </div>
        </div>

        {/* Analytics & Charts Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Performance Chart */}
             <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Prosecni Ciklus (Minuti)
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis?.operators} layout="vertical" margin={{ left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                      <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }} />
                      <Bar dataKey="avgCycleTime" radius={[0, 4, 4, 0]} barSize={20}>
                        {analysis?.operators.map((op: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={op.efficiencyScore > 85 ? '#10b981' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Insights & Recommendations */}
             <div className="grid grid-cols-1 gap-4">
               <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" /> AI Insights
                  </h3>
                  <div className="space-y-4">
                    {analysis?.bottlenecks.map((b: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="mt-1 h-5 w-5 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0">
                           <Clock className="h-3 w-3 text-red-500" />
                        </div>
                        <p className="text-xs font-medium leading-relaxed">{b}</p>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Award className="h-32 w-32" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Preporuke Agenta</h3>
                  <div className="space-y-2">
                    {analysis?.recommendations.map((r: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> {r}
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>

          {/* Active Shift Card */}
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
             <div className="h-24 w-24 rounded-full border-4 border-green-500/20 p-2 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                <UserCheck className="h-10 w-10 text-green-500" />
             </div>
             <div className="flex-1 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                 <h4 className="text-2xl font-black">Aktivna Smena: Prva (06-14h)</h4>
                 <Badge className="bg-green-500">LIVE</Badge>
               </div>
               <p className="text-muted-foreground text-sm max-w-xl">
                 Trenutno prijavljen operater: **Marko Petrović**. Ukupan učinak u smeni: 24.5 m³ (Prevazilazi cilj za 2.1 m³). 
                 Sve sistemske funkcije su u optimalnom režimu.
               </p>
             </div>
             <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center gap-2">
               ZAVRŠI SMENU <ChevronRight className="h-4 w-4" />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
