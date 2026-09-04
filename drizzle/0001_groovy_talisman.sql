CREATE TABLE "challenge_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"challenge_type" text NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"coins_awarded" integer DEFAULT 0 NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"source_type" text,
	"source_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_type" text,
	"source_id" text,
	"visibility" text DEFAULT 'private' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"include_learning" boolean DEFAULT true NOT NULL,
	"include_projects" boolean DEFAULT true NOT NULL,
	"include_achievements" boolean DEFAULT true NOT NULL,
	"include_certifications" boolean DEFAULT true NOT NULL,
	"include_mentorship" boolean DEFAULT true NOT NULL,
	"include_challenges" boolean DEFAULT true NOT NULL,
	"include_events" boolean DEFAULT true NOT NULL,
	"include_career" boolean DEFAULT true NOT NULL,
	"include_private_notes" boolean DEFAULT true NOT NULL,
	"allow_ai_notes" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_type" text,
	"source_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestones_user_type" UNIQUE("user_id","type")
);
--> statement-breakpoint
CREATE TABLE "note_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "note_links_note_entity" UNIQUE("note_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"source_type" text,
	"source_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"step_id" text,
	"kind" text NOT NULL,
	"url" text,
	"text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" text NOT NULL,
	"ref_id" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"checklist_pct" integer DEFAULT 0 NOT NULL,
	"rubric_breakdown" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"coins_awarded" integer DEFAULT 0 NOT NULL,
	"repo_url" text,
	"reflection" text,
	"submitted_at" timestamp with time zone,
	"passed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_step_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"step_id" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"done_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_step_progress_run_step" UNIQUE("run_id","step_id")
);
--> statement-breakpoint
CREATE TABLE "roadmap_assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"node_id" text NOT NULL,
	"type" text NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"violations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_progress" ALTER COLUMN "state" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "level" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "streak_shields" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_solve_date_key" text;--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD CONSTRAINT "challenge_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_settings" ADD CONSTRAINT "memory_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_evidence" ADD CONSTRAINT "project_evidence_run_id_project_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."project_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_runs" ADD CONSTRAINT "project_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_step_progress" ADD CONSTRAINT "project_step_progress_run_id_project_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."project_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_assessment_attempts" ADD CONSTRAINT "roadmap_assessment_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_assessment_attempts" ADD CONSTRAINT "roadmap_assessment_attempts_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_challenge_attempts_user" ON "challenge_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_challenge_attempts_user_q" ON "challenge_attempts" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_domain_events_user" ON "domain_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_domain_events_unprocessed" ON "domain_events" USING btree ("processed_at","created_at");--> statement-breakpoint
CREATE INDEX "idx_memories_user_occurred" ON "memories" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_memories_user_type" ON "memories" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_memories_source" ON "memories" USING btree ("user_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_milestones_user_occurred" ON "milestones" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_note_links_note" ON "note_links" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "idx_notes_user_created" ON "notes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_notes_source" ON "notes" USING btree ("user_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_notes_visibility" ON "notes" USING btree ("user_id","visibility");--> statement-breakpoint
CREATE INDEX "idx_project_evidence_run" ON "project_evidence" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "idx_project_runs_user" ON "project_runs" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "idx_project_runs_user_ref" ON "project_runs" USING btree ("user_id","source","ref_id");--> statement-breakpoint
CREATE INDEX "idx_project_step_run" ON "project_step_progress" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "idx_assessment_attempts_user_node" ON "roadmap_assessment_attempts" USING btree ("user_id","roadmap_id","node_id");