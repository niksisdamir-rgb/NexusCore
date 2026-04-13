"use client";

import React, { useState } from "react";
import { useLogistics, Truck } from "@/hooks/useLogistics";
import { 
  Truck as TruckIcon, 
  Navigation, 
  MapPin, 
  Clock, 
  Clipboard,
  Search,
  ArrowUpRight,
  TrendingDown,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LogistikaPage() {
  const { trucks } = useLogistics();
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const selectedTruck = trucks.find(t => t.id === selectedTruckId);

  return (
    <div className="p-6 h-full flex flex-col gap-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-card/50 p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistika & Fleet Twin</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pratite kretanje miksera van pogona u realnom vremenu.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
             <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Aktivna flota</span>
             <span className="text-2xl font-black text-primary">{trucks.filter(t => t.status !== "IDLE").length} / {trucks.length}</span>
          </div>
          <div className="h-10 w-px bg-border mx-2" />
          <div className="flex flex-col items-end">
             <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">ETA Prosek</span>
             <span className="text-2xl font-black text-blue-500">22 min</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Radar View */}
        <Card className="lg:col-span-2 border-primary/10 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
          <CardHeader className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary animate-pulse" /> Digitalni Radar Flote
                </CardTitle>
                <CardDescription>Radijus 15km oko proizvodnog pogona</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary animate-pulse">LIVE SATELLITE</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-full min-h-[500px] relative flex items-center justify-center pt-0">
            {/* Radar Rings UI */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="absolute w-[80%] h-[80%] border-2 border-dashed border-primary rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[60%] h-[60%] border border-primary/50 rounded-full" />
              <div className="absolute w-[40%] h-[40%] border border-primary/50 rounded-full" />
              <div className="absolute w-[20%] h-[20%] border border-primary/50 rounded-full" />
              {/* Axes */}
              <div className="absolute w-full h-px bg-primary/30" />
              <div className="absolute h-full w-px bg-primary/30" />
            </div>

            {/* Plant Center */}
            <motion.div 
              className="absolute z-20 flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] border-2 border-white/20">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] font-black mt-1 text-white uppercase tracking-tighter">ELKONMIX-90</span>
            </motion.div>

            {/* Simulated Trucks on Radar */}
            {trucks.map((truck) => (
              <motion.button
                key={truck.id}
                onClick={() => setSelectedTruckId(truck.id)}
                className={cn(
                  "absolute z-30 group transition-all",
                  selectedTruckId === truck.id ? "z-40" : ""
                )}
                style={{
                  left: `calc(50% + ${truck.location[0]}px)`,
                  top: `calc(50% + ${truck.location[1]}px)`,
                }}
                animate={{
                  left: `calc(50% + ${truck.location[0]}px)`,
                  top: `calc(50% + ${truck.location[1]}px)`,
                }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-transform hover:scale-125 border flex flex-col items-center gap-1",
                  getStatusColor(truck.status, "bg"),
                  selectedTruckId === truck.id ? "scale-125 ring-2 ring-white" : ""
                )}>
                  <TruckIcon className="h-4 w-4 text-white" />
                  <span className="text-[8px] font-bold text-white whitespace-nowrap">{truck.plate}</span>
                </div>
                {/* Pointer line back to plant if transit */}
                {truck.status !== "IDLE" && (
                   <div className="absolute h-px bg-gradient-to-r from-primary to-transparent opacity-30 origin-left" 
                        style={{ 
                          width: Math.sqrt(truck.location[0]**2 + truck.location[1]**2),
                          transform: `rotate(${Math.atan2(-truck.location[1], -truck.location[0])}rad)`
                        }} 
                   />
                )}
              </motion.button>
            ))}
          </CardContent>
        </Card>

        {/* Fleet Sidebar */}
        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Active Status board */}
          <Card className="flex-1 overflow-hidden border-border/50">
             <CardHeader className="bg-muted/30 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Clipboard className="h-4 w-4" /> Status flote
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                    <input className="bg-background border border-border h-7 pl-7 rounded-md text-[10px] w-24 focus:w-32 transition-all outline-none" placeholder="Traži..." />
                  </div>
                </div>
             </CardHeader>
             <CardContent className="p-0 overflow-y-auto max-h-[600px]">
                <div className="divide-y divide-border/50">
                  {trucks.map((truck) => (
                    <button
                      key={truck.id}
                      onClick={() => setSelectedTruckId(truck.id)}
                      className={cn(
                        "w-full p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors text-left group",
                        selectedTruckId === truck.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", getStatusColor(truck.status, "bg"))}>
                        <TruckIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm leading-none">{truck.plate}</h4>
                          <span className={cn("text-[10px] font-bold uppercase", getStatusColor(truck.status, "text"))}>
                            {getStatusLabel(truck.status)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{truck.driver}</p>
                        {truck.status !== "IDLE" && (
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-[10px]">
                              <span>Napredak rute</span>
                              <span className="font-bold">{Math.round(truck.progress)}%</span>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                               <motion.div 
                                  className={cn("h-full", getStatusColor(truck.status, "bg"))} 
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

          {/* Detailed Info Card (Visible when selected) */}
          <AnimatePresence>
            {selectedTruck && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="border-primary/20 bg-primary/5 shadow-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" /> Detalji Isporuke
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Teret</p>
                        <p className="text-xl font-bold">{selectedTruck.loadVolume || 0} m³</p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Dostava br.</p>
                        <p className="text-xl font-bold font-mono">#{selectedTruck.orderId?.split("-")[1] || "---"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-bold">Odredište:</span>
                          <span className="text-muted-foreground truncate">{selectedTruck.destination || "N/A"}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="font-bold">Preostalo vreme:</span>
                          <span className="text-blue-500 font-bold">~14 min</span>
                       </div>
                    </div>

                    <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                       <TrendingDown className="h-3 w-3" /> PREUZMI DOKUMENTACIJU
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: TruckStatus, type: "bg" | "text") {
  switch (status) {
    case "IDLE": return type === "bg" ? "bg-gray-500" : "text-gray-500";
    case "LOADING": return type === "bg" ? "bg-amber-500" : "text-amber-500";
    case "TRANSIT": return type === "bg" ? "bg-blue-500" : "text-blue-500";
    case "DELIVERING": return type === "bg" ? "bg-emerald-500" : "text-emerald-500";
    case "RETURNING": return type === "bg" ? "bg-indigo-500" : "text-indigo-500";
    default: return "";
  }
}

function getStatusLabel(status: TruckStatus) {
  switch (status) {
    case "IDLE": return "Parkiran";
    case "LOADING": return "Utovar";
    case "TRANSIT": return "Isporuka";
    case "DELIVERING": return "Na istovaru";
    case "RETURNING": return "Povratak";
    default: return "";
  }
}
