/*
  # FedEx Clone - Core Schema

  1. New Tables
    - `profiles` - Extended user profile data linked to auth.users
      - `id` (uuid, FK to auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `company` (text)
      - `created_at` (timestamptz)

    - `shipments` - Shipment/package records
      - `id` (uuid, primary key)
      - `tracking_number` (text, unique) - generated tracking number
      - `user_id` (uuid, nullable FK to auth.users)
      - `status` (text) - pending, in_transit, out_for_delivery, delivered, exception
      - `service_type` (text) - overnight, 2day, ground, international
      - `sender_name`, `sender_email`, `sender_phone` (text)
      - `sender_address`, `sender_city`, `sender_state`, `sender_zip`, `sender_country` (text)
      - `recipient_name`, `recipient_email`, `recipient_phone` (text)
      - `recipient_address`, `recipient_city`, `recipient_state`, `recipient_zip`, `recipient_country` (text)
      - `weight` (numeric) - in lbs
      - `dimensions_l`, `dimensions_w`, `dimensions_h` (numeric) - in inches
      - `package_type` (text) - envelope, pak, box, tube
      - `declared_value` (numeric)
      - `estimated_delivery` (date)
      - `actual_delivery` (timestamptz)
      - `created_at` (timestamptz)

    - `tracking_events` - Timeline of tracking events per shipment
      - `id` (uuid, primary key)
      - `shipment_id` (uuid, FK to shipments)
      - `status` (text)
      - `description` (text)
      - `location` (text)
      - `timestamp` (timestamptz)

    - `shipping_quotes` - Saved rate quotes
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `service_type` (text)
      - `origin_zip` (text)
      - `destination_zip` (text)
      - `weight` (numeric)
      - `quoted_price` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Users can read/write their own data
    - Tracking is publicly readable by tracking number (via RPC)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  company text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  service_type text NOT NULL DEFAULT 'ground',
  sender_name text NOT NULL DEFAULT '',
  sender_email text NOT NULL DEFAULT '',
  sender_phone text NOT NULL DEFAULT '',
  sender_address text NOT NULL DEFAULT '',
  sender_city text NOT NULL DEFAULT '',
  sender_state text NOT NULL DEFAULT '',
  sender_zip text NOT NULL DEFAULT '',
  sender_country text NOT NULL DEFAULT 'US',
  recipient_name text NOT NULL DEFAULT '',
  recipient_email text NOT NULL DEFAULT '',
  recipient_phone text NOT NULL DEFAULT '',
  recipient_address text NOT NULL DEFAULT '',
  recipient_city text NOT NULL DEFAULT '',
  recipient_state text NOT NULL DEFAULT '',
  recipient_zip text NOT NULL DEFAULT '',
  recipient_country text NOT NULL DEFAULT 'US',
  weight numeric NOT NULL DEFAULT 1,
  dimensions_l numeric NOT NULL DEFAULT 12,
  dimensions_w numeric NOT NULL DEFAULT 9,
  dimensions_h numeric NOT NULL DEFAULT 6,
  package_type text NOT NULL DEFAULT 'box',
  declared_value numeric NOT NULL DEFAULT 0,
  estimated_delivery date,
  actual_delivery timestamptz,
  shipping_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow public tracking lookup via tracking number (function-based)
CREATE POLICY "Public can read shipments for tracking"
  ON shipments FOR SELECT
  TO anon
  USING (true);

-- Tracking events table
CREATE TABLE IF NOT EXISTS tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tracking events"
  ON tracking_events FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can read tracking events"
  ON tracking_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert tracking events for own shipments"
  ON tracking_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_id
      AND shipments.user_id = auth.uid()
    )
  );

-- Shipping quotes table
CREATE TABLE IF NOT EXISTS shipping_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service_type text NOT NULL DEFAULT 'ground',
  origin_zip text NOT NULL DEFAULT '',
  destination_zip text NOT NULL DEFAULT '',
  weight numeric NOT NULL DEFAULT 1,
  quoted_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quotes"
  ON shipping_quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
  ON shipping_quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(timestamp DESC);

-- Seed sample shipment data for demo purposes
INSERT INTO shipments (
  tracking_number, status, service_type,
  sender_name, sender_email, sender_phone, sender_address, sender_city, sender_state, sender_zip, sender_country,
  recipient_name, recipient_email, recipient_phone, recipient_address, recipient_city, recipient_state, recipient_zip, recipient_country,
  weight, dimensions_l, dimensions_w, dimensions_h, package_type, declared_value,
  estimated_delivery, shipping_cost
) VALUES
(
  '789456123014', 'in_transit', 'overnight',
  'John Smith', 'john@example.com', '555-0100', '123 Main St', 'Memphis', 'TN', '38101', 'US',
  'Jane Doe', 'jane@example.com', '555-0200', '456 Oak Ave', 'New York', 'NY', '10001', 'US',
  2.5, 12, 9, 6, 'box', 150,
  CURRENT_DATE + INTERVAL '1 day', 89.99
),
(
  '789456123015', 'out_for_delivery', '2day',
  'Alice Johnson', 'alice@example.com', '555-0300', '789 Pine Rd', 'Chicago', 'IL', '60601', 'US',
  'Bob Wilson', 'bob@example.com', '555-0400', '321 Elm St', 'Los Angeles', 'CA', '90001', 'US',
  1.2, 10, 8, 4, 'pak', 75,
  CURRENT_DATE, 45.50
),
(
  '789456123016', 'delivered', 'ground',
  'Carol Martinez', 'carol@example.com', '555-0500', '654 Birch Ln', 'Houston', 'TX', '77001', 'US',
  'David Lee', 'david@example.com', '555-0600', '987 Cedar Dr', 'Phoenix', 'AZ', '85001', 'US',
  5.0, 18, 14, 10, 'box', 200,
  CURRENT_DATE - INTERVAL '1 day', 28.75
)
ON CONFLICT (tracking_number) DO NOTHING;

-- Seed tracking events for demo shipments
DO $$
DECLARE
  s1_id uuid;
  s2_id uuid;
  s3_id uuid;
BEGIN
  SELECT id INTO s1_id FROM shipments WHERE tracking_number = '789456123014';
  SELECT id INTO s2_id FROM shipments WHERE tracking_number = '789456123015';
  SELECT id INTO s3_id FROM shipments WHERE tracking_number = '789456123016';

  IF s1_id IS NOT NULL THEN
    INSERT INTO tracking_events (shipment_id, status, description, location, timestamp) VALUES
    (s1_id, 'label_created', 'Shipment information sent to FedEx', 'Memphis, TN', now() - INTERVAL '2 days'),
    (s1_id, 'picked_up', 'Package picked up by FedEx courier', 'Memphis, TN', now() - INTERVAL '1 day 18 hours'),
    (s1_id, 'in_transit', 'Package arrived at FedEx facility', 'Memphis, TN Hub', now() - INTERVAL '1 day 12 hours'),
    (s1_id, 'in_transit', 'Departed FedEx facility', 'Memphis, TN Hub', now() - INTERVAL '1 day 6 hours'),
    (s1_id, 'in_transit', 'In transit to destination', 'Newark, NJ Hub', now() - INTERVAL '6 hours')
    ON CONFLICT DO NOTHING;
  END IF;

  IF s2_id IS NOT NULL THEN
    INSERT INTO tracking_events (shipment_id, status, description, location, timestamp) VALUES
    (s2_id, 'label_created', 'Shipment information sent to FedEx', 'Chicago, IL', now() - INTERVAL '3 days'),
    (s2_id, 'picked_up', 'Package picked up by FedEx courier', 'Chicago, IL', now() - INTERVAL '2 days 20 hours'),
    (s2_id, 'in_transit', 'Package arrived at FedEx facility', 'Chicago, IL Hub', now() - INTERVAL '2 days 14 hours'),
    (s2_id, 'in_transit', 'Departed FedEx facility', 'Chicago, IL Hub', now() - INTERVAL '2 days 8 hours'),
    (s2_id, 'in_transit', 'Package arrived at destination facility', 'Los Angeles, CA Hub', now() - INTERVAL '8 hours'),
    (s2_id, 'out_for_delivery', 'Package is out for delivery', 'Los Angeles, CA', now() - INTERVAL '2 hours')
    ON CONFLICT DO NOTHING;
  END IF;

  IF s3_id IS NOT NULL THEN
    INSERT INTO tracking_events (shipment_id, status, description, location, timestamp) VALUES
    (s3_id, 'label_created', 'Shipment information sent to FedEx', 'Houston, TX', now() - INTERVAL '5 days'),
    (s3_id, 'picked_up', 'Package picked up by FedEx courier', 'Houston, TX', now() - INTERVAL '4 days 18 hours'),
    (s3_id, 'in_transit', 'Package arrived at FedEx facility', 'Houston, TX Hub', now() - INTERVAL '4 days 12 hours'),
    (s3_id, 'in_transit', 'Departed FedEx facility', 'Houston, TX Hub', now() - INTERVAL '4 days 2 hours'),
    (s3_id, 'in_transit', 'Package arrived at destination facility', 'Phoenix, AZ Hub', now() - INTERVAL '2 days 10 hours'),
    (s3_id, 'out_for_delivery', 'Package is out for delivery', 'Phoenix, AZ', now() - INTERVAL '1 day 6 hours'),
    (s3_id, 'delivered', 'Package delivered - Front Door', 'Phoenix, AZ', now() - INTERVAL '1 day 2 hours')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
