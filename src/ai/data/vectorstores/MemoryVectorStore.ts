import { BaseVectorStore, SearchResult } from './BaseVectorStore';
import { ExtractedData } from '../extractors/BaseExtractor';

interface MemoryDocument {
  data: ExtractedData;
  embedding: number[];
}

export class MemoryVectorStore extends BaseVectorStore {
  private memory: MemoryDocument[] = [];

  /**
   * Calculates the cosine similarity between two numeric vectors.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async add(documents: ExtractedData[], embeddings: number[][]): Promise<void> {
    if (documents.length !== embeddings.length) {
      throw new Error('[MemoryVectorStore] Length of documents must match length of embeddings.');
    }
    
    for (let i = 0; i < documents.length; i++) {
       this.memory.push({
         data: documents[i],
         embedding: embeddings[i]
       });
    }
    console.log(`[MemoryVectorStore] Successfully stored ${documents.length} vectors in memory.`);
  }

  async similaritySearch(queryVector: number[], topK: number = 3): Promise<SearchResult[]> {
    console.log(`[MemoryVectorStore] Running cosine similarity search across ${this.memory.length} vectors...`);
    
    // Calculate similarities
    const results = this.memory.map(doc => ({
      data: doc.data,
      score: this.cosineSimilarity(queryVector, doc.embedding)
    }));

    // Sort by descending score (highest similarity first)
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }
}
