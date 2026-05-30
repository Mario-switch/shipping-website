/*
  # Add Admin Role and Policies

  1. Changes
    - Add `is_admin` column to profiles table (defaults to false)
    - Add admin policies for full access to shipments and tracking_events
    - Allow admins to update any shipment status
    - Allow admins to insert/update/delete any tracking events

  2. Security
    - Admin role is stored in profiles.is_admin
    - RLS policies check for admin role before allowing full access
    - Regular users still have limited access to their own data
*/

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Admin policies for shipments
CREATE POLICY "Admins can manage all shipments"
  ON shipments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin policies for tracking events
CREATE POLICY "Admins can manage all tracking events"
  ON tracking_events FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow admins to update tracking events
CREATE POLICY "Admins can update any tracking event"
  ON tracking_events FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow admins to delete tracking events
CREATE POLICY "Admins can delete any tracking event"
  ON tracking_events FOR DELETE
  TO authenticated
  USING (is_admin());
