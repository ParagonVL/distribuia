-- Migration: Add composite indexes for performance
-- This index optimizes the common query pattern: get user's conversions ordered by date

-- Composite index on conversions for user history queries
-- Replaces separate indexes with more efficient combined index
CREATE INDEX IF NOT EXISTS idx_conversions_user_id_created_at
ON conversions(user_id, created_at DESC);

-- Composite index on outputs for fetching conversion outputs
CREATE INDEX IF NOT EXISTS idx_outputs_conversion_id_created_at
ON outputs(conversion_id, created_at DESC);

-- Index on users for plan-based queries (analytics, billing)
CREATE INDEX IF NOT EXISTS idx_users_plan_created_at
ON users(plan, created_at DESC);
