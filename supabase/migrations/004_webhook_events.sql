-- Webhook events table for idempotency tracking
-- Prevents duplicate processing of Stripe webhooks

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'processed' CHECK (status IN ('processed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cleanup queries (delete old events)
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

-- Auto-cleanup: delete events older than 30 days
-- This can be run via cron job or Supabase scheduled function
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_events WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE webhook_events IS 'Tracks processed Stripe webhook events for idempotency';
