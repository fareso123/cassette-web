import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../env';

let client: ReturnType<typeof postgres>;
try {
  client = postgres(env.DATABASE_URL);
  console.log('Connected to database');
} catch (error) {
  console.error('Failed to connect to database:', error);
  process.exit(1);
}

export const db = drizzle(client);
