-- ============================================================================
-- GUELICHWEB - Row Level Security (RLS) Policies
-- Instructions: Copy and paste this code into your Supabase SQL Editor and hit "Run".
-- ============================================================================

-- 1. Enable RLS on all relevant tables
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_portfolio ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.video_portfolio;
DROP POLICY IF EXISTS "Public can insert project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Public can insert contest_submissions" ON public.contest_submissions;
DROP POLICY IF EXISTS "Public can insert newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can do everything on project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Admins can do everything on contest_submissions" ON public.contest_submissions;
DROP POLICY IF EXISTS "Admins can do everything on newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can do everything on portfolio_projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Admins can do everything on video_portfolio" ON public.video_portfolio;

-- 3. Public access policies (ANONYMOUS USERS)
-- Le public a seulement le droit de VOIR le portfolio, et d'INSÉRER (créer) dans les formulaires.
CREATE POLICY "Public can read portfolio_projects"
  ON public.portfolio_projects FOR SELECT USING (true);

CREATE POLICY "Public can read video_portfolio"
  ON public.video_portfolio FOR SELECT USING (true);

CREATE POLICY "Public can insert project_submissions" 
  ON public.project_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert contest_submissions" 
  ON public.contest_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert newsletter_subscribers" 
  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- 4. Admin access policies (AUTHENTICATED USERS)
-- Les administrateurs connectés ont tous les droits (SELECT, ISNERT, UPDATE, DELETE) sur toutes les tables.
CREATE POLICY "Admins have full access to project_submissions" 
  ON public.project_submissions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to contest_submissions" 
  ON public.contest_submissions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to newsletter_subscribers" 
  ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to portfolio_projects" 
  ON public.portfolio_projects FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to video_portfolio" 
  ON public.video_portfolio FOR ALL USING (auth.role() = 'authenticated');
