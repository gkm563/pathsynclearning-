-- Random Student IDs so sequential numbers cannot reveal how many students exist
--> statement-breakpoint

ALTER TABLE "issued_student_registration_ids"
  DROP CONSTRAINT IF EXISTS "issued_student_registration_ids_year_seq";
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

-- One-time rewrite of sequential PED-YYYY-NNNNNN IDs (those leak headcount)
DROP TRIGGER IF EXISTS trg_users_student_registration_id ON users;
--> statement-breakpoint

DO $$
DECLARE
  r record;
  new_id text;
  y int;
BEGIN
  y := EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'))::int;
  FOR r IN
    SELECT id, student_registration_id
    FROM users
    WHERE student_registration_id ~ '^PED-[0-9]{4}-[0-9]+$'
  LOOP
    LOOP
      new_id := generate_student_id();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM issued_student_registration_ids WHERE registration_id = new_id
      ) AND NOT EXISTS (
        SELECT 1 FROM users WHERE student_registration_id = new_id
      );
    END LOOP;

    DELETE FROM issued_student_registration_ids
    WHERE user_id = r.id
       OR registration_id = r.student_registration_id;

    INSERT INTO issued_student_registration_ids (
      registration_id, year, sequence_number, user_id
    )
    VALUES (new_id, y, 0, r.id);

    UPDATE users
    SET student_registration_id = new_id
    WHERE id = r.id;
  END LOOP;
END $$;
--> statement-breakpoint

CREATE TRIGGER trg_users_student_registration_id
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE users_protect_student_registration_id();
