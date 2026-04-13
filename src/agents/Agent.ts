import { BaseModel } from '../llm/BaseModel';
import { Tool } from './Tool';

export class Agent {
  private llm: BaseModel;
  private tools: Tool[];

  constructor(llm: BaseModel, tools: Tool[] = []) {
    this.llm = llm;
    this.tools = tools;
  }

  /**
   * The core autonomous reasoning loop (e.g. ReAct).
   */
  public async run(objective: string): Promise<string> {
    console.log(`[Agent] Starting autonomous loop for objective: "${objective}"`);
    console.log(`[Agent] Available Tools: ${this.tools.map(t => t.name).join(', ') || 'None'}`);
    
    // Simulated loop hitting the LLM and deciding tools
    const response = await this.llm.generate({ prompt: objective });
    console.log(`[Agent] LLM reasoning...`);
    
    return `Agent successfully resolved objective: ${objective}\nFinal Answer: ${response.text}`;
  }
}
