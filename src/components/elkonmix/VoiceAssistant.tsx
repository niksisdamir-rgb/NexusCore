"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Loader2, Sparkles, Command, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onAction: (action: any) => void;
}

export default function VoiceAssistant({ onAction }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "sr-RS"; // Default to Serbian, but LLM handles others

      recognitionRef.current.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setTranscript(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setError("Greška u prepoznavanju glasa.");
        setIsListening(false);
      };
    } else {
      setError("Pretraživač ne podržava prepoznavanje glasa.");
    }
  }, []);

  const handleStart = () => {
    if (!recognitionRef.current || isProcessing) return;
    setTranscript("");
    setError(null);
    setLastAction(null);
    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleStop = async () => {
    if (!isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
    
    if (transcript.trim()) {
      processCommand(transcript);
    }
  };

  const processCommand = async (text: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/ai/voice", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        setLastAction(data.action);
        onAction(data.action);
      }
    } catch (e) {
      setError("Neuspelo procesiranje komande.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
      
      {/* Feedback Bubble */}
      {(isListening || transcript || isProcessing || lastAction || error) && (
        <div className="bg-card/90 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 w-72 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SCADA-Voice Hub</span>
          </div>
          
          <div className="min-h-[40px] flex items-center">
            {isProcessing ? (
              <div className="flex items-center gap-2 text-sm text-primary font-medium animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" /> Analiziranje namere...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            ) : lastAction ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase">
                  <CheckCircle2 className="h-4 w-4" /> Izvršeno
                </div>
                <p className="text-xs text-muted-foreground leading-tight italic">"{lastAction.rawText}"</p>
                <div className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block font-mono">
                  {lastAction.intent}
                </div>
              </div>
            ) : (
              <p className={cn(
                "text-sm font-medium transition-opacity",
                isListening ? "text-foreground" : "text-muted-foreground"
              )}>
                {transcript || (isListening ? "Slušam..." : "Držite dugme za glasovnu komandu")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Push-to-Talk Button */}
      <div className="relative group">
        {/* Animated Rings */}
        {isListening && (
           <>
             <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
             <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping" style={{ animationDuration: '3s' }} />
           </>
        )}
        
        <button
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onMouseLeave={handleStop}
          onTouchStart={handleStart}
          onTouchEnd={handleStop}
          className={cn(
            "relative h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
            isListening 
              ? "bg-primary scale-110 shadow-primary/50" 
              : "bg-card border-2 border-border hover:border-primary/50 text-muted-foreground hover:text-primary active:scale-95"
          )}
        >
          {isListening ? (
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1 h-3 bg-white rounded-full animate-bounce" />
            </div>
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>
        
        {!isListening && (
          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground h-5 w-5 rounded-md flex items-center justify-center shadow-lg border-2 border-background animate-bounce">
            <Command className="h-3 w-3" />
          </div>
        )}
      </div>
      
      {!isListening && !isProcessing && !lastAction && (
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full border border-border">
          PTT Active
        </p>
      )}
    </div>
  );
}
