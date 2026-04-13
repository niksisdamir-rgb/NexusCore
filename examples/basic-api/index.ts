import { NexusApp } from '../src';

const app = new NexusApp({
  name: 'Basic API Example',
  port: 8080,
});

app.start();
