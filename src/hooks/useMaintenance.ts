import { useState, useEffect } from "react";
import { DiagnosticsReport } from "@/ai/agents/MaintenanceAgent";

export function useMaintenance() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch("/api/ai/diagnostics");
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to fetch diagnostics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 60000); // Poll once per minute
    return () => clearInterval(interval);
  }, []);

  return { report, loading, error, refetch: fetchDiagnostics };
}
