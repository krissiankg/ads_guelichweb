-- ============================================================================
-- MIGRATIONS SUPABASE GUELICHWEB — PHASE 2 (FICHIER COMBINÉ — IDEMPOTENT)
-- ============================================================================
-- Ce script peut être exécuté plusieurs fois sans erreur.
-- URL: https://app.supabase.com/project/thnowfeqcbormjmlfunx/sql/new
-- ============================================================================


-- ============================================================================
-- 1. TABLE: project_submissions
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

DROP POLICY IF EXISTS "Anyone can submit project form" ON project_submissions;
CREATE POLICY "Anyone can submit project form"
  ON project_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin users can read project submissions" ON project_submissions;
CREATE POLICY "Admin users can read project submissions"
  ON project_submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can update project submissions" ON project_submissions;
CREATE POLICY "Admin users can update project submissions"
  ON project_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can delete project submissions" ON project_submissions;
CREATE POLICY "Admin users can delete project submissions"
  ON project_submissions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can read newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Admin users can read newsletter subscribers"
  ON newsletter_subscribers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

CREATE INDEX IF NOT EXISTS idx_submissions_status ON project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON project_submissions(created_at DESC);


-- ============================================================================
-- 2. TABLE: video_portfolio + portfolio_type column
-- ============================================================================

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

DROP POLICY IF EXISTS "Anyone can view visible videos" ON video_portfolio;
CREATE POLICY "Anyone can view visible videos"
  ON video_portfolio FOR SELECT TO anon, authenticated USING (is_visible = true);

DROP POLICY IF EXISTS "Admin users can read all videos" ON video_portfolio;
CREATE POLICY "Admin users can read all videos"
  ON video_portfolio FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can insert videos" ON video_portfolio;
CREATE POLICY "Admin users can insert videos"
  ON video_portfolio FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can update videos" ON video_portfolio;
CREATE POLICY "Admin users can update videos"
  ON video_portfolio FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can delete videos" ON video_portfolio;
CREATE POLICY "Admin users can delete videos"
  ON video_portfolio FOR DELETE TO authenticated
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
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_video_portfolio_updated_at') THEN
    CREATE TRIGGER update_video_portfolio_updated_at
      BEFORE UPDATE ON video_portfolio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_video_order ON video_portfolio(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_category ON video_portfolio(size_category);
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON portfolio_projects(portfolio_type);


-- ============================================================================
-- 3. STORAGE: Bucket portfolio-images
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images', 'portfolio-images', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for portfolio images" ON storage.objects;
CREATE POLICY "Public read access for portfolio images"
  ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Admin users can upload portfolio images" ON storage.objects;
CREATE POLICY "Admin users can upload portfolio images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-images' AND EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can update portfolio images" ON storage.objects;
CREATE POLICY "Admin users can update portfolio images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-images' AND EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true))
  WITH CHECK (bucket_id = 'portfolio-images' AND EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));

DROP POLICY IF EXISTS "Admin users can delete portfolio images" ON storage.objects;
CREATE POLICY "Admin users can delete portfolio images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-images' AND EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true));


-- ============================================================================
-- DONE! Vérification :
-- ============================================================================
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('project_submissions', 'video_portfolio')
ORDER BY table_name;
