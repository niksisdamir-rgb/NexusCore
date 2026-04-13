import { ExtractedData } from '../extractors/BaseExtractor';

export interface SearchResult {
  data: ExtractedData;
  score: number;
}

export abstract class BaseVectorStore {
  /**
   * Insert extracted chunks along with their vector embeddings into the database.
   */
  abstract add(documents: ExtractedData[], embeddings: number[][]): Promise<void>;

  /**
   * Query the database using a query vector and return top K similar documents.
   */
  abstract similaritySearch(queryVector: number[], topK: number): Promise<SearchResult[]>;
}
