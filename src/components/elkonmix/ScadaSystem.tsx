"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the PlantScene so it only renders on client side (R3F)
const PlantScene = dynamic(() => import("./PlantScene"), { ssr: false });

export default function ScadaSystem() {
  const [aiText, setAiText] = useState("Recipe Specification:\nName: High Strength C40\nCement: 350 kg\nWater: 180 L\nSand: 800 kg\nGravel: 1100 kg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [recipes, setRecipes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [resRecipes, resOrders] = await Promise.all([
        fetch("/api/recipes").then(r => r.json()),
        fetch("/api/production").then(r => r.json())
      ]);
      if (resRecipes.success) setRecipes(resRecipes.recipes);
      if (resOrders.success) setOrders(resOrders.orders);
    } catch (error) {
      console.error("Failed to load dashboard data.", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleAIProcess = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: aiText })
      });
      const data = await res.json();
      if (data.success) {
         setResult("Extraction Successful: " + data.aiResponse);
      } else {
         setResult("Error: " + data.error);
      }
    } catch (err: any) {
      setResult("Fetch Error: " + err.message);
    } finally {
      setLoading(false);
      fetchData(); // Refresh tables after processing
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start">
      <header className="w-full p-4 bg-primary text-primary-foreground flex justify-between items-center">
        <h1 className="text-xl font-bold">Elkonmix-90 | SCADA Dashboard</h1>
        <div className="flex space-x-4">
          <span>AI Background Extractor: Active</span>
          <span>Status: Normal</span>
        </div>
      </header>
      
      <div className="flex-1 w-full flex">
        <aside className="w-64 bg-card border-r border-border p-4 space-y-4">
          <nav className="flex flex-col space-y-2">
            <button className="p-2 text-left bg-muted rounded">Početna</button>
            <button className="p-2 text-left hover:bg-muted rounded">Recepti</button>
            <button className="p-2 text-left hover:bg-muted rounded">Plan proizvodnje</button>
            <button className="p-2 text-left hover:bg-muted rounded">Otpremnice</button>
            <button className="p-2 text-left hover:bg-muted rounded">Zalihe</button>
            <button className="p-2 text-left hover:bg-muted text-blue-500 rounded">AI Assistant</button>
          </nav>
        </aside>
        
        <main className="flex-1 p-6 flex flex-col space-y-4">
          <div className="h-[500px] w-full bg-black/5 rounded-lg overflow-hidden border border-border relative">
             <PlantScene />
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="p-4 bg-card border-border border rounded shadow">
                <h3 className="font-bold mb-2">Daily Production</h3>
                <p className="text-2xl">120 m³</p>
             </div>
             <div className="p-4 bg-card border-border border rounded shadow">
                <h3 className="font-bold mb-2">Active Recipe</h3>
                <p className="text-2xl">C30/37 XC4</p>
             </div>
             <div className="p-4 bg-card border-border border rounded shadow flex flex-col space-y-2 col-span-3">
                <h3 className="font-bold mb-2">AI Extraction Playground</h3>
                <textarea 
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  className="w-full p-2 text-sm bg-background border border-border rounded h-24"
                />
                <button 
                  onClick={handleAIProcess}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                  {loading ? "Processing via Agent..." : "Process Recipe with AI"}
                </button>
                {result && (
                  <div className="p-2 mt-2 bg-muted border border-border rounded text-sm break-words">
                    {result}
                  </div>
                )}
             </div>

             {/* Recent Recipes Table */}
             <div className="p-4 bg-card border-border border rounded shadow col-span-3">
                <h3 className="font-bold mb-4">Saved Recipes (Database)</h3>
                {dataLoading ? <p>Loading...</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2">ID</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Cement (kg)</th>
                          <th className="p-2">Water (L)</th>
                          <th className="p-2">Sand (kg)</th>
                          <th className="p-2">Gravel (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipes.map((r: any) => (
                          <tr key={r.id} className="border-b">
                            <td className="p-2">{r.id}</td>
                            <td className="p-2 font-medium">{r.name}</td>
                            <td className="p-2">{r.cementAmount}</td>
                            <td className="p-2">{r.waterAmount}</td>
                            <td className="p-2">{r.sandAmount}</td>
                            <td className="p-2">{r.gravelAmount}</td>
                          </tr>
                        ))}
                        {recipes.length === 0 && (
                          <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No recipes found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>

             {/* Active Production Orders Table */}
             <div className="p-4 bg-card border-border border rounded shadow col-span-3">
                <h3 className="font-bold mb-4">Active Production Orders</h3>
                {dataLoading ? <p>Loading...</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2">ID</th>
                          <th className="p-2">Recipe</th>
                          <th className="p-2">Quantity (m³)</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o: any) => (
                          <tr key={o.id} className="border-b">
                            <td className="p-2">{o.id}</td>
                            <td className="p-2">{o.recipe?.name || `Recipe #${o.recipeId}`}</td>
                            <td className="p-2">{o.quantity}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs text-white ${o.status === 'PENDING' ? 'bg-yellow-500' : o.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="p-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No active orders.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
