import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { execSync } from 'child_process';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, 'test.db');
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

// Force the env var for any code that might use it
process.env.DATABASE_URL = TEST_DB_URL;

const adapter = new PrismaBetterSqlite3({ url: TEST_DB_URL });
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
  console.log(`[Test Setup] Initializing test database at ${TEST_DB_URL}`);
  try {
    // Generate the client if needed (though it should exist)
    // Run migrations
    execSync(`DATABASE_URL="${TEST_DB_URL}" npx prisma migrate deploy`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to run prisma migrations for tests:', error);
    throw error;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
