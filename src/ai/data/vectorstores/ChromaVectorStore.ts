import { BaseVectorStore, SearchResult } from './BaseVectorStore';
import { ExtractedData } from '../extractors/BaseExtractor';
import { ChromaClient, Collection } from 'chromadb';
import * as crypto from 'crypto'; // For generating unique IDs chunk by chunk

export class ChromaVectorStore extends BaseVectorStore {
  private client: ChromaClient;
  private collectionName: string;
  private _collectionPromise: Promise<Collection>;

  constructor(collectionName: string = 'nexus_core_memory', host: string = 'http://localhost:8000') {
    super();
    this.client = new ChromaClient({ path: host });
    this.collectionName = collectionName;
    
    // Initialize or get the collection immediately
    this._collectionPromise = this.client.getOrCreateCollection({
        name: this.collectionName,
    }).then(col => {
        console.log(`[ChromaVectorStore] Successfully connected to Chroma Collection: ${this.collectionName}`);
        return col;
    }).catch(err => {
        console.error(`[ChromaVectorStore] Error initializing Chroma database:`, err);
        throw err;
    });
  }

  async add(documents: ExtractedData[], embeddings: number[][]): Promise<void> {
    const rootCollection = await this._collectionPromise;
    
    const ids = documents.map(() => crypto.randomUUID());
    const metadatas = documents.map(d => d.metadata);
    const documentsArray = documents.map(d => d.text);

    await rootCollection.add({
      ids: ids,
      embeddings: embeddings,
      metadatas: metadatas,
      documents: documentsArray
    });

    console.log(`[ChromaVectorStore] Successfully persisted ${documents.length} vectors into ChromaDB.`);
  }

  async similaritySearch(queryVector: number[], topK: number = 3): Promise<SearchResult[]> {
    const rootCollection = await this._collectionPromise;
    
    console.log(`[ChromaVectorStore] Querying database for top ${topK} matches...`);
    const results = await rootCollection.query({
      queryEmbeddings: [queryVector],
      nResults: topK
    });

    // Formatting chroma output down into standard Nexus SearchResults
    const resolvedResults: SearchResult[] = [];
    if (results.documents[0] && results.distances && results.distances[0]) {
       for(let i=0; i<results.documents[0].length; i++) {
          resolvedResults.push({
             data: {
                text: results.documents[0][i] || '',
                metadata: results.metadatas[0][i] || {}
             },
             score: results.distances[0][i] || 0 // Note: Chroma usually returns raw distances (lower = better) depending on space configs
          });
       }
    }
    
    return resolvedResults;
  }
}
