export interface ExtractedData {
  text: string;
  metadata: Record<string, any>;
}

export abstract class BaseExtractor {
  /**
   * Parses a source (file path, URL, or buffer) into structured text and metadata.
   */
  abstract extract(source: string | Buffer): Promise<ExtractedData[]>;
}
