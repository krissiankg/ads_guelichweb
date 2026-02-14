/*
  # Fix Admin Users RLS Policy

  1. Changes
    - Drop existing SELECT policy that creates circular dependency
    - Create new policy allowing authenticated users to check their own admin status
    - Keep existing UPDATE policy unchanged

  2. Security
    - Users can only see their own admin_users row
    - Still requires authentication
    - Prevents unauthorized access to other admin records
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admin users can read all admin users" ON admin_users;

-- Create a new policy that allows authenticated users to check their own admin status
CREATE POLICY "Users can check their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());