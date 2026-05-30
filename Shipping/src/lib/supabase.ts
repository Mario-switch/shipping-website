import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  company: string;
  is_admin: boolean;
  created_at: string;
};

export type Shipment = {
  id: string;
  tracking_number: string;
  user_id: string | null;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  service_type: 'overnight' | '2day' | 'ground' | 'international';
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  sender_state: string;
  sender_zip: string;
  sender_country: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_state: string;
  recipient_zip: string;
  recipient_country: string;
  weight: number;
  dimensions_l: number;
  dimensions_w: number;
  dimensions_h: number;
  package_type: 'envelope' | 'pak' | 'box' | 'tube';
  declared_value: number;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  shipping_cost: number;
  created_at: string;
};

export type TrackingEvent = {
  id: string;
  shipment_id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
};


