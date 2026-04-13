import { NextResponse } from "next/server";
import { EfficiencyAgent } from "@/ai/agents/EfficiencyAgent";

export async function GET() {
  try {
    const agent = new EfficiencyAgent();
    const analysis = await agent.analyzeWorkforce();

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[Workforce API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
