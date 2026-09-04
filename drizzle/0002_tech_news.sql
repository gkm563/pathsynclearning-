-- Tech News tables (generated companion to scripts/migrate-tech-news.ts)
CREATE TABLE IF NOT EXISTS "news_articles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "external_id" text NOT NULL,
  "canonical_url" text NOT NULL,
  "title" text NOT NULL,
  "summary" text,
  "content" text,
  "image_url" text,
  "source_name" text NOT NULL,
  "source_url" text,
  "author" text,
  "category" text DEFAULT 'Programming' NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "published_at" timestamp with time zone NOT NULL,
  "reading_minutes" integer DEFAULT 3 NOT NULL,
  "popularity" integer DEFAULT 0 NOT NULL,
  "featured" boolean DEFAULT false NOT NULL,
  "provider" text DEFAULT 'devto' NOT NULL,
  "raw" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "news_articles_external_id" UNIQUE("external_id"),
  CONSTRAINT "news_articles_canonical_url" UNIQUE("canonical_url")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_published" ON "news_articles" ("published_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_category" ON "news_articles" ("category","published_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_featured" ON "news_articles" ("featured","published_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_popularity" ON "news_articles" ("popularity");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news_bookmarks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "article_id" uuid NOT NULL REFERENCES "news_articles"("id") ON DELETE cascade,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "news_bookmarks_user_article" UNIQUE("user_id","article_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_bookmarks_user" ON "news_bookmarks" ("user_id","created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news_reads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "article_id" uuid NOT NULL REFERENCES "news_articles"("id") ON DELETE cascade,
  "read_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "news_reads_user_article" UNIQUE("user_id","article_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_reads_user" ON "news_reads" ("user_id","read_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news_preferences" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE cascade,
  "categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
