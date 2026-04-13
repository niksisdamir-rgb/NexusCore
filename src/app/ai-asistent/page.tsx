"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  FileUp, 
  BrainCircuit, 
  ChevronRight,
  Database,
  History,
  Lightbulb,
  Loader2
} from "lucide-react";

export default function AIAsistentPage() {
  const [messages, setMessages] = useState<any[]>([
    { 
      role: 'assistant', 
      content: 'Zdravo! Ja sam NexusCore AI asistent. Mogu vam pomoći da uvezeze nove recepture iz tehničkih listova, analizirate zalihe ili proverite plan proizvodnje. Kako vam mogu pomoći danas?' 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });
      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.aiResponse || "Analiza je završena. Receptura je uspešno identifikovana i procesuirana.",
          steps: data.trace // If available from our agent logic
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Došlo je do greške: " + (data.error || "Problem pri obradi podataka.") 
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Greška u komunikaciji sa NexusCore serverom." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="p-6 border-b border-border bg-card">
         <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
           <Bot className="h-6 w-6 text-blue-500" /> NexusCore AI Agent
         </h1>
         <p className="text-sm text-muted-foreground">Napredna analiza dokumenata i automatizacija betonske baze.</p>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-muted/10">
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-card border border-border rounded-tl-none'
                }`}>
                  <div className="text-sm leading-relaxed">{msg.content}</div>
                  
                  {msg.steps && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                         <BrainCircuit className="h-3 w-3" /> Agent Razmišljanje:
                       </p>
                       {msg.steps.map((step: string, sIdx: number) => (
                         <div key={sIdx} className="text-[11px] text-muted-foreground flex gap-2">
                            <span className="text-blue-500 shrink-0">→</span>
                            <span>{step}</span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                   <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                   <span className="text-sm text-muted-foreground">NexusCore analizira podatke...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-background border-t border-border">
             <div className="max-w-4xl mx-auto flex gap-2 items-center">
                <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground" title="Upload Document">
                  <FileUp className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input 
                    className="w-full bg-muted border border-border rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Pitajte agenta ili unesite tekst recepture..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-1.5 p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
             </div>
             <p className="text-[10px] text-center mt-3 text-muted-foreground uppercase tracking-widest">
               NexusCore Agentic Framework v1.0 • Powered by Gemini AI
             </p>
          </div>
        </div>

        {/* Info Panel */}
        <aside className="w-80 border-l border-border bg-card p-6 space-y-6 hidden xl:block">
           <div className="space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Predlozi:
              </h3>
              <div className="space-y-2">
                 <button onClick={() => setInput("Uvezi recept MB30 sa 350kg cementa")} className="w-full text-left p-2 text-xs hover:bg-muted rounded border border-border border-dashed">
                   "Uvezi recept MB30 sa 350kg cementa"
                 </button>
                 <button onClick={() => setInput("Koliko imamo peska na zalihama?")} className="w-full text-left p-2 text-xs hover:bg-muted rounded border border-border border-dashed">
                   "Koliko imamo peska na zalihama?"
                 </button>
              </div>
           </div>

           <div className="pt-6 border-t border-border space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                 <History className="h-4 w-4" /> Zadnji uvozi:
              </h3>
              <div className="text-[11px] text-muted-foreground italic">
                 Nema nedavnih dokumenata za prikaz.
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
