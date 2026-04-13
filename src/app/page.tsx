"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TriangleAlert, 
  Factory, 
  Layers, 
  Truck,
  TrendingUp,
  History,
  Activity
} from "lucide-react";
import { useSensorStream } from "@/hooks/useSensorStream";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useLogistics } from "@/hooks/useLogistics";

const PlantScene = dynamic(() => import("@/components/elkonmix/PlantScene"), { ssr: false });
const VoiceAssistant = dynamic(() => import("@/components/elkonmix/VoiceAssistant"), { ssr: false });

export default function DashboardPage() {
  const { data: streamData, status: streamStatus } = useSensorStream();
  const { report: maintenanceReport } = useMaintenance();
  const { trucks } = useLogistics();
  const [data, setData] = useState<{
    recipes: any[];
    orders: any[];
    inventory: any[];
    loading: boolean;
  }>({
    recipes: [],
    orders: [],
    inventory: [],
    loading: true
  });

  const fetchData = async () => {
    try {
      const [resRecipes, resOrders, resInventory] = await Promise.all([
        fetch("/api/recipes").then(r => r.json()),
        fetch("/api/production").then(r => r.json()),
        fetch("/api/inventory").then(r => r.json())
      ]);

      setData({
        recipes: resRecipes.recipes || [],
        orders: resOrders.orders || [],
        inventory: resInventory.items || [],
        loading: false
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Pulse every 15s for structural data
    return () => clearInterval(interval);
  }, []);

  const handleVoiceAction = useCallback((action: any) => {
    console.log("Voice action received:", action);
    
    // Simulate local state update for immediate feedback in the Digital Twin
    if (action.intent === "START_PRODUCTION" || action.intent === "SET_RECIPE") {
      const mockOrder = {
        id: Math.floor(Math.random() * 1000),
        recipe: { name: action.parameters?.recipe || "MB-30" },
        quantity: action.parameters?.quantity || 1.0,
        status: "IN_PROGRESS",
        createdAt: new Date().toISOString()
      };
      
      setData(prev => ({
        ...prev,
        orders: [mockOrder, ...prev.orders]
      }));
    }
  }, []);

  // Calculate KPIs
  const dailyVolume = useMemo(() => {
    return data.orders
      .filter((o: any) => o.status === "COMPLETED" && new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((acc: number, o: any) => acc + o.quantity, 0);
  }, [data.orders]);

  const activeOrder = data.orders.find((o: any) => o.status === "IN_PROGRESS");
  const lowStockCount = data.inventory.filter((i: any) => i.isLow).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Komandna Tabla</h1>
          <p className="text-muted-foreground">Pregled rada betonske baze u realnom vremenu.</p>
        </div>
        <div className="text-right space-y-1">
          <div className="flex justify-end items-center gap-2">
            <Activity className={`h-3 w-3 ${streamStatus === 'live' ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Telemetrija: {streamStatus === 'live' ? 'UŽIVO' : 'PULSIRANJE'}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Osveženo: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Proizvodnja Danas</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dailyVolume.toFixed(1)} <span className="text-sm font-normal text-muted-foreground font-mono">m³</span></div>
            <p className="text-xs text-muted-foreground mt-1">Ukupno isporučeno do ovog trenutka</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Aktivni Nalog</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {activeOrder ? activeOrder.recipe?.name : "PRIPRAVNOST"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeOrder ? `Serija br. #${activeOrder.id}` : "Sistemi čekaju pokretanje naloga"}
            </p>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-md transition-shadow ${lowStockCount > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Alarm Zaliha</CardTitle>
            <TriangleAlert className={lowStockCount > 0 ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-muted-foreground"} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", lowStockCount > 0 && "text-amber-500")}>
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockCount > 0 ? "Kritičan nivo nekih agregata" : "Svi materijali su dostupni"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Visualization */}
        <Card className="lg:col-span-3 h-[600px] relative overflow-hidden bg-black/20 border-primary/10 shadow-inner">
          <CardHeader className="absolute top-0 left-0 z-10 bg-gradient-to-b from-background/90 to-transparent w-full pointer-events-none">
            <CardTitle className="text-lg flex items-center gap-2">
              <Factory className="h-5 w-5 text-primary" /> 3D Digitalni Blizanac Pogona
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Vizuelizacija senzora u realnom vremenu
            </CardDescription>
          </CardHeader>
          <PlantScene 
            activeOrders={data.orders} 
            inventory={data.inventory} 
            streamData={streamData}
            maintenanceReport={maintenanceReport}
          />
        </Card>

        {/* Side Info / Logs */}
        <div className="space-y-6 lg:col-span-1 flex flex-col">
          {/* Logistics Mini Widget */}
          <Card className="border-blue-500/20 bg-blue-500/5 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-blue-500/10 py-3">
              <CardTitle className="text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-500" /> 
                  <span>AKTIVNA FLOTA</span>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 font-bold border-blue-500/30 text-blue-500">
                  {trucks.filter(t => t.status !== "IDLE").length} AKTIVNO
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {trucks.filter(t => t.status !== "IDLE").slice(0, 3).map(truck => (
                <div key={truck.id} className="bg-background/40 p-2 rounded border border-border/50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                     <span className="text-[11px] font-bold">{truck.plate}</span>
                   </div>
                   <div className="text-[9px] font-medium text-muted-foreground uppercase opacity-70">
                      {truck.status === "TRANSIT" ? "U tranzitu" : truck.status === "LOADING" ? "Utovar" : "Na istovaru"}
                   </div>
                </div>
              ))}
              <div className="pt-1">
                <button 
                  onClick={() => window.location.href = "/logistika"}
                  className="w-full py-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest text-center"
                >
                  Otvori radar flote →
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 border-primary/10 shadow-sm flex flex-col min-h-0">
            <CardHeader className="pb-3 border-b border-border/50 py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" /> 
                  <span>ZADNJA IZDAVANJA</span>
                </div>
                <Badge variant="secondary" className="text-[9px] px-1.5 font-bold">{data.orders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-4 space-y-4 px-4 scrollbar-hide">
               {data.orders.slice(0, 8).map((order: any) => (
                 <div key={order.id} className="flex flex-col border-l-2 border-primary/30 pl-4 py-1.5 hover:bg-muted/30 transition-colors rounded-r-md cursor-default">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-primary tracking-tight">OPT-{order.id.toString().padStart(4, '0')}</span>
                      <span className="text-[9px] text-muted-foreground bg-muted px-1.5 rounded">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <span className="text-sm font-semibold">{order.recipe?.name}</span>
                    <div className="flex justify-between items-center mt-1">
                       <Badge variant={order.status === 'COMPLETED' ? 'outline' : 'default'} className="text-[9px] p-0 px-2 h-4">
                         {order.status === 'COMPLETED' ? 'ZAVRŠENO' : order.status}
                       </Badge>
                       <span className="text-[10px] font-mono">{order.quantity}m³</span>
                    </div>
                 </div>
               ))}
               {data.loading && (
                 <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Activity className="h-10 w-10 animate-spin opacity-20" />
                    <span className="text-xs italic">Učitavanje podataka...</span>
                 </div>
               )}
               {!data.loading && data.orders.length === 0 && (
                 <p className="text-xs text-center text-muted-foreground py-10 italic">Nema evidentiranih naloga</p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      <VoiceAssistant onAction={handleVoiceAction} />
    </div>
  );
}

// Minimal cn for component-local use if not imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
