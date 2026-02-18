-- ============================================================================
-- MIGRATION 5: Create project_submissions table
-- Stores project form submissions from the website
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  project_type text NOT NULL,
  budget text DEFAULT '',
  description text DEFAULT '',
  consent boolean DEFAULT true NOT NULL,
  status text DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a project form
CREATE POLICY "Anyone can submit project form"
  ON project_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admin users can read submissions
CREATE POLICY "Admin users can read project submissions"
  ON project_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can update status
CREATE POLICY "Admin users can update project submissions"
  ON project_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can delete submissions
CREATE POLICY "Admin users can delete project submissions"
  ON project_submissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Also let admin read newsletter subscribers
CREATE POLICY "Admin users can read newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_submissions_status ON project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON project_submissions(created_at DESC);
