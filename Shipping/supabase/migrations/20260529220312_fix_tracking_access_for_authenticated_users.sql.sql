/*
  # Fix tracking access for authenticated users

  Problem: Authenticated users couldn't track shipments they didn't own
  because the "Public can read" policy only applied to 'anon' role.

  Solution: Drop the restrictive anon-only policy and create a new policy
  that allows ALL roles (authenticated and anon) to read shipments 
  for tracking purposes.

  1. Changes
    - Drop policy "Public can read shipments for tracking"
    - Create new policy "Anyone can read shipments for tracking" 
      applying to BOTH authenticated and anon roles
*/

-- Drop the old anon-only policy
DROP POLICY IF EXISTS "Public can read shipments for tracking" ON shipments;

-- Create new policy for both authenticated and anon
CREATE POLICY "Anyone can read shipments for tracking"
  ON shipments FOR SELECT
  USING (true);
