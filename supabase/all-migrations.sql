-- ============================================================================
-- MIGRATIONS SUPABASE GUELICHWEB - FICHIER COMPLET
-- ============================================================================
-- Exécutez ce fichier complet dans l'éditeur SQL de Supabase
-- URL: https://app.supabase.com/project/thnowfeqcbormjmlfunx/sql/new
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Create newsletter_subscribers table
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT '',
  email text UNIQUE NOT NULL,
  consent boolean DEFAULT true NOT NULL,
  coupon_code text DEFAULT 'WELCOME10' NOT NULL,
  coupon_used boolean DEFAULT false NOT NULL,
  coupon_expires_at timestamptz DEFAULT (now() + interval '30 days') NOT NULL,
  subscribed_at timestamptz DEFAULT now() NOT NULL,
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can unsubscribe themselves"
  ON newsletter_subscribers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- ============================================================================
-- MIGRATION 2: Create portfolio_projects and admin_users tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  thumbnail_url text NOT NULL,
  project_url text,
  description text,
  order_index integer DEFAULT 0 NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  is_visible boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '' NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_login_at timestamptz
);

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible portfolio projects"
  ON portfolio_projects
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Admin users can insert portfolio projects"
  ON portfolio_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update portfolio projects"
  ON portfolio_projects
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

CREATE POLICY "Admin users can delete portfolio projects"
  ON portfolio_projects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can read all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update their own profile"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_portfolio_order ON portfolio_projects(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_projects(is_featured, is_visible);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_portfolio_projects_updated_at'
  ) THEN
    CREATE TRIGGER update_portfolio_projects_updated_at
      BEFORE UPDATE ON portfolio_projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- MIGRATION 3: Add JSON fields to portfolio_projects
-- ============================================================================

DO $$
BEGIN
  -- Add summary field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'summary'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN summary text;
  END IF;

  -- Add features field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'features'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN features jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add technologies field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'technologies'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN technologies jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add images field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'images'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN images jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add objectifs field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'objectifs'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN objectifs text;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION 4: Fix admin_users RLS policy
-- ============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admin users can read all admin users" ON admin_users;

-- Create a new policy that allows authenticated users to check their own admin status
CREATE POLICY "Users can check their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Uncomment the lines below to verify the tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('newsletter_subscribers', 'portfolio_projects', 'admin_users')
-- ORDER BY table_name;
