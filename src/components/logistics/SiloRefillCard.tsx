import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Truck, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RefillOrder } from "@/hooks/useLogistics";

interface SiloRefillCardProps {
  orders: RefillOrder[];
  onTriggerRefill: () => void;
}

export function SiloRefillCard({ orders, onTriggerRefill }: SiloRefillCardProps) {
  return (
    <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md flex items-center gap-2">
            <Factory className="h-4 w-4 text-blue-500" /> Silosi - Automatizacija Dopune
          </CardTitle>
          <button 
            onClick={onTriggerRefill}
            className="text-[10px] font-bold bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            PROVERI NIVOE
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-blue-500/20 rounded-xl">
            <CheckCircle2 className="h-8 w-8 text-blue-500/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Svi silosi su adekvatno popunjeni.</p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card/80 border border-border p-3 rounded-lg flex items-center gap-4 group"
              >
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  order.status === "IN_TRANSIT" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {order.status === "IN_TRANSIT" ? <Truck className="h-5 w-5 animate-pulse" /> : <Clock className="h-5 w-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm truncate">{order.material}</h4>
                    <Badge variant="outline" className={cn(
                      "text-[9px] px-1 py-0 font-black tracking-tighter",
                      getStatusStyle(order.status)
                    )}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Količina: <span className="text-foreground font-bold">{order.quantity.toLocaleString()} {order.unit}</span>
                  </p>
                  
                  {order.status === "IN_TRANSIT" && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-muted-foreground italic">Kamion na putu...</span>
                        <span className="text-amber-500 font-bold">ETA: 12 min</span>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-amber-500"
                          initial={{ width: "30%" }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center gap-2">
           <AlertCircle className="h-3 w-3 text-blue-500" />
           <p className="text-[9px] text-muted-foreground">
             Sistem proaktivno naručuje cement kada nivo padne ispod 25%.
           </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case "PENDING": return "text-gray-500 border-gray-500";
    case "ORDERED": return "text-blue-500 border-blue-500";
    case "IN_TRANSIT": return "text-amber-500 border-amber-500";
    case "COMPLETED": return "text-emerald-500 border-emerald-500";
    default: return "";
  }
}
