"use client";

import React, { useState, useEffect } from "react";
import { 
  XCircle, 
  Activity, 
  Thermometer, 
  Droplets, 
  CheckCircle2, 
  Clock,
  Download,
  Loader2,
  TrendingUp
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function BatchDetailsModal({ isOpen, onClose, order }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && order?.id) {
      fetchLogs();
    }
  }, [isOpen, order]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/production/${order.id}/telemetry`);
      const data = await res.json();
      if (data.success) {
        // Map data for charts
        const formatted = data.logs.map((l: any) => ({
          time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          load: l.mixerLoad,
          temp: l.temperature,
          humidity: l.humidity
        }));
        setLogs(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in transition-all">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Analitika Serije <span className="text-primary font-mono">#{order.id}</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] font-bold">
                  {order.recipe?.name}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <XCircle className="h-8 w-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Mixer Peak Load" value={`${Math.max(...logs.map(l => l.load), 0).toFixed(1)}%`} icon={<Activity className="text-blue-500" />} trend="High" />
            <StatCard label="Avg Temperature" value={`${(logs.reduce((acc, l) => acc + l.temp, 0) / (logs.length || 1)).toFixed(1)}°C`} icon={<Thermometer className="text-orange-500" />} trend="Stable" />
            <StatCard label="Rel. Humidity" value={`${(logs.reduce((acc, l) => acc + l.humidity, 0) / (logs.length || 1)).toFixed(1)}%`} icon={<Droplets className="text-cyan-500" />} trend="Optimal" />
            <StatCard label="Batch Quality" value="A+" icon={<CheckCircle2 className="text-green-500" />} trend="Verified" />
          </div>

          {/* Telemetry Charts */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-muted/20 border border-border rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Kriva Opterećenja Mešalice (%)
                </h3>
              </div>
              <div className="h-[300px] w-full">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : logs.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">Nema istorijskih podataka za ovaj nalog.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={logs}>
                      <defs>
                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="time" fontSize={10} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} fontSize={10} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-muted/20 border border-border rounded-xl p-6">
               <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Thermometer className="h-4 w-4 text-orange-500" />
                 Termalni & Hidrometrijski Profil
               </h3>
               <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={logs}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="time" hide />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
                      />
                      <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between items-center bg-muted/40">
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">NexusCore Telemetry Archive v1.2</p>
           <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95">
             <Download className="h-4 w-4" /> PREUZMI PUNI IZVEŠTAJ
           </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-card border border-border p-4 rounded-xl space-y-2 hover:border-primary/50 transition-all cursor-default group">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{icon}</div>
        <Badge className="text-[8px] bg-green-500/10 text-green-500 border-none">{trend}</Badge>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold">{label}</p>
        <p className="text-2xl font-black tabular-nums">{value}</p>
      </div>
    </div>
  );
}
