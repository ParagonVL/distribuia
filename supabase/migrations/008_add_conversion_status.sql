-- Add status tracking to conversions table for background processing
-- This enables progressive UI updates as each format completes

-- Create enum for conversion status
DO $$ BEGIN
  CREATE TYPE conversion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add status columns to conversions table
ALTER TABLE conversions
ADD COLUMN IF NOT EXISTS status conversion_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL;

-- Update existing conversions to 'completed' status (they already have outputs)
UPDATE conversions
SET status = 'completed',
    completed_at = created_at
WHERE status = 'pending'
  AND id IN (SELECT DISTINCT conversion_id FROM outputs);

-- Add index for querying pending/processing conversions
CREATE INDEX IF NOT EXISTS idx_conversions_status
ON conversions(status)
WHERE status IN ('pending', 'processing');

-- Add index for user's recent conversions by status
CREATE INDEX IF NOT EXISTS idx_conversions_user_status
ON conversions(user_id, status, created_at DESC);
