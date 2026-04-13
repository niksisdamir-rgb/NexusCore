"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the PlantScene so it only renders on client side (R3F)
const PlantScene = dynamic(() => import("./PlantScene"), { ssr: false });

export default function ScadaSystem() {
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
             <div className="p-4 bg-card border-border border rounded shadow">
                <h3 className="font-bold mb-2">AI Extraction Jobs</h3>
                <p className="text-2xl text-green-500">0 Pending</p>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
