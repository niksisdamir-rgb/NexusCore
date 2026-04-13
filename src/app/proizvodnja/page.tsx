"use client";

import React, { useState, useEffect } from "react";
import { 
  Factory, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProizvodnjaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/production");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll faster for production
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/production/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      alert("Greška pri ažuriranju statusa.");
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite poništiti ovaj nalog?")) return;
    try {
      const res = await fetch(`/api/production/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Poništavanje nije dozvoljeno (nalog je verovatno već završen).");
      }
    } catch (e) {
      alert("Greška pri poništavanju.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Proizvodnje</h1>
          <p className="text-muted-foreground">Upravljanje redosledom mešanja i isporuke.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium">
          <Plus className="h-4 w-4" /> Novi Nalog
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">ID / Datum</th>
              <th className="px-6 py-4">Recept (Marka Betona)</th>
              <th className="px-6 py-4">Količina (m³)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Kontrole Panela</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Učitavanje plana...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Nema aktivnih naloga u planu.</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className={`hover:bg-muted/10 transition-colors ${order.status === 'IN_PROGRESS' ? 'bg-blue-500/5' : ''}`}>
                <td className="px-6 py-4">
                  <div className="font-mono text-xs font-bold text-primary">#{order.id}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{order.recipe?.name}</div>
                  <div className="text-[10px] text-muted-foreground">Cement: {order.recipe?.cementAmount}kg / {order.recipe?.waterAmount}L</div>
                </td>
                <td className="px-6 py-4 font-bold text-lg">
                  {order.quantity} <span className="text-xs font-normal text-muted-foreground whitespace-pre"> m³</span>
                </td>
                <td className="px-6 py-4">
                   {order.status === 'PENDING' && (
                     <div className="flex items-center gap-2 text-yellow-500">
                        <Clock className="h-4 w-4" /> <span className="font-semibold">U ČEKANJU</span>
                     </div>
                   )}
                   {order.status === 'IN_PROGRESS' && (
                     <div className="flex items-center gap-2 text-blue-500 animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" /> <span className="font-semibold">MEŠANJE U TOKU...</span>
                     </div>
                   )}
                   {order.status === 'COMPLETED' && (
                     <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="h-4 w-4" /> <span className="font-semibold">ZAVRŠENO</span>
                     </div>
                   )}
                   {order.status === 'CANCELLED' && (
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="h-4 w-4" /> <span className="font-semibold">OTKAZANO</span>
                     </div>
                   )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'IN_PROGRESS')}
                        disabled={updating === order.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Play className="h-3 w-3 fill-current" /> POKRENI
                      </button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'COMPLETED')}
                        disabled={updating === order.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="h-3 w-3" /> ZAVRŠI
                      </button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'IN_PROGRESS') && (
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="bg-muted hover:bg-red-500 hover:text-white text-muted-foreground px-3 py-1.5 rounded text-xs font-bold transition-all"
                      >
                        PONIŠTI
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-muted/50 border border-border rounded-lg flex items-center gap-4">
         <div className="p-3 bg-blue-500/10 rounded-full">
            <Factory className="h-6 w-6 text-blue-500" />
         </div>
         <div>
            <h4 className="text-sm font-bold">SCADA Kontrola</h4>
            <p className="text-xs text-muted-foreground">Promena statusa direktno utiče na 3D vizuelizaciju i logiku trošenja zaliha.</p>
         </div>
      </div>
    </div>
  );
}
