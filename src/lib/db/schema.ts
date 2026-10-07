import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb,
  boolean,
  varchar,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    lockoutUntil: timestamp('lockout_until', { mode: 'date' }),
    lastLoginAttempt: timestamp('last_login_attempt', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [index('users_email_idx').on(table.email)]
);

export const searchHistory = pgTable(
  'search_history',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    query: text('query').notNull(),
    queryType: varchar('query_type', { length: 20 }).notNull(),
    resultsCount: integer('results_count').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [
    index('search_history_user_idx').on(table.userId),
    index('search_history_created_idx').on(table.createdAt),
  ]
);

export const scrapers = pgTable(
  'scrapers',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    baseUrl: text('base_url').notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    rateLimitMs: integer('rate_limit_ms').default(1000).notNull(),
    selectorsJson: jsonb('selectors_json')
      .$type<Record<string, string>>()
      .notNull(),
    lastRun: timestamp('last_run', { mode: 'date' }),
    successRate: integer('success_rate').default(100).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [index('scrapers_enabled_idx').on(table.enabled)]
);

export const rateLimitTable = pgTable(
  'rate_limit',
  {
    id: serial('id').primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    endpoint: varchar('endpoint', { length: 100 }).notNull(),
    count: integer('count').default(1).notNull(),
    window: integer('window').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [
    index('rate_limit_identifier_idx').on(table.identifier, table.endpoint),
  ]
);
