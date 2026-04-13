"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Circle, Database, Activity } from "lucide-react";

export function Header() {
  const [status, setStatus] = useState<{ 
    ok: boolean; 
    services: { database: string; backgroundWorker: string } 
  } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/ai/status");
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        setStatus({ ok: false, services: { database: "ERROR", backgroundWorker: "ERROR" } });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const isLive = status?.ok && status?.services.database === "UP";

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">
          Sistem upravljanja Elkonmix-90
        </h1>
        {status && (
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? "outline" : "destructive"} className="gap-1 px-2 py-0.5">
              <Circle className={isLive ? "h-2 w-2 fill-green-500 text-green-500" : "h-2 w-2 fill-red-500 text-red-500"} />
              {isLive ? "UŽIVO" : "OFFLINE"}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Baza: {status?.services.database || "Provera..."}</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>Worker: {status?.services.backgroundWorker || "Provera..."}</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          OP
        </div>
      </div>
    </header>
  );
}
