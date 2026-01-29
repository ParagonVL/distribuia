-- Add columns for re-engagement email tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_conversion_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reengagement_email_sent BOOLEAN DEFAULT false;

-- Index for finding inactive users efficiently
CREATE INDEX IF NOT EXISTS idx_users_last_conversion_at
ON users(last_conversion_at)
WHERE last_conversion_at IS NOT NULL;
