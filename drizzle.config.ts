import { defineConfig } from 'drizzle-kit';

// drizzle-kit loads .env itself. DATABASE_URL points at a local Postgres,
// Neon or Supabase without editing this file.
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
