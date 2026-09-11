-- Permanent Student Registration ID (lifetime identity, never reused)
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "student_registration_counters" (
  "year" integer PRIMARY KEY NOT NULL,
  "last_sequence" integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "issued_student_registration_ids" (
  "registration_id" text PRIMARY KEY NOT NULL,
  "year" integer NOT NULL,
  "sequence_number" integer NOT NULL,
  "user_id" uuid,
  "issued_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "issued_student_registration_ids_user_id_unique"
  ON "issued_student_registration_ids" ("user_id")
  WHERE "user_id" IS NOT NULL;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_issued_student_registration_ids_user"
  ON "issued_student_registration_ids" ("user_id");
--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "student_registration_id" text;
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "users_student_registration_id_unique"
  ON "users" ("student_registration_id");
--> statement-breakpoint

CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'PED-'
    || substr(hex, 1, 4) || '-'
    || substr(hex, 5, 4) || '-'
    || substr(hex, 9, 4)
  FROM (
    SELECT upper(replace(gen_random_uuid()::text, '-', '')) AS hex
  ) s;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION issue_student_registration_id(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  existing text;
  y int;
  new_id text;
  attempt int;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user id is required to issue a Student ID';
  END IF;

  SELECT registration_id INTO existing
  FROM issued_student_registration_ids
  WHERE user_id = p_user_id;
  IF existing IS NOT NULL THEN
    RETURN existing;
  END IF;

  SELECT student_registration_id INTO existing
  FROM users
  WHERE id = p_user_id;
  IF existing IS NOT NULL THEN
    y := EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'))::int;
    INSERT INTO issued_student_registration_ids (
      registration_id, year, sequence_number, user_id
    )
    VALUES (existing, y, 0, p_user_id)
    ON CONFLICT (registration_id) DO UPDATE
      SET user_id = COALESCE(issued_student_registration_ids.user_id, EXCLUDED.user_id);
    RETURN existing;
  END IF;

  y := EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'))::int;

  FOR attempt IN 1..24 LOOP
    new_id := generate_student_id();
    BEGIN
      INSERT INTO issued_student_registration_ids (
        registration_id, year, sequence_number, user_id
      )
      VALUES (new_id, y, 0, p_user_id);
      RETURN new_id;
    EXCEPTION WHEN unique_violation THEN
      SELECT registration_id INTO existing
      FROM issued_student_registration_ids
      WHERE user_id = p_user_id;
      IF existing IS NOT NULL THEN
        RETURN existing;
      END IF;
    END;
  END LOOP;

  RAISE EXCEPTION 'could not allocate a unique Student ID';
END;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION users_protect_student_registration_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.student_registration_id IS NOT NULL
     AND NEW.student_registration_id IS DISTINCT FROM OLD.student_registration_id THEN
    RAISE EXCEPTION 'student_registration_id is immutable';
  END IF;

  IF NEW.role = 'student' AND NEW.student_registration_id IS NULL THEN
    NEW.student_registration_id := issue_student_registration_id(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_users_student_registration_id ON users;
--> statement-breakpoint

CREATE TRIGGER trg_users_student_registration_id
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE users_protect_student_registration_id();
--> statement-breakpoint

CREATE OR REPLACE FUNCTION issued_student_registration_ids_protect()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.registration_id IS DISTINCT FROM OLD.registration_id
     OR NEW.year IS DISTINCT FROM OLD.year
     OR NEW.sequence_number IS DISTINCT FROM OLD.sequence_number THEN
    RAISE EXCEPTION 'issued Student Registration IDs are immutable';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_issued_student_registration_ids_protect
  ON issued_student_registration_ids;
--> statement-breakpoint

CREATE TRIGGER trg_issued_student_registration_ids_protect
BEFORE UPDATE ON issued_student_registration_ids
FOR EACH ROW
EXECUTE PROCEDURE issued_student_registration_ids_protect();
--> statement-breakpoint

CREATE OR REPLACE FUNCTION issued_student_registration_ids_detach_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM issued_student_registration_ids
  WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_users_detach_student_registration_id ON users;
--> statement-breakpoint

CREATE TRIGGER trg_users_detach_student_registration_id
AFTER DELETE ON users
FOR EACH ROW
EXECUTE PROCEDURE issued_student_registration_ids_detach_user();
--> statement-breakpoint

-- Deterministic backfill: existing students by created_at, then id
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id
    FROM users
    WHERE role = 'student'
      AND student_registration_id IS NULL
    ORDER BY created_at ASC, id ASC
  LOOP
    UPDATE users
    SET updated_at = updated_at
    WHERE id = r.id;
  END LOOP;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "users"
    ADD CONSTRAINT "users_student_registration_id_required_for_students"
    CHECK (role <> 'student' OR student_registration_id IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN duplicate_table THEN NULL;
END $$;
