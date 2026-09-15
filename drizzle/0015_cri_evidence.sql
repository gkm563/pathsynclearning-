ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "cri_milli" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "cri_formula" text DEFAULT 'cri.v1' NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "cri_snapshot_id" uuid;
--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD COLUMN IF NOT EXISTS "duration_ms" integer;
--> statement-breakpoint
ALTER TABLE "roadmap_assessment_attempts" ADD COLUMN IF NOT EXISTS "duration_ms" integer;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cri_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"formula_id" text NOT NULL,
	"target_role" text,
	"cri_milli" integer NOT NULL,
	"components" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"trigger" text NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cri_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"component" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"metric" text NOT NULL,
	"value_milli" integer DEFAULT 0 NOT NULL,
	"weight_milli" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cri_snapshots" ADD CONSTRAINT "cri_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cri_evidence" ADD CONSTRAINT "cri_evidence_snapshot_id_cri_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."cri_snapshots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cri_snapshots_user" ON "cri_snapshots" USING btree ("user_id","computed_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cri_evidence_snapshot" ON "cri_evidence" USING btree ("snapshot_id","component");
