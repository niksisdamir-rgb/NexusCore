import { NexusApp } from '../src/index';

const app = new NexusApp({
  name: 'Basic API Example',
  port: 8080,
});

app.start();
