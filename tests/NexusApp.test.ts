import { NexusApp } from '../src/core/NexusApp';

describe('NexusApp', () => {
  it('should instantiate correctly', () => {
    const app = new NexusApp({ name: 'TestApp' });
    expect(app).toBeDefined();
  });
});
