/**
 * POST /api/ai/parse-file
 *
 * Accepts a multipart/form-data file upload (PDF, XLSX, PNG, JPG, TXT).
 * Extracts text from the file and runs RecipeExtractionAgent on it.
 *
 * Form fields:
 *   file  — the uploaded file (required)
 */

import { NextResponse } from "next/server";
import { RecipeExtractionAgent } from "@/ai/agents/RecipeExtractionAgent";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/png",
  "image/jpeg",
  "text/plain",
  "text/csv",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided. Send a multipart/form-data request with a 'file' field." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}. Allowed: PDF, XLSX, PNG, JPG, TXT, CSV` },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write buffer to a temp file so DocumentExtractor can detect the extension
    const { tmpdir } = await import("os");
    const { join } = await import("path");
    const { writeFileSync, unlinkSync } = await import("fs");

    // Safe temp filename using timestamp + original name
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const tmpPath = join(tmpdir(), `elkonmix_${Date.now()}_${safeName}`);

    writeFileSync(tmpPath, buffer);

    let result;
    try {
      const agent = new RecipeExtractionAgent();
      result = await agent.processFile(tmpPath, file.name);
    } finally {
      // Always clean up temp file
      try { unlinkSync(tmpPath); } catch {}
    }

    return NextResponse.json(
      { ...result, filename: file.name, fileType: file.type, fileSizeBytes: file.size },
      { status: result.success ? 200 : 422 }
    );
  } catch (error: any) {
    console.error("[/api/ai/parse-file] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
