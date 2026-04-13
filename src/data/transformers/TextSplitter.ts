import { ExtractedData } from '../extractors/BaseExtractor';

export class TextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Splits extracted data into LLM-friendly token chunks.
   */
  public split(data: ExtractedData[]): ExtractedData[] {
    const chunks: ExtractedData[] = [];
    console.log(`[TextSplitter] Splitting text into chunks of ${this.chunkSize} with ${this.chunkOverlap} overlap...`);
    // Simulated logic
    data.forEach(d => chunks.push(d)); 
    return chunks;
  }
}
