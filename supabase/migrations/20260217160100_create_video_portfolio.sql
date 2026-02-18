-- ============================================================================
-- MIGRATION 6: Create video_portfolio table + update portfolio_projects
-- ============================================================================

-- Video portfolio table
CREATE TABLE IF NOT EXISTS video_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_image_url text NOT NULL,
  video_url text DEFAULT '',
  video_embed text DEFAULT '',
  video_platform text DEFAULT 'youtube' CHECK (video_platform IN ('youtube', 'vimeo', 'mega', 'other')),
  size_category text DEFAULT 'medium' CHECK (size_category IN ('short', 'medium', 'long')),
  description text DEFAULT '',
  order_index integer DEFAULT 0 NOT NULL,
  is_visible boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE video_portfolio ENABLE ROW LEVEL SECURITY;

-- Public can view visible videos
CREATE POLICY "Anyone can view visible videos"
  ON video_portfolio
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- Admin CRUD
CREATE POLICY "Admin users can insert videos"
  ON video_portfolio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true)
  );

CREATE POLICY "Admin users can update videos"
  ON video_portfolio
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

CREATE POLICY "Admin users can delete videos"
  ON video_portfolio
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

-- Add portfolio_type to portfolio_projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'portfolio_type'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN portfolio_type text DEFAULT 'web_app' CHECK (portfolio_type IN ('web_app', 'graphic_design'));
  END IF;
END $$;

-- Trigger for video updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_video_portfolio_updated_at'
  ) THEN
    CREATE TRIGGER update_video_portfolio_updated_at
      BEFORE UPDATE ON video_portfolio
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_video_order ON video_portfolio(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_category ON video_portfolio(size_category);
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON portfolio_projects(portfolio_type);
