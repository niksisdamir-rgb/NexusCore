import { BaseEmbedding } from './BaseEmbedding';
import { GoogleGenAI } from '@google/genai';

export class GeminiEmbedding extends BaseEmbedding {
  private client: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string = process.env.GEMINI_API_KEY || '', modelName: string = 'text-embedding-004') {
    super();
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  async embedText(text: string): Promise<number[]> {
    console.log(`[GeminiEmbedding] Generating vector embedding for text via ${this.modelName}...`);
    const response = await this.client.models.embedContent({
      model: this.modelName,
      contents: text
    });
    
    if (!response.embeddings || response.embeddings.length === 0) {
       throw new Error("[GeminiEmbedding] API returned an empty embedding array.");
    }
    
    // Convert Float32Array or standard array to number array securely
    return Array.from(response.embeddings[0].values || []);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const promises = texts.map(t => this.embedText(t));
    return Promise.all(promises);
  }
}
