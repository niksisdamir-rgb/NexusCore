"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Circle, Database, Activity, RefreshCcw, LogOut, User } from "lucide-react";
import { useSensorStream } from "@/hooks/useSensorStream";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
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
  const pathname = usePathname();

  return (
    <header className="h-16 glass px-6 flex items-center justify-between sticky top-0 z-[50]">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-bold tracking-tight text-foreground uppercase">
          ELKONMIX <span className="text-primary tracking-widest font-black">90</span>
        </h1>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isLive ? "outline" : isConnecting ? "secondary" : "destructive"} 
            className="gap-1 px-2 py-0.5 transition-all font-mono"
          >
            <Circle className={`h-2 w-2 ${
              isLive ? "fill-green-500 text-green-500" : 
              isConnecting ? "fill-yellow-500 text-yellow-500 animate-pulse" : 
              "fill-red-500 text-red-500"
            }`} />
            {isLive ? "UŽIVO" : isConnecting ? "POVEZIVANJE..." : "OFFLINE"}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="ml-8 flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
          <Link 
            href="/" 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname === "/" ? "bg-background text-primary shadow-sm" : "hover:text-foreground"
            }`}
          >
            KOMANDNA TABLA
          </Link>
          <Link 
            href="/insights" 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              pathname === "/insights" ? "bg-background text-primary shadow-sm" : "hover:text-foreground"
            }`}
          >
            UVIDI I ODRŽAVANJE
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2" title="Status Baze Podataka">
          <Database className="h-4 w-4" />
          <span className={sysStatus?.services.database === "UP" ? "text-green-500/80" : "text-red-400"}>
            Baza: {sysStatus?.services.database || "..."}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mr-2" title="Status Pozadinskog Agenta">
          <Activity className="h-4 w-4" />
          <span className={sysStatus?.services.backgroundWorker === "RUNNING" ? "text-green-500/80" : "text-red-400"}>
            Agent: {sysStatus?.services.backgroundWorker || "..."}
          </span>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-border/50">
          <div className="flex flex-col items-end">
            <span className="text-foreground font-semibold leading-tight capitalize">
              {session?.user?.name || "Operater"}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">
              {(session?.user as any)?.role || "VIEWER"}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <div 
              className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-all hover:bg-primary/20 cursor-default ring-1 ring-primary/20"
            >
              <User className="h-4 w-4" />
            </div>
            
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-90"
              title="Odjava"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
