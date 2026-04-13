"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ScrollText, 
  Database, 
  FileText, 
  Factory, 
  Bot,
  TrendingUp,
  Stethoscope,
  Users,
  Settings
} from "lucide-react";

const navItems = [
  { name: "Komandna Tabla", href: "/", icon: LayoutDashboard },
  { name: "Recepti", href: "/recepti", icon: ScrollText },
  { name: "Plan Proizvodnje", href: "/proizvodnja", icon: Factory },
  { name: "Zalihe", href: "/zalihe", icon: Database },
  { name: "Otpremnice", href: "/otpremnice", icon: FileText },
  { name: "Izvještaji", href: "/izvjestaji", icon: TrendingUp },
  { name: "Održavanje", href: "/odrzavanje", icon: Stethoscope },
  { name: "Tim & Smene", href: "/tim", icon: Users },
  { name: "AI Asistent", href: "/ai-asistent", icon: Bot, color: "text-blue-500" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Factory className="h-6 w-6" /> Elkonmix-90
        </h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.color
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Postavke
        </Link>
      </div>
    </aside>
  );
}
