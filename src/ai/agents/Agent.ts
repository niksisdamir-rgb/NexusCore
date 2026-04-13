import { BaseModel } from '../llm/BaseModel';
import { Tool } from './Tool';

export class Agent {
  private llm: BaseModel;
  private tools: Tool[];
  private maxIterations: number;

  constructor(llm: BaseModel, tools: Tool[] = [], maxIterations: number = 10) {
    this.llm = llm;
    this.tools = tools;
    this.maxIterations = maxIterations;
  }

  /**
   * Constructs the System Context bridging tools and ReAct instruction sets.
   */
  private buildSystemPrompt(): string {
    const toolDescriptions = this.tools.map(t => `- ${t.name}: ${t.description}`).join('\n');
    
    return `You are a powerful autonomous analytical agent.
You must resolve the underlying user objective. 
You have access to the following tools:
${toolDescriptions}

You MUST follow this exact reasoning format for every step of your response. 
Use the following strict syntax:

---
Thought: <Think about what to do next step by step>
Action: <The exact name of the tool to use, must be one of: [${this.tools.map(t => t.name).join(', ')}]>
Action Input: <The input to pass into the tool>
---
Wait for the system to reply with "Observation: ...".

When you finally have the answer, output:
---
Thought: <I now know the final answer>
Final Answer: <The final detailed output for the user objective>
---
`;
  }

  /**
   * Parses the text from the LLM looking for tool execution strings and final answers.
   */
  private parseReActResponse(output: string): { action?: string; input?: string; finalAnswer?: string; thought?: string } {
    const lines = output.split('\n');
    let action: string | undefined;
    let input: string | undefined;
    let finalAnswer: string | undefined;
    let thought: string | undefined;

    for (const line of lines) {
      if (line.startsWith('Thought: ')) thought = line.replace('Thought: ', '').trim();
      if (line.startsWith('Action: ')) action = line.replace('Action: ', '').trim();
      if (line.startsWith('Action Input: ')) input = line.replace('Action Input: ', '').trim();
      if (line.startsWith('Final Answer: ')) finalAnswer = line.replace('Final Answer: ', '').trim();
    }

    return { action, input, finalAnswer, thought };
  }

  /**
   * Main ReAct autonomous loop.
   */
  public async run(objective: string): Promise<string> {
    console.log(`\n[Agent] Starting ReAct loop for objective: "${objective}"`);
    
    const systemPrompt = this.buildSystemPrompt();
    let conversationState = `${systemPrompt}\n\nObjective: ${objective}\nBegin!\n`;
    
    let iterations = 0;

    while (iterations < this.maxIterations) {
      iterations++;
      console.log(`\n[Agent] Iteration ${iterations}... LLM thinking`);
      
      const response = await this.llm.generate({ 
        prompt: conversationState, 
        maxTokens: 1000 
      });

      const rawText = response.text;
      conversationState += `\n${rawText}\n`;
      console.log(`[LLM Response]:\n${rawText}`);

      const parsed = this.parseReActResponse(rawText);

      // Condition 1: Returning Final Answer
      if (parsed.finalAnswer) {
        console.log(`\n[Agent] Successfully resolved objective on iteration ${iterations}.`);
        return parsed.finalAnswer;
      }

      // Condition 2: Attempting Tool Usage
      if (parsed.action && parsed.input) {
        const toolToExecute = this.tools.find(t => t.name === parsed.action);
        
        if (!toolToExecute) {
           const errReason = `Observation: Tool '${parsed.action}' not found. Valid tools: ${this.tools.map(t=>t.name).join(', ')}`;
           console.warn(`[Agent] ${errReason}`);
           conversationState += `\n${errReason}\n`;
           continue;
        }

        try {
          const observation = await toolToExecute.run(parsed.input);
          console.log(`[Observation Result]: ${observation}`);
          conversationState += `\nObservation: ${observation}\n`;
        } catch (error: any) {
          console.error(`[Tool Execution Failed]:`, error);
          conversationState += `\nObservation: Tool failed with error: ${error.message}\n`;
        }

      } else {
         // Condition 3: Hallucination or strict syntax break
         const invalidMsg = `Observation: You did not format your response correctly. Remember to use 'Thought:', 'Action:', 'Action Input:', or 'Final Answer:' formatted exactly on separate lines.`;
         console.warn(`[Agent] Syntax invalid. Prompting engine to autocorrect.`);
         conversationState += `\n${invalidMsg}\n`;
      }
    }

    return `Agent failed to resolve objective within max limit of [${this.maxIterations}] iterations.`;
  }
}
