export interface GenerateRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export abstract class BaseModel {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  /**
   * Generates a response from the underlying LLM.
   */
  abstract generate(request: GenerateRequest): Promise<GenerateResponse>;
}
