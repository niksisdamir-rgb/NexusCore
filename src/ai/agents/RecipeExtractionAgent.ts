/**
 * src/ai/agents/RecipeExtractionAgent.ts
 *
 * Full pipeline agent: DocumentExtractor → RecipeTransformer → Prisma DB save.
 * Can process raw text, file paths (PDF/XLSX/image), or Buffer inputs.
 */

import { DocumentExtractor } from "../data/extractors/DocumentExtractor";
import { RecipeTransformer } from "../data/transformers/RecipeTransformer";
import { prisma } from "@/lib/db";

export interface ExtractionResult {
  success: boolean;
  recipe?: {
    id: number;
    name: string;
    cementAmount: number;
    waterAmount: number;
    sandAmount: number;
    gravelAmount: number;
    admixtureAmount: number | null;
  };
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  extractedText?: string;
  error?: string;
  steps: string[];
}

export class RecipeExtractionAgent {
  private extractor = new DocumentExtractor();
  private transformer = new RecipeTransformer();

  /**
   * Process raw text directly (no file extraction needed).
   */
  async processText(text: string): Promise<ExtractionResult> {
    const steps: string[] = [];
    steps.push("✓ Input: raw text received");

    const recipe = await this.transformer.transform(text);
    if (!recipe) {
      steps.push("✗ Transformer: failed to extract structured recipe");
      return { success: false, error: "Could not parse recipe from text", steps };
    }
    steps.push(`✓ Transformer: extracted "${recipe.name}" (confidence: ${recipe.confidence})`);

    return this.saveRecipe(recipe, steps);
  }

  /**
   * Process a file: PDF, XLSX, image, or plain text.
   * Accepts a file path (string) or a Buffer + filename hint.
   */
  async processFile(source: string | Buffer, filename?: string): Promise<ExtractionResult> {
    const steps: string[] = [];
    steps.push(`✓ Input: file "${filename ?? "buffer"}" received`);

    let rawText: string;
    try {
      const extracted = await this.extractor.extract(
        typeof source === "string" ? source : source
      );
      rawText = extracted.map((e) => e.text).join("\n\n");
      steps.push(`✓ Extractor: ${extracted.length} segment(s) extracted (${rawText.length} chars)`);
    } catch (err: any) {
      steps.push(`✗ Extractor: ${err.message}`);
      return { success: false, error: `File extraction failed: ${err.message}`, steps };
    }

    const recipe = await this.transformer.transform(rawText);
    if (!recipe) {
      steps.push("✗ Transformer: could not parse structured recipe from extracted text");
      return { success: false, error: "Could not parse recipe from file content", steps, extractedText: rawText };
    }
    steps.push(`✓ Transformer: extracted "${recipe.name}" (confidence: ${recipe.confidence})`);

    return this.saveRecipe(recipe, steps);
  }

  private async saveRecipe(
    recipe: Awaited<ReturnType<RecipeTransformer["transform"]>> & object,
    steps: string[]
  ): Promise<ExtractionResult> {
    try {
      const saved = await prisma.recipe.create({
        data: {
          name: recipe!.name,
          cementAmount: recipe!.cementAmount,
          waterAmount: recipe!.waterAmount,
          sandAmount: recipe!.sandAmount,
          gravelAmount: recipe!.gravelAmount,
          admixtureAmount: recipe!.admixtureAmount ?? null,
        },
      });

      // Write audit log
      await prisma.auditLog.create({
        data: {
          action: "AI_EXTRACT",
          entityType: "Recipe",
          entityId: saved.id,
          description: `AI extracted recipe "${saved.name}" with ${recipe!.confidence} confidence`,
        },
      });

      steps.push(`✓ Database: recipe saved with ID ${saved.id}`);
      steps.push(`✓ AuditLog: entry created`);

      return {
        success: true,
        recipe: saved,
        confidence: recipe!.confidence,
        steps,
      };
    } catch (err: any) {
      steps.push(`✗ Database: ${err.message}`);
      return { success: false, error: `Failed to save recipe: ${err.message}`, steps };
    }
  }
}
