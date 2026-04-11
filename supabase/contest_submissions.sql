-- ============================================================================
-- MIGRATION: Create contest_submissions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS contest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  company_name text NOT NULL,
  sector text NOT NULL,
  has_clients boolean DEFAULT false NOT NULL,
  has_social_media boolean DEFAULT false NOT NULL,
  activity_description text NOT NULL,
  why_win text NOT NULL,
  status text DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'read', 'contacted', 'selected', 'archived')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Active RLS
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insertion
DROP POLICY IF EXISTS "Anyone can participate in the contest" ON contest_submissions;
CREATE POLICY "Anyone can participate in the contest"
  ON contest_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow admins to read/manage entries
DROP POLICY IF EXISTS "Admin users can manage contest submissions" ON contest_submissions;
CREATE POLICY "Admin users can manage contest submissions"
  ON contest_submissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contest_status ON contest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contest_created ON contest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contest_email ON contest_submissions(email);
