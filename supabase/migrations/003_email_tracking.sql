-- Track if low usage email was sent this billing cycle
ALTER TABLE users
ADD COLUMN IF NOT EXISTS low_usage_email_sent_this_cycle boolean DEFAULT false;

-- Add index for cron job query performance
CREATE INDEX IF NOT EXISTS idx_users_billing_cycle_start ON users(billing_cycle_start);
