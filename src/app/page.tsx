"use client";

import React, { useState, useEffect } from "react";
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
  History
} from "lucide-react";

const PlantScene = dynamic(() => import("@/components/elkonmix/PlantScene"), { ssr: false });

export default function DashboardPage() {
  const [data, setData] = useState({
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
    const interval = setInterval(fetchData, 10000); // Pulse every 10s
    return () => clearInterval(interval);
  }, []);

  // Calculate KPIs
  const dailyVolume = data.orders
    .filter((o: any) => o.status === "COMPLETED" && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((acc: number, o: any) => acc + o.quantity, 0);

  const activeOrder = data.orders.find((o: any) => o.status === "IN_PROGRESS");
  const lowStockCount = data.inventory.filter((i: any) => i.isLow).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Komandna Tabla</h1>
          <p className="text-muted-foreground">Pregled rada betonske baze u realnom vremenu.</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          Poslednje osvežavanje: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dnevna Proizvodnja</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyVolume.toFixed(1)} m³</div>
            <p className="text-xs text-muted-foreground">Ukupno isporučeno danas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivni Recept</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {activeOrder ? activeOrder.recipe?.name : "Nema aktivnih"}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeOrder ? `Serija: ${activeOrder.id}` : "Baza je u stanju pripravnosti"}
            </p>
          </CardContent>
        </Card>

        <Card className={lowStockCount > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upozorenja (Zalihe)</CardTitle>
            <TriangleAlert className={lowStockCount > 0 ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-muted-foreground"} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", lowStockCount > 0 && "text-amber-500")}>
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {lowStockCount > 0 ? "Materijala ispod kritičnog nivoa" : "Zalihe su optimalne"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Visualization */}
        <Card className="lg:col-span-3 h-[600px] relative overflow-hidden bg-black/20">
          <CardHeader className="absolute top-0 left-0 z-10 bg-gradient-to-b from-background/80 to-transparent w-full">
            <CardTitle className="text-lg flex items-center gap-2">
              <Factory className="h-5 w-5" /> 3D Vizuelizacija Pogona
            </CardTitle>
            <CardDescription>Live model Elkonmix-90 postrojenja</CardDescription>
          </CardHeader>
          <PlantScene activeOrders={data.orders} inventory={data.inventory} />
        </Card>

        {/* Side Info / Logs */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <History className="h-4 w-4" /> Zadnje Aktivnosti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {data.orders.slice(0, 5).map((order: any) => (
                 <div key={order.id} className="flex flex-col border-l-2 border-primary/20 pl-4 py-1">
                    <span className="text-xs font-semibold text-muted-foreground">Order #{order.id}</span>
                    <span className="text-sm font-medium">{order.recipe?.name}</span>
                    <div className="flex justify-between items-center mt-1">
                       <Badge variant="outline" className="text-[10px] py-0">{order.status}</Badge>
                       <span className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                 </div>
               ))}
               {data.orders.length === 0 && (
                 <p className="text-xs text-center text-muted-foreground py-10">Nema evidentiranih naloga</p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Minimal cn for component-local use if not imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
