-- Withdrawal waivers table for Spanish consumer law compliance
-- Stores acceptance of right of withdrawal waiver (art. 103.m RDL 1/2007)

CREATE TABLE IF NOT EXISTS withdrawal_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  waiver_version TEXT DEFAULT 'v1',
  checkout_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_withdrawal_waivers_user_id ON withdrawal_waivers(user_id);

-- Index for audit queries by date
CREATE INDEX idx_withdrawal_waivers_accepted_at ON withdrawal_waivers(accepted_at);

-- Enable RLS (only service role should access this)
ALTER TABLE withdrawal_waivers ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can access (for legal audit purposes)

COMMENT ON TABLE withdrawal_waivers IS 'Stores withdrawal waiver acceptances for Spanish consumer law compliance (art. 103.m RDL 1/2007)';
