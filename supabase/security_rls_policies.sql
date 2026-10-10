-- ============================================================================
-- GUELICHWEB - Row Level Security (RLS) Policies
-- Instructions: Copy and paste this code into your Supabase SQL Editor and hit "Run".
-- The script is safe to re-run.
--
-- Rules:
--   - Visitors can read the portfolio and the site settings, and submit the forms.
--   - Only ACTIVE users listed in admin_users can read the submissions and the
--     subscribers, or change the content. Being logged in is NOT enough.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.site_settings (key, value) VALUES ('contest_deadline', '2026-04-17') ON CONFLICT (key) DO NOTHING;

-- 1. Helper: is the current user an active admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 2. Enable RLS on all relevant tables
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop EVERY existing policy on these tables.
-- Older scripts created overlapping policies, some of them open to any logged-in
-- user. Policies are combined with OR, so a single permissive one opens the table.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'project_submissions', 'contest_submissions', 'newsletter_subscribers',
        'portfolio_projects', 'video_portfolio', 'site_settings'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 4. Public access policies (visitors)
-- Le public a seulement le droit de VOIR le portfolio, et d'INSÉRER (créer) dans les formulaires.
CREATE POLICY "Public can read portfolio_projects"
  ON public.portfolio_projects FOR SELECT USING (true);

CREATE POLICY "Public can read video_portfolio"
  ON public.video_portfolio FOR SELECT USING (true);

CREATE POLICY "Public can read site_settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Public can insert project_submissions"
  ON public.project_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert contest_submissions"
  ON public.contest_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert newsletter_subscribers"
  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- 5. Admin access policies (users listed in admin_users only)
-- Les administrateurs ont tous les droits (SELECT, INSERT, UPDATE, DELETE) sur ces tables.
CREATE POLICY "Admins have full access to project_submissions"
  ON public.project_submissions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to contest_submissions"
  ON public.contest_submissions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to newsletter_subscribers"
  ON public.newsletter_subscribers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to portfolio_projects"
  ON public.portfolio_projects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to video_portfolio"
  ON public.video_portfolio FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to site_settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Check: list the policies now in place (shown in the results panel)
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'project_submissions', 'contest_submissions', 'newsletter_subscribers',
    'portfolio_projects', 'video_portfolio', 'site_settings'
  )
ORDER BY tablename, policyname;
