import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../env';

// postgres() connects lazily, so construction rarely throws. A real
// connection failure surfaces on the first query rather than here.
const client = postgres(env.DATABASE_URL);

export const db = drizzle({ client });