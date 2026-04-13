import { BaseModel, GenerateRequest, GenerateResponse } from '../BaseModel';
import { GoogleGenAI } from '@google/genai';

export class GeminiProvider extends BaseModel {
  private client: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(modelName: string = 'gemini-1.5-pro', apiKey: string = process.env.GEMINI_API_KEY || '') {
    super(modelName);
    this.apiKey = apiKey;
    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.warn('[GeminiProvider] Initialized without an API key. Some features may fail.');
    }
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    if (!this.client) {
      throw new Error('[GeminiProvider] Cannot generate text: missing API key.');
    }

    try {
      console.log(`[GeminiProvider] Generating response using model ${this.modelName}...`);
      
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: request.prompt,
        config: {
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
        }
      });

      return {
        text: response.text || '',
        usage: { 
          promptTokens: response.usageMetadata?.promptTokenCount || 0, 
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0 
        }
      };
    } catch (error) {
      console.error(`[GeminiProvider] Failed to generate content:`, error);
      throw error;
    }
  }
}
