CREATE TABLE IF NOT EXISTS "youtube_search_cache" (
	"query_key" text PRIMARY KEY NOT NULL,
	"hits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_youtube_search_cache_fetched" ON "youtube_search_cache" ("fetched_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "youtube_oembed_cache" (
	"video_id" text PRIMARY KEY NOT NULL,
	"playable" boolean NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
