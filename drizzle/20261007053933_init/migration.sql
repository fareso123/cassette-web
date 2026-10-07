CREATE TABLE "rate_limit" (
	"id" serial PRIMARY KEY,
	"identifier" varchar(255) NOT NULL,
	"endpoint" varchar(100) NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"window" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scrapers" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"base_url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_ms" integer DEFAULT 1000 NOT NULL,
	"selectors_json" jsonb NOT NULL,
	"last_run" timestamp,
	"success_rate" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"query" text NOT NULL,
	"query_type" varchar(20) NOT NULL,
	"results_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"lockout_until" timestamp,
	"last_login_attempt" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_identifier_idx" ON "rate_limit" ("identifier","endpoint");--> statement-breakpoint
CREATE INDEX "scrapers_enabled_idx" ON "scrapers" ("enabled");--> statement-breakpoint
CREATE INDEX "search_history_user_idx" ON "search_history" ("user_id");--> statement-breakpoint
CREATE INDEX "search_history_created_idx" ON "search_history" ("created_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" ("email");--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");