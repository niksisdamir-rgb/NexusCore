"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Database,
  Wand2,
  FileUp,
  Loader2
} from "lucide-react";

export default function ReceptiPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();
      if (data.success) {
        setRecipes(data.recipes);
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

  const handleAIDirectProcess = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
       const res = await fetch("/api/ai/process", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ text: aiText })
       });
       const data = await res.json();
       if (data.success) {
         setAiText("");
         fetchData();
       } else {
         alert("AI Greška: " + (data.error || "Nepoznata greška"));
       }
    } catch (e) {
       alert("Greška pri komunikaciji sa AI agentom.");
    } finally {
       setAiLoading(false);
    }
  };

  const filtered = recipes.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upravljanje Receptima</h1>
          <p className="text-muted-foreground">Pregled i uređivanje sastava betona.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowAddForm(!showAddForm)}
             className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
           >
             <Plus className="h-4 w-4" /> Dodaj Recept
           </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm space-y-4">
           <h3 className="text-lg font-semibold flex items-center gap-2">
             <Wand2 className="h-5 w-5 text-blue-500" /> AI Instant uvoz (NexusCore)
           </h3>
           <p className="text-sm text-muted-foreground">Nalepite tekst recepture ili tehnički opis. Agent će automatski prepoznati sastojke i sačuvati bazu.</p>
           <textarea 
             className="w-full h-32 p-3 bg-muted border border-border rounded-md text-sm"
             placeholder="Primer: MB 30, cement 350kg, voda 160l, pesak 800kg..."
             value={aiText}
             onChange={(e) => setAiText(e.target.value)}
           />
           <button 
             onClick={handleAIDirectProcess}
             disabled={aiLoading}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
           >
             {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
             {aiLoading ? "Agent analizira..." : "Procesiraj i Sačuvaj Recept"}
           </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
           <div className="relative w-72">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <input 
               placeholder="Pretraži recepte..." 
               className="pl-9 w-full bg-background border border-border rounded-md py-1.5 text-sm"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <div className="text-sm text-muted-foreground">
             Ukupno: {filtered.length} recepta
           </div>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-3">Naziv Recepture</th>
              <th className="px-4 py-3 text-right">Cement (kg)</th>
              <th className="px-4 py-3 text-right">Voda (L)</th>
              <th className="px-4 py-3 text-right">Pesak (kg)</th>
              <th className="px-4 py-3 text-right">Šljunak (kg)</th>
              <th className="px-4 py-3 text-right">Dodaci (kg)</th>
              <th className="px-6 py-3 text-center">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Učitavanje podataka...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Nema pronađenih receptura.</td></tr>
            ) : filtered.map(recipe => (
              <tr key={recipe.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold">{recipe.name}</div>
                  <div className="text-[10px] text-muted-foreground">ID: {recipe.id}</div>
                </td>
                <td className="px-4 py-4 text-right">{recipe.cementAmount}</td>
                <td className="px-4 py-4 text-right">{recipe.waterAmount}</td>
                <td className="px-4 py-4 text-right">{recipe.sandAmount}</td>
                <td className="px-4 py-4 text-right">{recipe.gravelAmount}</td>
                <td className="px-4 py-4 text-right">{recipe.admixtureAmount || '0'}</td>
                <td className="px-6 py-4">
                   <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
