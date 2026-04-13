import { NextResponse } from "next/server";
import { VoiceCommandAgent } from "@/ai/agents/VoiceCommandAgent";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ success: false, error: "No text provided" }, { status: 400 });
    }

    const agent = new VoiceCommandAgent();
    const action = await agent.parseIntent(text);

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    console.error("[Voice API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
