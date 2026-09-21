CREATE TABLE IF NOT EXISTS "roadmap_study_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"node_id" text NOT NULL,
	"title" text NOT NULL,
	"scheduled_date" date NOT NULL,
	"source_date" date NOT NULL,
	"estimated_minutes" integer DEFAULT 60 NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roadmap_study_tasks" ADD CONSTRAINT "roadmap_study_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roadmap_study_tasks" ADD CONSTRAINT "roadmap_study_tasks_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "roadmap_study_tasks_user_roadmap_node" ON "roadmap_study_tasks" ("user_id","roadmap_id","node_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_roadmap_study_tasks_day" ON "roadmap_study_tasks" ("user_id","roadmap_id","scheduled_date");
