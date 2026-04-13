import { NextResponse } from "next/server";
import { RecipeExtractionAgent } from "@/ai/agents/RecipeExtractionAgent";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    const agent = new RecipeExtractionAgent();
    // Process the text using the AI agent
    // This will transform text -> recipe and save it to Prisma
    const result = await agent.processText(text);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, steps: result.steps },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      recipe: result.recipe,
      confidence: result.confidence,
      steps: result.steps
    });
  } catch (error: any) {
    console.error("[AI Extract] Global Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
