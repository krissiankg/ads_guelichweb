-- Key/value settings editable from the admin dashboard (e.g. contest closing date on /contest)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (key, value)
VALUES ('contest_deadline', '2026-04-17')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage site_settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
