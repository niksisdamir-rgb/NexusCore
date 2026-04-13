import { 
  Agent, Tool, GeminiProvider, GeminiEmbedding, 
  DocumentExtractor, TextSplitter, MemoryVectorStore 
} from '../src';

async function main() {
  console.log('--- NexusCore Framework RAG Agent Example ---');

  // 1. Data Extractor & Splitter
  console.log('\n[1] Reading and Chunking Documents...');
  const docExtractor = new DocumentExtractor();
  // Provide any actual PDF or Excel file path here
  const rawData = await docExtractor.extract('sample_invoice.pdf');
  
  const splitter = new TextSplitter(500, 50);
  const chunkedData = splitter.split(rawData);

  // 2. Embeddings & Vector Store (Long Term Memory)
  console.log('\n[2] Embedding Chunks into Vector Store...');
  const embedder = new GeminiEmbedding();
  const vectorStore = new MemoryVectorStore();
  
  const textStrings = chunkedData.map((c: any) => c.text);
  const vectors = await embedder.embedBatch(textStrings);
  await vectorStore.add(chunkedData, vectors);

  // 3. Define Tools based on Semantic Vector Search
  console.log('\n[3] Setting up Agent Semantic Search Tool...');
  const semanticSearchTool = new Tool({
    name: 'SemanticSearch',
    description: 'Searches the document database for similar text to answer questions. Input should be a relevant semantic search phrase.',
    execute: async (query: string) => {
      const queryVector = await embedder.embedText(query);
      const results = await vectorStore.similaritySearch(queryVector, 2);
      
      if (results.length === 0) return "No relevant information found.";
      return `Top result: ${results[0].data.text}`;
    }
  });

  // 4. Initialize ReAct Agent
  console.log('\n[4] Initializing Agent Engine...');
  const llm = new GeminiProvider();
  const agent = new Agent(llm, [semanticSearchTool]);

  // 5. Run ReAct Autonomous Task
  console.log('\n[5] Running Autonomous Task...');
  const result = await agent.run('Look up the document and tell me what the total amount on the invoice is.');
  console.log(`\n✅ Final User Result:\n${result}`);
}

main().catch(console.error);
