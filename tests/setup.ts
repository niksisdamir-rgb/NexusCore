import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { execSync } from 'child_process';

const TEST_DB_URL = 'file:./tests/test.db';
const adapter = new PrismaBetterSqlite3({ url: TEST_DB_URL });
const prisma = new PrismaClient({ adapter });


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
