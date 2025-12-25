-- Migration: Add internationalization fields to users table
-- Description: Add timezone and language preference columns to support multi-timezone and multi-language functionality

-- Add timezone column with default UTC
ALTER TABLE users 
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL;

-- Add language column with default English
ALTER TABLE users 
ADD COLUMN language VARCHAR(5) DEFAULT 'en' NOT NULL;

-- Create index for timezone queries
CREATE INDEX idx_users_timezone ON users(timezone);

-- Create index for language queries  
CREATE INDEX idx_users_language ON users(language);

-- Add timezone and language to user_profiles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
        ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en' NOT NULL;
        
        CREATE INDEX IF NOT EXISTS idx_user_profiles_timezone ON user_profiles(timezone);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_language ON user_profiles(language);
    END IF;
END $$;

-- Update existing users with default values (if any exist)
UPDATE users SET 
    timezone = 'UTC',
    language = 'en'
WHERE timezone IS NULL OR language IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.timezone IS 'User timezone preference (e.g., America/New_York, Europe/London)';
COMMENT ON COLUMN users.language IS 'User language preference (ISO 639-1 code, e.g., en, es, fr)';

-- Create function to validate timezone
CREATE OR REPLACE FUNCTION validate_timezone(tz TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation for common timezone formats
    RETURN tz ~ '^[A-Za-z_]+/[A-Za-z_]+$' OR tz = 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Create function to validate language code
CREATE OR REPLACE FUNCTION validate_language(lang TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate ISO 639-1 language codes (2-5 characters)
    RETURN lang ~ '^[a-z]{2}(-[A-Z]{2})?$';
END;
$$ LANGUAGE plpgsql;

-- Add check constraints for validation
ALTER TABLE users 
ADD CONSTRAINT chk_users_timezone CHECK (validate_timezone(timezone)),
ADD CONSTRAINT chk_users_language CHECK (validate_language(language));