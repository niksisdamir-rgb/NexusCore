/**
 * POST /api/ai/process
 * Extracts a concrete recipe from raw text using the RecipeExtractionAgent.
 */

import { NextResponse } from "next/server";
import { RecipeExtractionAgent } from "@/ai/agents/RecipeExtractionAgent";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Missing or too-short text payload (min 10 chars)" },
        { status: 400 }
      );
    }

    const agent = new RecipeExtractionAgent();
    const result = await agent.processText(text);

    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (error: any) {
    console.error("[/api/ai/process] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
