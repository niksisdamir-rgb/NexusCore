export interface ToolOption {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
}

export class Tool {
  public name: string;
  public description: string;
  private executor: (input: string) => Promise<string>;

  constructor(options: ToolOption) {
    this.name = options.name;
    this.description = options.description;
    this.executor = options.execute;
  }

  public async run(input: string): Promise<string> {
    console.log(`[Tool: ${this.name}] Executing with input: ${input}`);
    return this.executor(input);
  }
}
