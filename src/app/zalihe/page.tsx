"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, 
  ArrowDownUp, 
  Package, 
  AlertTriangle,
  RefreshCw,
  Plus
} from "lucide-react";

export default function ZalihePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upravljanje Zalihama</h1>
          <p className="text-muted-foreground">Monitoring nivoa sirovina i dopuna silosa.</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">Učitavanje zaliha...</div>
        ) : items.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 flex justify-between items-start">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.isLow ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                  </div>
               </div>
               {item.isLow && (
                 <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded">
                    <AlertTriangle className="h-3 w-3" /> Nizak nivo
                 </div>
               )}
            </div>

            <div className="px-5 pb-5 flex-1 flex flex-col justify-end">
               <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Količina:</span>
                  <span className="font-mono font-bold">{item.amount.toLocaleString()} {item.unit}</span>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden border border-border">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      item.fillPercent > 80 ? 'bg-orange-500' : 
                      item.fillPercent < item.lowThreshold / item.capacity * 100 ? 'bg-red-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${item.fillPercent}%` }}
                  ></div>
               </div>
               
               <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <span>Prazno</span>
                  <span>{Math.round(item.fillPercent)}%</span>
                  <span>Pun (max: {item.capacity.toLocaleString()})</span>
               </div>
            </div>

            <div className="p-3 border-t border-border bg-muted/30 flex gap-2">
               <button className="flex-1 text-xs font-semibold py-2 hover:bg-background rounded transition-all flex items-center justify-center gap-2 border border-transparent hover:border-border">
                  <ArrowDownUp className="h-3 w-3" /> Dopuni materijal
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
         <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
         <div>
            <h4 className="font-semibold text-amber-500">Logistička Napomena</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Sistem automatski detektuje nivoe preko ultrazvučnih senzora u silosima. 
              Vrednosti iznad prikazane u realnom vremenu odgovaraju stanju u bazi podataka `Inventory`.
            </p>
         </div>
      </div>
    </div>
  );
}
