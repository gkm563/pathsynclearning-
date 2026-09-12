CREATE TABLE "interview_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'live' NOT NULL,
	"track" text NOT NULL,
	"mode" text DEFAULT 'voice' NOT NULL,
	"target_role" text NOT NULL,
	"target_company" text,
	"duration_minutes" integer DEFAULT 20 NOT NULL,
	"livekit_room" text,
	"plan" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"integrity" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"code_snapshot" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"source" text DEFAULT 'text' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"overall" integer DEFAULT 0 NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"quotes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"next_practice" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"raw" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "interview_turns" ADD CONSTRAINT "interview_turns_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "interview_reports" ADD CONSTRAINT "interview_reports_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_interview_sessions_user" ON "interview_sessions" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "idx_interview_turns_session" ON "interview_turns" USING btree ("session_id","created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "interview_reports_session_id_unique" ON "interview_reports" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "idx_interview_reports_session" ON "interview_reports" USING btree ("session_id");
