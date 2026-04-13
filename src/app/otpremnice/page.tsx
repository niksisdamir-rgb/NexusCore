"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Eye,
  Truck,
  Calendar,
  FileDown,
  Loader2
} from "lucide-react";
import { DeliveryNotePrint, DeliveryNoteData } from "@/components/DeliveryNotePrint";
import { generateDeliveryNotePDF } from "@/lib/exportUtils";

export default function OtpremnicePage() {
  const [deliveryNotes, setDeliveryNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [printingNote, setPrintingNote] = useState<DeliveryNoteData | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handlePrint = (note: any) => {
    const printData: DeliveryNoteData = {
      id: note.id,
      deliveryNoteNo: note.id.toString(),
      clientName: note.clientName,
      siteName: note.siteName || "",
      recipeName: note.order?.recipe?.name || "Nepoznato",
      volumeM3: note.volumeM3,
      orderNumber: note.orderNumber || "",
      productionNumber: note.productionNumber || "",
      mixingTime: note.mixingTime || 60,
      driverName: note.driverName || "",
      vehiclePlate: note.truckPlate || "",
      productionStartTime: note.productionStartTime ? new Date(note.productionStartTime).toLocaleString() : new Date(note.deliveredAt).toLocaleString(),
      productionEndTime: note.productionEndTime ? new Date(note.productionEndTime).toLocaleString() : new Date(note.deliveredAt).toLocaleString(),
      materialStats: note.materialStats ? JSON.parse(note.materialStats) : undefined,
    };
    setPrintingNote(printData);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = async (note: any) => {
    setDownloadingId(note.id);
    try {
      await generateDeliveryNotePDF(note);
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/otpremnice");
      const data = await res.json();
      if (data.success) {
        setDeliveryNotes(data.notes);
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

  const filtered = deliveryNotes.filter(n => 
    n.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    n.orderId?.toString().includes(search) ||
    n.truckPlate?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Otpremnice</h1>
          <p className="text-muted-foreground">Arhiva isporučenog betona i prateće dokumentacije.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={async () => {
                for(const note of filtered) {
                  await generateDeliveryNotePDF(note);
                }
             }}
             className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-md font-medium shadow-sm transition-all text-sm"
           >
             <FileDown className="h-4 w-4" /> Preuzmi Sve (PDF)
           </button>
           <button className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md font-medium border border-border text-sm">
             <Download className="h-4 w-4" /> Izvezi CSV
           </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
           <div className="relative w-72">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <input 
               placeholder="Pretraži kupca ili registraciju..." 
               className="pl-9 w-full bg-background border border-border rounded-md py-1.5 text-sm"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <div className="text-sm text-muted-foreground">
             {filtered.length} dokumenata pronađeno
           </div>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Broj / Ref</th>
              <th className="px-6 py-4">Kupac / Gradilište</th>
              <th className="px-4 py-4">Vozilo (Kamion)</th>
              <th className="px-4 py-4 text-right">Količina (m³)</th>
              <th className="px-6 py-4">Vreme Otpreme</th>
              <th className="px-6 py-4 text-center">Opcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Učitavanje arhive...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Nisu pronađene otpremnice.</td></tr>
            ) : filtered.map(note => (
              <tr key={note.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold">OPT-{note.id.toString().padStart(5, '0')}</div>
                  <div className="text-[10px] text-muted-foreground">Nalog: #{note.orderId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{note.clientName}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" /> {new Date(note.deliveredAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-4 uppercase font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3 w-3 text-muted-foreground" />
                    {note.truckPlate || "---"}
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-bold">
                  {note.volumeM3} <span className="text-[10px] font-normal text-muted-foreground">m³</span>
                </td>
                <td className="px-6 py-4 text-xs font-mono">
                  {new Date(note.deliveredAt).toLocaleTimeString()}
                </td>
                 <td className="px-6 py-4">
                   <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Pogledaj">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                         onClick={() => handleDownloadPDF(note)}
                         disabled={downloadingId === note.id}
                         className="p-1.5 hover:bg-primary/10 rounded text-blue-500 transition-colors disabled:opacity-50" 
                         title="Preuzmi PDF"
                      >
                        {downloadingId === note.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handlePrint(note)}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Štampaj putem pretraživača"
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
      {printingNote && (
        <div className="hidden print:block absolute inset-0 bg-white z-50">
          <DeliveryNotePrint data={printingNote} />
        </div>
      )}
    </div>
  );
}
