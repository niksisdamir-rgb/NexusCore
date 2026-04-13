import { NextRequest, NextResponse } from "next/server";
import { MaintenanceAgent } from "@/ai/agents/MaintenanceAgent";

export async function GET(req: NextRequest) {
  try {
    const agent = new MaintenanceAgent();
    // In a real environment, this might be triggered by a heavy AI analysis
    // or by checking the latest sensor snapshots.
    const report = await agent.runDiagnostics();
    
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
