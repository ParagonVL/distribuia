-- Add email notification preferences to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

-- Index for filtering users who have opted out
CREATE INDEX IF NOT EXISTS idx_users_email_notifications
ON users(email_notifications_enabled)
WHERE email_notifications_enabled = false;

COMMENT ON COLUMN users.email_notifications_enabled IS 'Whether user has opted in to receive email notifications';
