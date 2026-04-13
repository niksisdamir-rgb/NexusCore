import { BaseExtractor, ExtractedData } from './BaseExtractor';
import * as fs from 'fs';
import * as path from 'path';
// Use dynamic imports or require for some libraries to prevent strict TypeScript errors if types are missing
const pdfParse = require('pdf-parse');
import * as xlsx from 'xlsx';
const Tesseract = require('tesseract.js');

/**
 * Handles text-based documents including OCR, PDF, Microsoft Word, and Excel.
 */
export class DocumentExtractor extends BaseExtractor {
  constructor() {
    super();
  }

  async extract(source: string | Buffer): Promise<ExtractedData[]> {
    let buffer: Buffer;
    let filename = 'unknown';

    if (typeof source === 'string') {
      if (!fs.existsSync(source)) {
        throw new Error(`[DocumentExtractor] File not found: ${source}`);
      }
      buffer = fs.readFileSync(source);
      filename = path.basename(source);
    } else {
      buffer = source;
    }

    const extension = path.extname(filename).toLowerCase();
    
    console.log(`[DocumentExtractor] Parsing file '${filename}' with extension '${extension || 'buffer'}'...`);

    if (extension === '.pdf') {
      return this.parsePdf(buffer, filename);
    } else if (extension === '.xlsx' || extension === '.csv') {
      return this.parseExcel(buffer, filename);
    } else if (['.png', '.jpg', '.jpeg'].includes(extension)) {
      return this.parseOcr(buffer, filename);
    } else {
      // Fallback: Assume it's plain text
      return [{
        text: buffer.toString('utf-8'),
        metadata: { type: 'text', filename }
      }];
    }
  }

  private async parsePdf(buffer: Buffer, filename: string): Promise<ExtractedData[]> {
    try {
      const data = await pdfParse(buffer);
      return [{
        text: data.text,
        metadata: { type: 'pdf', pages: data.numpages, author: data.info?.Author, filename }
      }];
    } catch (error) {
      console.error('[DocumentExtractor] Failed to parse PDF', error);
      throw error;
    }
  }

  private async parseExcel(buffer: Buffer, filename: string): Promise<ExtractedData[]> {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let combinedText = '';
      
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = xlsx.utils.sheet_to_csv(sheet);
        combinedText += `\n--- Sheet: ${sheetName} ---\n${csv}`;
      }

      return [{
        text: combinedText,
        metadata: { type: 'excel', sheets: workbook.SheetNames, filename }
      }];
    } catch (error) {
      console.error('[DocumentExtractor] Failed to parse Excel', error);
      throw error;
    }
  }

  private async parseOcr(buffer: Buffer, filename: string): Promise<ExtractedData[]> {
    try {
      console.log('[DocumentExtractor] Running Tesseract OCR... This may take a moment.');
      const { data: { text } } = await Tesseract.recognize(
        buffer,
        'eng',
        { logger: (m: any) => console.log(m) }
      );
      
      return [{
        text,
        metadata: { type: 'image_ocr', filename }
      }];
    } catch (error) {
       console.error('[DocumentExtractor] Failed to parse Image OCR', error);
       throw error;
    }
  }
}
