-- Migration: Add nullable latitude/longitude to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='latitude'
  ) THEN
    ALTER TABLE users ADD COLUMN latitude DECIMAL(9,6);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='longitude'
  ) THEN
    ALTER TABLE users ADD COLUMN longitude DECIMAL(9,6);
  END IF;
END$$;

-- Optional index for faster nearby lookups (non-spatial)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename='users' AND indexname='idx_users_location'
  ) THEN
    CREATE INDEX idx_users_location ON users(latitude, longitude);
  END IF;
END$$;
