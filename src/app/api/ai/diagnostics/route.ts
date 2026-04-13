import { NextResponse } from "next/server";
import { MaintenanceAgent } from "@/ai/agents/MaintenanceAgent";

export async function GET() {
  try {
    const agent = new MaintenanceAgent();
    const report = await agent.runDiagnostics();

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[Diagnostics API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
