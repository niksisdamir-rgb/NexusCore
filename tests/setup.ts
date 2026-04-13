import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure we are using a test database environment
  process.env.DATABASE_URL = 'file:./test.db';
  
  // Run migrations on the test database
  try {
    execSync('npx prisma migrate deploy');
  } catch (error) {
    console.error('Failed to run prisma migrations for tests:', error);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
