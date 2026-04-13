export abstract class BaseEmbedding {
  /**
   * Converts a block of text into a high-dimensional vector.
   */
  abstract embedText(text: string): Promise<number[]>;

  /**
   * Converts multiple blocks of text concurrently.
   */
  abstract embedBatch(texts: string[]): Promise<number[][]>;
}
