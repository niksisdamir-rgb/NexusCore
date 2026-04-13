import { Agent, Tool, GeminiProvider, DocumentExtractor, TextSplitter } from '../../src';

async function main() {
  console.log('--- NexusCore Framework Example ---');

  // 1. Data Processing
  console.log('\n[1] Initializing Data Pipeline...');
  const docExtractor = new DocumentExtractor();
  const rawData = await docExtractor.extract('sample_invoice.pdf');
  
  const splitter = new TextSplitter(500, 50);
  const chunkedData = splitter.split(rawData);

  // 2. Define Tools based on Data
  console.log('\n[2] Setting up Tools...');
  const searchTool = new Tool({
    name: 'DocumentSearch',
    description: 'Searches through the extracted document chunks.',
    execute: async (query) => {
      return `Found chunk matching "${query}": ${chunkedData[0].text}`;
    }
  });

  // 3. Initialize Agent with LLM Provider
  console.log('\n[3] Initializing Agent Engine...');
  const llm = new GeminiProvider();
  // const llm = new OllamaProvider(); // Easily swap to local models!
  // const llm = new LlamaCppProvider(null, 'models/llama-3.gguf'); 

  const agent = new Agent(llm, [searchTool]);

  // 4. Run Agent Loop
  console.log('\n[4] Running Autonomous Task...');
  const result = await agent.run('What is the total amount on the invoice?');
  console.log(`\nFinal Output:\n${result}`);
}

main().catch(console.error);
