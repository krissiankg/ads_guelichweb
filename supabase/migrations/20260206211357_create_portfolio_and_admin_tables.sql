/*
  # Create Portfolio and Admin Tables

  1. New Tables
    - `portfolio_projects`
      - `id` (uuid, primary key) - Unique identifier for each project
      - `title` (text) - Project title/name
      - `category` (text) - Project category (Video, Link, Gallery, etc.)
      - `thumbnail_url` (text) - URL to project thumbnail image
      - `project_url` (text, nullable) - URL to the live project or demo
      - `description` (text, nullable) - Project description
      - `order_index` (integer) - Display order (lower numbers appear first)
      - `is_featured` (boolean) - Whether to feature this project prominently
      - `is_visible` (boolean) - Whether to display this project
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

    - `admin_users`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `email` (text, unique) - Admin email address
      - `full_name` (text) - Admin full name
      - `is_active` (boolean) - Whether admin account is active
      - `created_at` (timestamptz) - Record creation timestamp
      - `last_login_at` (timestamptz, nullable) - Last login timestamp

  2. Security
    - Enable RLS on both tables
    - Public can read visible portfolio projects
    - Only authenticated admin users can modify portfolio
    - Admin users table is only accessible by authenticated admins

  3. Important Notes
    - Portfolio projects have order_index for custom sorting
    - is_featured flag for highlighting key projects
    - is_visible allows hiding projects without deleting
    - Admin system uses Supabase Auth integration
*/

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