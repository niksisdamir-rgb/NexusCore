"use client";

import React, { useState } from "react";
import { useLogistics, Truck, TruckStatus } from "@/hooks/useLogistics";
import { 
  Truck as TruckIcon, 
  Navigation, 
  MapPin, 
  Clock, 
  Clipboard,
  Search,
  ArrowUpRight,
  TrendingDown,
  Info,
  RefreshCw,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SiloRefillCard } from "@/components/logistics/SiloRefillCard";

export default function LogistikaPage() {
  const { trucks, refillOrders, loading, refresh, triggerRefill } = useLogistics();
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const selectedTruck = trucks.find(t => t.id === selectedTruckId);

  return (
    <div className="p-6 h-full flex flex-col gap-6 max-w-[1600px] mx-auto bg-[#0a0e14]">
      {/* Header */}
      <div className="flex justify-between items-center bg-card/10 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-primary/10 text-primary border-primary/20">PHASE 7</Badge>
             <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Logistika <span className="text-primary">&</span> Fleet Twin</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Inteligentno praćenje flote i automatizacija lanca snabdevanja.</p>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">Aktivna flota</span>
             <span className="text-3xl font-black text-primary leading-none">
               {trucks.filter(t => t.status !== "IDLE").length} <span className="text-sm text-muted-foreground">/ {trucks.length}</span>
             </span>
          </div>
          <div className="h-12 w-px bg-white/10 mx-2" />
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">Silos Alerti</span>
             <span className="text-3xl font-black text-blue-500 leading-none">{refillOrders.length}</span>
          </div>
          <button 
            onClick={() => refresh()}
            className="ml-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
          >
            <RefreshCw className={cn("h-5 w-5 text-muted-foreground group-hover:text-white transition-colors", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Radar View (Central Control) */}
        <Card className="lg:col-span-2 border-primary/10 bg-black/60 backdrop-blur-3xl relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)]" />
          
          <CardHeader className="relative z-10 border-b border-white/5 bg-white/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-white">
                  <Activity className="h-4 w-4 text-primary animate-pulse" /> Digitalni Radar Flote
                </CardTitle>
                <CardDescription className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter">Live Telemetrija • Radius 15km</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 tracking-widest uppercase">SISTEM AKTIVAN</span>
                 </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="h-full min-h-[600px] relative flex items-center justify-center pt-0">
            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-40 flex gap-4 bg-black/60 p-2 rounded-lg border border-white/10 backdrop-blur-md">
               <div className="flex items-center gap-2 opacity-80">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Isporuka</span>
               </div>
               <div className="flex items-center gap-2 opacity-80">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Utovar</span>
               </div>
               <div className="flex items-center gap-2 opacity-80">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Povratak</span>
               </div>
            </div>

            {/* Radar Rings UI */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="absolute w-[80%] h-[80%] border-2 border-dashed border-primary/40 rounded-full animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-[60%] h-[60%] border border-primary/30 rounded-full" />
              <div className="absolute w-[40%] h-[40%] border border-primary/20 rounded-full" />
              <div className="absolute w-[20%] h-[20%] border border-primary/10 rounded-full" />
              {/* Axes */}
              <div className="absolute w-full h-px bg-primary/10" />
              <div className="absolute h-full w-px bg-primary/10" />
            </div>

            {/* Scanning Line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <motion.div 
                 className="absolute w-[50%] h-[1px] bg-gradient-to-r from-primary/60 to-transparent left-1/2 origin-left"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               />
            </div>

            {/* Plant Center */}
            <motion.div 
              className="absolute z-20 flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.6)] border-2 border-white/30 group-hover:scale-110 transition-transform duration-500">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <span className="text-[10px] font-black mt-2 text-primary uppercase tracking-widest px-2 py-0.5 bg-black/80 rounded-full border border-primary/20">HQ HODOVO</span>
            </motion.div>

            {/* Simulated Trucks on Radar */}
            {trucks.map((truck) => (
              <motion.button
                key={truck.id}
                onClick={() => setSelectedTruckId(truck.id)}
                className={cn(
                  "absolute z-30 transition-all",
                  selectedTruckId === truck.id ? "z-40" : ""
                )}
                style={{
                  // Radar layout uses radarX/radarY from DB
                  left: `calc(50% + ${(truck as any).radarX || 0}px)`,
                  top: `calc(50% + ${(truck as any).radarY || 0}px)`,
                }}
                animate={{
                    left: `calc(50% + ${(truck as any).radarX || 0}px)`,
                    top: `calc(50% + ${(truck as any).radarY || 0}px)`,
                }}
                transition={{ type: "spring", stiffness: 40, damping: 20 }}
              >
                <div className={cn(
                  "relative p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 shadow-2xl overflow-visible",
                  getStatusColor(truck.status, "bg"),
                  selectedTruckId === truck.id ? "scale-125 ring-4 ring-primary/40 brightness-125" : "hover:scale-110"
                )}>
                  {/* Ping effect for active status */}
                  {truck.status !== "IDLE" && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                  )}
                  <TruckIcon className="h-5 w-5 text-white" />
                  <span className="text-[8px] font-black text-white whitespace-nowrap tracking-tighter uppercase">{truck.plate}</span>
                </div>
                
                {/* Pointer line back to plant if transit */}
                {truck.status !== "IDLE" && (
                   <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        className="absolute h-px bg-gradient-to-r from-primary to-transparent origin-left pointer-events-none" 
                        style={{ 
                          width: Math.sqrt(((truck as any).radarX || 0)**2 + ((truck as any).radarY || 0)**2),
                          transform: `rotate(${Math.atan2(-((truck as any).radarY || 0), -((truck as any).radarX || 0))}rad)`
                        }} 
                   />
                )}
              </motion.button>
            ))}
          </CardContent>
        </Card>

        {/* Fleet Sidebar & Silo Automation */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Active Status board */}
            <Card className="flex flex-col overflow-hidden border-white/5 bg-white/5 shadow-2xl backdrop-blur-md">
               <CardHeader className="bg-white/5 py-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest text-white">
                      <Clipboard className="h-4 w-4 text-primary" /> Status flote
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                      <input className="bg-black/40 border border-white/10 h-8 pl-8 rounded-lg text-[10px] w-24 focus:w-32 transition-all outline-none text-white font-medium" placeholder="Pretraga..." />
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-hide">
                  <div className="divide-y divide-white/5">
                    {trucks.map((truck) => (
                      <button
                        key={truck.id}
                        onClick={() => setSelectedTruckId(truck.id)}
                        className={cn(
                          "w-full p-4 flex items-start gap-4 hover:bg-white/5 transition-colors text-left group border-l-4 border-transparent",
                          selectedTruckId === truck.id ? "bg-primary/10 border-l-primary" : ""
                        )}
                      >
                        <div className={cn("p-2 rounded-xl shadow-lg transition-transform group-hover:scale-110", getStatusColor(truck.status, "bg"))}>
                          <TruckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-black text-sm text-white tracking-tighter uppercase">{truck.plate}</h4>
                            <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full border", getStatusColor(truck.status, "text"), getStatusColor(truck.status, "border"))}>
                              {getStatusLabel(truck.status)}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tighter truncate">{truck.driver}</p>
                          
                          {truck.status !== "IDLE" && (
                            <div className="mt-3 space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                                <span>Isporuka {truck.progress.toFixed(0)}%</span>
                                <span className="text-white">ETA {Math.round((100 - truck.progress) / 2)} min</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                 <motion.div 
                                    className={cn("h-full rounded-full", getStatusColor(truck.status, "bg"))} 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${truck.progress}%` }}
                                  />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
               </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
               {/* Silo Automation Card */}
               <SiloRefillCard orders={refillOrders} onTriggerRefill={triggerRefill} />

               {/* Detailed Info Card (Visible when selected) */}
               <AnimatePresence mode="wait">
                  {selectedTruck ? (
                    <motion.div
                      key={selectedTruck.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-1"
                    >
                      <Card className="h-full border-primary/20 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] backdrop-blur-xl">
                        <CardHeader className="pb-2 border-b border-white/5 mb-4">
                          <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                            <Info className="h-4 w-4" /> Telemetrija Tele-Twin
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary/20 transition-colors">
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-50">Kapacitet</p>
                              <div className="flex items-end gap-1">
                                <p className="text-2xl font-black text-white">{selectedTruck.currentLoad || 0}</p>
                                <p className="text-xs text-muted-foreground font-bold pb-1">m³</p>
                              </div>
                            </div>
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary/20 transition-colors">
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-50">Status Islj.</p>
                              <p className="text-2xl font-black text-white font-mono uppercase tracking-tighter">#{selectedTruck.currentOrderId?.split("-")[1] || "READY"}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                             <div className="flex items-center gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                                <MapPin className="h-4 w-4 text-primary" />
                                <div>
                                   <p className="text-[9px] text-muted-foreground uppercase font-black leading-none mb-1">Destinacija</p>
                                   <span className="text-white font-black uppercase tracking-tighter leading-none">{selectedTruck.destination || "BAZA HODOVO"}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <div>
                                   <p className="text-[9px] text-muted-foreground uppercase font-black leading-none mb-1">Trajanje rute</p>
                                   <span className="text-blue-500 font-black uppercase tracking-tighter leading-none">~18 MINUTA</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col gap-3 pt-2">
                             <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 group">
                                <TrendingDown className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" /> PREUZMI E-OTPREMNICU
                             </button>
                             <button className="w-full bg-white/5 text-white/50 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/5">
                                <Navigation className="h-3 w-3" /> OTVORI NAVIGACIJU
                             </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-8 text-center opacity-30">
                       <TruckIcon className="h-12 w-12 mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest">Odaberite vozilo za detalje</p>
                    </div>
                  )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: TruckStatus, type: "bg" | "text" | "border") {
  switch (status) {
    case "IDLE": 
      if (type === "bg") return "bg-zinc-600";
      if (type === "text") return "text-zinc-500";
      return "border-zinc-500";
    case "LOADING": 
      if (type === "bg") return "bg-amber-500";
      if (type === "text") return "text-amber-500";
      return "border-amber-500";
    case "TRANSIT": 
      if (type === "bg") return "bg-blue-600";
      if (type === "text") return "text-blue-500";
      return "border-blue-500";
    case "DELIVERING": 
      if (type === "bg") return "bg-emerald-600";
      if (type === "text") return "text-emerald-500";
      return "border-emerald-500";
    case "RETURNING": 
      if (type === "bg") return "bg-indigo-600";
      if (type === "text") return "text-indigo-500";
      return "border-indigo-500";
    default: return "";
  }
}

function getStatusLabel(status: TruckStatus) {
  switch (status) {
    case "IDLE": return "U Bazi";
    case "LOADING": return "Utovarno";
    case "TRANSIT": return "Isporuka";
    case "DELIVERING": return "Istovar";
    case "RETURNING": return "U Povratku";
    default: return "";
  }
}
