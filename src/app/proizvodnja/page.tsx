"use client";

import React, { useState, useEffect } from "react";
import { 
  Factory, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  Plus,
  Printer
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkOrderPrint, WorkOrderData } from "@/components/WorkOrderPrint";

export default function ProizvodnjaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [smartExtractText, setSmartExtractText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [newOrder, setNewOrder] = useState({
    recipeId: "",
    quantity: 1,
  });
  const [printingOrder, setPrintingOrder] = useState<WorkOrderData | null>(null);

  const handlePrint = (order: any) => {
    const printData: WorkOrderData = {
      id: order.id,
      recipeName: order.recipe?.name || "Nepoznato",
      quantity: order.quantity,
      createdAt: order.createdAt,
      status: order.status,
      recipeDetails: {
        cementAmount: order.recipe?.cementAmount || 0,
        waterAmount: order.recipe?.waterAmount || 0,
        sandAmount: order.recipe?.sandAmount || 0,
        gravelAmount: order.recipe?.gravelAmount || 0,
        admixtureAmount: order.recipe?.admixtureAmount || null,
      }
    };
    setPrintingOrder(printData);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const fetchData = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/production"),
        fetch("/api/recipes")
      ]);
      const pData = await pRes.json();
      const rData = await rRes.json();
      
      if (pData.success) setOrders(pData.orders);
      if (rData.success) setRecipes(rData.recipes);
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
        alert(data.error || "Poništavanje nije dozvoljeno.");
      }
    } catch (e) {
      alert("Greška pri poništavanju.");
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewOrder({ recipeId: "", quantity: 1 });
        fetchData();
      }
    } catch (e) {
      alert("Greška pri kreiranju naloga.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSmartExtract = async () => {
    if (!smartExtractText.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/extract-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: smartExtractText })
      });
      const data = await res.json();
      if (data.success) {
        // AI created a new recipe, add it to the list and select it
        setRecipes([data.recipe, ...recipes]);
        setNewOrder({ ...newOrder, recipeId: data.recipe.id.toString() });
        setSmartExtractText("");
        alert(`Uspešno ekstraktovan recept: ${data.recipe.name}`);
      } else {
        alert(data.error || "AI nije uspeo da prepozna recept.");
      }
    } catch (e) {
      alert("Greška u AI komunikaciji.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Proizvodnje</h1>
          <p className="text-muted-foreground">Upravljanje redosledom mešanja i isporuke.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
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
                    <button 
                      onClick={() => handlePrint(order)}
                      className="bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-1.5 rounded flex items-center shadow-sm"
                      title="Štampaj Radni Nalog"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold">Kreiraj Novi Nalog</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Manual Form */}
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Izaberi Recept</label>
                  <select 
                    value={newOrder.recipeId}
                    onChange={(e) => setNewOrder({...newOrder, recipeId: e.target.value})}
                    required
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">-- Selektuj Recept --</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Količina (m³)</label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                    required
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting || !newOrder.recipeId}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  DODAJ U PLAN
                </button>
              </form>

              {/* Right Column: AI Smart Extract */}
              <div className="space-y-4 p-4 bg-muted/20 border border-dashed border-border rounded-lg">
                <div className="flex items-center gap-2 text-blue-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider">NexusCore AI Smart Extract</h3>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Zalepite tekst specifikacije ili opiše recept (npr. "Recept C30/37, 300kg cement, 0.5% aditiv"). 
                  Agent će automatski kreirati recept.
                </p>
                <textarea 
                  value={smartExtractText}
                  onChange={(e) => setSmartExtractText(e.target.value)}
                  placeholder="Zalepite specifikaciju ovde..."
                  className="w-full h-24 bg-background border border-border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <button 
                  onClick={handleSmartExtract}
                  disabled={aiLoading || !smartExtractText}
                  className="w-full border border-blue-500/50 text-blue-500 hover:bg-blue-500 hover:text-white py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  SMART EKSTRAKCIJA
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-blue-500/5 text-[10px] text-blue-600 font-medium text-center border-t border-border">
               Agent koristi Gemini 1.5 Pro za super-precizno mapiranje materijala.
            </div>
          </div>
        </div>
      )}

      {printingOrder && (
        <div className="hidden print:block absolute inset-0 bg-white z-50">
          <WorkOrderPrint data={printingOrder} />
        </div>
      )}
    </div>
  );
}
