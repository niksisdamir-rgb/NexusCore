"use client";

import React from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Truck,
  Droplets,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const LiveTicker: React.FC = () => {
  const { events, isConnected } = useTelemetry();

  // Get the 3 most recent events for a "rotating" display if needed, 
  // but a simple list-ticker is more industrial.
  const displayEvents = events.slice(0, 5);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "PRODUCTION_STARTED": return <Zap className="h-3 w-3 text-blue-400" />;
      case "PRODUCTION_COMPLETED": return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
      case "PRODUCTION_SHORTAGE": return <AlertTriangle className="h-3 w-3 text-amber-400" />;
      case "VEHICLE_STATUS_CHANGE": return <Truck className="h-3 w-3 text-blue-400" />;
      case "SILO_REFILLED": return <Droplets className="h-3 w-3 text-cyan-400" />;
      case "PRODUCTION_CANCELLED": return <ShieldAlert className="h-3 w-3 text-rose-400" />;
      default: return <Activity className="h-3 w-3 text-slate-400" />;
    }
  };

  const formatEventText = (event: any) => {
    const { type, data } = event;
    switch (type) {
      case "PRODUCTION_STARTED": return `Nalog started: ${data.recipe}`;
      case "PRODUCTION_COMPLETED": return `Batch complete: ${data.recipe} (${data.volume} m³)`;
      case "PRODUCTION_SHORTAGE": return `Low Material: ${data.shortages.join(", ")}`;
      case "VEHICLE_STATUS_CHANGE": return `Truck ${data.number}: ${data.from} → ${data.to}`;
      case "SILO_REFILLED": return `Silo Refill: ${data.silo} (${data.amount} kg)`;
      case "PRODUCTION_CANCELLED": return `Cancelled: Order #${data.orderId}`;
      default: return "System Pulse Active";
    }
  };

  return (
    <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5 overflow-hidden max-w-xl w-full h-8 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-r border-slate-800 pr-3 flex-shrink-0">
        <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Feed</span>
      </div>

      <div className="relative flex-grow h-full flex items-center">
        <AnimatePresence mode="popLayout">
          {displayEvents.length > 0 ? (
            <motion.div
              key={displayEvents[0].id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {getEventIcon(displayEvents[0].type)}
              <span className="text-[11px] font-medium text-slate-300">
                {formatEventText(displayEvents[0])}
              </span>
              <span className="text-[9px] text-slate-600 font-mono italic">
                {new Date(displayEvents[0].timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-slate-600 flex items-center gap-2"
            >
              <Activity className="h-3 w-3 opacity-50" />
              Sistem spreman. Čekam telemetriju...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ticker Gradient Overlay for Fade Out */}
      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-slate-900/0 to-transparent pointer-events-none" />
    </div>
  );
};
