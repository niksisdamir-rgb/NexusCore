import { verifyReport } from "@/lib/crypto";
import { 
  ShieldCheck, 
  Factory, 
  Calendar, 
  Box, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

interface VerifyPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const { 
    d: date, 
    v: volume, 
    s: signature, 
    t: type = "daily",
    id,
    client
  } = params;

  // Basic validation of presence
  if (!signature || !volume) {
    return <ErrorState message="Nedostaju parametri za verifikaciju." />;
  }

  // Verification Logic
  let validationParams: Record<string, string | number> = {};
  if (type === "otpremnica") {
    validationParams = { id: id || "", volume, client: client || "" };
  } else {
    validationParams = { date: date || "", volume, type };
  }
  
  const isValid = verifyReport(validationParams, signature);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Decor */}
        <div className={`h-2 w-full ${isValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        
        <div className="p-8 space-y-8">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2 opacity-50">
            <Factory className="h-5 w-5" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Elkonmix-90 System</span>
          </div>

          {/* Result Icon */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {isValid ? (
              <>
                <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold font-display">Dokument Verifikovan</h2>
                  <p className="text-slate-400 text-sm mt-1">Podaci se poklapaju sa originalnim zapisom u bazi.</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-20 w-20 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                  <ShieldAlert className="h-10 w-10 text-rose-500" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-rose-500">Nevalidan Dokument</h2>
                  <p className="text-slate-400 text-sm mt-1">Elektronski potpis se ne podudara sa podacima.</p>
                </div>
              </>
            )}
          </div>

          {/* Data Snapshot */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-2 flex justify-between">
              <span>Službeni Podaci</span>
              <span className="text-blue-500">{type.toUpperCase()}</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Referenca</span>
                <div className="flex items-center gap-2 font-semibold">
                  <Box className="h-3.5 w-3.5 text-blue-500" />
                  {type === 'otpremnica' ? `OPT-${id}` : 'Dnevni Izvještaj'}
                </div>
              </div>
              
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-500 uppercase">Datum / Klijent</span>
                <div className="flex items-center gap-2 font-semibold justify-end">
                  {type === 'daily' ? (
                    <><Calendar className="h-3.5 w-3.5 text-blue-500" /> {date}</>
                  ) : (
                    <span className="truncate max-w-[120px]">{client}</span>
                  )}
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 uppercase">Verifikovana Količina</span>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-4xl font-bold tracking-tighter text-blue-400 font-display">{volume}</span>
                  <span className="text-sm font-medium mb-1.5 text-slate-500">m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-6 pt-4">
            <div className="flex flex-col items-center gap-2">
               <div className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-slate-400">Autentičnost garantovana HMAC-SHA256</span>
               </div>
               <p className="text-[9px] text-slate-600 max-w-[240px]">
                 Svaka izmena podataka na fizičkom dokumentu poništava ovu digitalnu verifikaciju.
               </p>
            </div>
            
            <Link 
              href="/" 
              className="group flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-xl border border-slate-800 hover:bg-slate-800/50"
            >
              Povratak na Portal <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
         <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full" />
         <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-slate-600/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">{message}</h2>
        <p className="text-slate-400 text-sm">Molimo proverite QR kod ili link na dokumentu.</p>
        <br />
        <Link href="/" className="text-blue-500 underline text-sm">Povratak na Dashboard</Link>
      </div>
    </div>
  );
}
