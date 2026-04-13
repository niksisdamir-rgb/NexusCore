"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Circle, Database, Activity, RefreshCcw } from "lucide-react";
import { useSensorStream } from "@/hooks/useSensorStream";

export function Header() {
  const { status: streamStatus } = useSensorStream();
  const [sysStatus, setSysStatus] = useState<{ 
    ok: boolean; 
    services: { database: string; backgroundWorker: string } 
  } | null>(null);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/ai/status");
      const data = await res.json();
      setSysStatus(data);
    } catch (e) {
      setSysStatus({ ok: false, services: { database: "ERROR", backgroundWorker: "ERROR" } });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isLive = streamStatus === "live";
  const isConnecting = streamStatus === "connecting";

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">
          Sistem upravljanja Elkonmix-90
        </h1>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isLive ? "outline" : isConnecting ? "secondary" : "destructive"} 
            className="gap-1 px-2 py-0.5 transition-all"
          >
            <Circle className={`h-2 w-2 ${
              isLive ? "fill-green-500 text-green-500" : 
              isConnecting ? "fill-yellow-500 text-yellow-500 animate-pulse" : 
              "fill-red-500 text-red-500"
            }`} />
            {isLive ? "UŽIVO" : isConnecting ? "POVEZIVANJE..." : "OFFLINE"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2" title="Status Baze Podataka">
          <Database className="h-4 w-4" />
          <span className={sysStatus?.services.database === "UP" ? "text-green-500/80" : "text-red-400"}>
            Baza: {sysStatus?.services.database || "..."}
          </span>
        </div>
        <div className="flex items-center gap-2" title="Status Pozadinskog Agenta">
          <Activity className="h-4 w-4" />
          <span className={sysStatus?.services.backgroundWorker === "RUNNING" ? "text-green-500/80" : "text-red-400"}>
            Agent: {sysStatus?.services.backgroundWorker || "..."}
          </span>
        </div>
        <div 
          className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={checkStatus}
        >
          {sysStatus ? "OP" : <RefreshCcw className="h-4 w-4 animate-spin" />}
        </div>
      </div>
    </header>
  );
}
