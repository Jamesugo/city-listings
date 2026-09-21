-- ==============================================================================
-- Automatically Delete Business When User is Deleted
-- ==============================================================================

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION delete_business_on_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- If the deleted user had an associated business, delete that business too
  IF OLD.business_id IS NOT NULL THEN
    DELETE FROM businesses WHERE id = OLD.business_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the trigger to the `users` table
DROP TRIGGER IF EXISTS trg_delete_business_on_user_delete ON users;

CREATE TRIGGER trg_delete_business_on_user_delete
AFTER DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION delete_business_on_user_delete();
