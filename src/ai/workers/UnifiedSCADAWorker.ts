import { Agent } from '../agents/Agent';
import { GeminiProvider } from '../llm/providers/GeminiProvider';
import { CreateRecipeTool } from '../tools/DatabaseTools';

export class UnifiedSCADAWorker {
  private agent: Agent;

  constructor() {
    const llm = new GeminiProvider();
    this.agent = new Agent(llm, [CreateRecipeTool], 10);
  }

  /**
   * Process a textual payload (or extracted PDF text) and extract the Recipe
   */
  public async processRecipeFromText(text: string) {
    const prompt = `You are an AI data extractor for the Elkonmix-90 SCADA system.
Your task is to parse unstructured recipes or production orders from text and insert them sequentially into the database using your tools.
If asked to extract a recipe, find the name, cementAmount, waterAmount, sandAmount, and gravelAmount, and call CreateRecipeTool.

Please extract the concrete recipe from the following text and save it to the database: \n\n${text}`;
    const result = await this.agent.run(prompt);
    return result;
  }
}
