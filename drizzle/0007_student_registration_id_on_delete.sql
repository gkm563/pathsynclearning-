-- Remove the Student Registration ID when the account is deleted
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
