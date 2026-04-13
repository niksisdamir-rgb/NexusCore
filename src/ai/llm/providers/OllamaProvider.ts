import { BaseModel, GenerateRequest, GenerateResponse } from '../BaseModel';

export class OllamaProvider extends BaseModel {
  private baseUrl: string;

  constructor(modelName: string = 'llama3', baseUrl: string = 'http://localhost:11434') {
    super(modelName);
    this.baseUrl = baseUrl;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    // Placeholder for hitting local Ollama HTTP API
    console.log(`[OllamaProvider] Contacting local Ollama proxy at ${this.baseUrl} for model ${this.modelName}...`);
    return {
      text: 'This is a simulated response from a local Ollama model.',
    };
  }
}
