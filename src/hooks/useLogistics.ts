"use client";
import { useState, useEffect, useCallback } from "react";

export type TruckStatus = "IDLE" | "LOADING" | "TRANSIT" | "DELIVERING" | "RETURNING";

export interface Truck {
  id: string;
  plate: string;
  driver: string;
  status: TruckStatus;
  progress: number;
  lastLat: number;
  lastLng: number;
  destination?: string;
  currentLoad?: number;
  currentOrderId?: string;
}

export interface RefillOrder {
  id: number;
  material: string;
  quantity: number;
  unit: string;
  status: "PENDING" | "ORDERED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  provider: string;
  eta: string;
}

export function useLogistics() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [refillOrders, setRefillOrders] = useState<RefillOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/logistics");
      const data = await res.json();
      if (data.success) {
        setTrucks(data.vehicles);
        setRefillOrders(data.refillOrders);
      }
    } catch (e) {
      console.error("Logistics fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncData = useCallback(async () => {
    try {
      // Trigger simulation sync on server
      await fetch("/api/logistics/sync", { method: "POST" });
      await fetchData();
    } catch (e) {
      console.error("Sync failed:", e);
    }
  }, [fetchData]);

  const triggerRefill = useCallback(async () => {
    try {
      await fetch("/api/logistics/refill", { method: "POST" });
      await fetchData();
    } catch (e) {
       console.error("Refill trigger failed:", e);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    // Auto-sync every 10 seconds for simulation
    const interval = setInterval(syncData, 10000);
    return () => clearInterval(interval);
  }, [fetchData, syncData]);

  return { trucks, refillOrders, loading, refresh: fetchData, sync: syncData, triggerRefill };
}
