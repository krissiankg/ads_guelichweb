-- Phase 4: Admin Roles
-- Run this in your Supabase SQL editor

-- 1. Add role column to admin_users
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'editor'
CHECK (role IN ('super_admin', 'editor', 'viewer'));

-- 2. Set existing admin as super_admin
UPDATE admin_users SET role = 'super_admin' WHERE is_active = true;

-- 3. Enable Realtime on project_submissions (for notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE project_submissions;

-- 4. Ensure order_index exists on portfolio tables (for drag & drop)
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE video_portfolio ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
