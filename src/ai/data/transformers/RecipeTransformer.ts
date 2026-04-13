/**
 * src/ai/data/transformers/RecipeTransformer.ts
 *
 * Uses Gemini to parse unstructured text into a structured Recipe object.
 * Handles unit normalization (g→kg, mL→L) and validates required fields.
 */

import { GeminiProvider } from "../../llm/providers/GeminiProvider";

export interface ExtractedRecipe {
  name: string;
  cementAmount: number;    // kg
  waterAmount: number;     // L
  sandAmount: number;      // kg
  gravelAmount: number;    // kg
  admixtureAmount?: number; // L or kg
  confidence: "HIGH" | "MEDIUM" | "LOW";
  rawText: string;
}

const SYSTEM_PROMPT = `You are a concrete recipe parser for the Elkonmix-90 SCADA system.
Extract concrete mix recipe data from the provided text and return ONLY a valid JSON object.

Rules:
- Convert all weights to kilograms (g → kg, t → kg × 1000)
- Convert liquid volumes to liters (mL → L, m³ → L × 1000)
- If a field is missing, set it to null
- Set confidence to HIGH if all required fields found, MEDIUM if some inferred, LOW if heavily guessed
- Required fields: name, cementAmount, waterAmount, sandAmount, gravelAmount
- Optional: admixtureAmount

Return ONLY this JSON schema, no markdown, no explanation:
{
  "name": "string (recipe class, e.g. C30/37 XC4)",
  "cementAmount": number,
  "waterAmount": number,
  "sandAmount": number,
  "gravelAmount": number,
  "admixtureAmount": number | null,
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}`;

export class RecipeTransformer {
  private llm: GeminiProvider;

  constructor() {
    this.llm = new GeminiProvider("gemini-1.5-flash");
  }

  /**
   * Parse raw text into a structured recipe object.
   * Returns null if extraction fails or required fields are missing.
   */
  async transform(rawText: string): Promise<ExtractedRecipe | null> {
    const prompt = `${SYSTEM_PROMPT}\n\nText to parse:\n"""\n${rawText}\n"""`;

    let jsonStr = "";
    try {
      const response = await this.llm.generate({ prompt, maxTokens: 512, temperature: 0.1 });
      jsonStr = response.text.trim();

      // Strip markdown code fences if Gemini adds them
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      const required = ["name", "cementAmount", "waterAmount", "sandAmount", "gravelAmount"];
      for (const field of required) {
        if (parsed[field] === null || parsed[field] === undefined) {
          console.warn(`[RecipeTransformer] Missing required field: ${field}`);
          return null;
        }
      }

      return {
        name: String(parsed.name),
        cementAmount: Number(parsed.cementAmount),
        waterAmount: Number(parsed.waterAmount),
        sandAmount: Number(parsed.sandAmount),
        gravelAmount: Number(parsed.gravelAmount),
        admixtureAmount: parsed.admixtureAmount != null ? Number(parsed.admixtureAmount) : undefined,
        confidence: parsed.confidence ?? "MEDIUM",
        rawText,
      };
    } catch (err: any) {
      console.error("[RecipeTransformer] Failed to parse LLM output:", jsonStr, err.message);
      return null;
    }
  }
}
