export interface NexusAppConfig {
  name: string;
  port?: number;
}

export class NexusApp {
  private config: NexusAppConfig;

  constructor(config: NexusAppConfig) {
    this.config = {
      port: 3000,
      ...config,
    };
  }

  public start(): void {
    console.log(`[NexusCore] Application '${this.config.name}' starting on port ${this.config.port}...`);
    // Initialization logic will go here
  }
}
