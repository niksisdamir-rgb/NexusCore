"use client";

import { useState, useEffect } from "react";

export type TruckStatus = "IDLE" | "LOADING" | "TRANSIT" | "DELIVERING" | "RETURNING";

export interface Truck {
  id: string;
  plate: string;
  driver: string;
  status: TruckStatus;
  location: [number, number]; // [x, y] coordinates for mock map
  destination?: string;
  progress: number; // 0-100
  loadVolume?: number;
  orderId?: string;
}

const INITIAL_TRUCKS: Truck[] = [
  { id: "T-01", plate: "BG-123-AA", driver: "Marko M.", status: "TRANSIT", location: [120, 45], progress: 65, destination: "Gradilište 'West 65'", loadVolume: 9, orderId: "ORD-5501" },
  { id: "T-02", plate: "BG-456-BB", driver: "Nikola P.", status: "LOADING", location: [5, 5], progress: 20, destination: "Zemun Polje", loadVolume: 7, orderId: "ORD-5502" },
  { id: "T-03", plate: "BG-789-CC", driver: "Jovan S.", status: "DELIVERING", location: [240, -110], progress: 100, destination: "Novi Beograd", loadVolume: 9, orderId: "ORD-5498" },
  { id: "T-04", plate: "NS-101-DD", driver: "Stefan T.", status: "RETURNING", location: [80, -30], progress: 40, destination: "Pogon Elkonmix-90", loadVolume: 0 },
  { id: "T-05", plate: "BG-202-EE", driver: "Petar I.", status: "IDLE", location: [-10, -10], progress: 0 },
];

export function useLogistics() {
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrucks((prev) => 
        prev.map((truck) => {
          if (truck.status === "IDLE") return truck;

          let newProgress = truck.progress + (Math.random() * 2);
          let newStatus: TruckStatus = truck.status;
          let newLocation = [...truck.location] as [number, number];

          // Simple simulation movement
          if (truck.status === "TRANSIT") {
            newLocation[0] += (Math.random() - 0.2) * 2;
            newLocation[1] += (Math.random() - 0.5) * 2;
          } else if (truck.status === "LOADING") {
            if (newProgress >= 100) {
              newProgress = 0;
              newStatus = "TRANSIT";
            }
          } else if (truck.status === "RETURNING") {
            // Move back toward origin [0,0]
            newLocation[0] -= Math.sign(newLocation[0]) * 1.5;
            newLocation[1] -= Math.sign(newLocation[1]) * 1.5;
            if (Math.abs(newLocation[0]) < 10 && Math.abs(newLocation[1]) < 10) {
              newStatus = "IDLE";
              newProgress = 0;
            }
          }

          if (newProgress > 100) newProgress = 0;

          return {
            ...truck,
            progress: newProgress,
            status: newStatus,
            location: newLocation,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { trucks };
}
