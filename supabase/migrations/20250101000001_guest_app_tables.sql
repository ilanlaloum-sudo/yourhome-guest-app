-- Colonnes manquantes sur guests
ALTER TABLE guests ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS supabase_user_id UUID REFERENCES auth.users(id);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr';

-- Colonnes manquantes sur reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS adults INTEGER DEFAULT 1;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS children INTEGER DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS guest_instructions TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS arrival_note TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS actual_check_in_at TIMESTAMPTZ;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS actual_check_out_at TIMESTAMPTZ;

-- Colonnes manquantes sur conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'whatsapp';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS has_human_agent BOOLEAN DEFAULT false;

-- booking_access_tokens
CREATE TABLE IF NOT EXISTS booking_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  use_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 50,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- property_photos
CREATE TABLE IF NOT EXISTS property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  url TEXT NOT NULL,
  url_thumb TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  room_type TEXT,
  visible_guest_app BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- property_amenities
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  category TEXT,
  name TEXT NOT NULL,
  icon_key TEXT,
  display_order INTEGER DEFAULT 0,
  is_highlight BOOLEAN DEFAULT false,
  guest_visible BOOLEAN DEFAULT true
);

-- service_catalog
CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr TEXT NOT NULL,
  name_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  category TEXT NOT NULL,
  icon_key TEXT,
  pricing_type TEXT DEFAULT 'fixed',
  base_price_eur NUMERIC(8,2),
  is_active BOOLEAN DEFAULT true,
  available_before_stay BOOLEAN DEFAULT true,
  available_during_stay BOOLEAN DEFAULT true,
  available_after_stay BOOLEAN DEFAULT false,
  lead_time_hours INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- property_service_availability
CREATE TABLE IF NOT EXISTS property_service_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  custom_price_eur NUMERIC(8,2),
  UNIQUE(property_id, service_id)
);

-- service_requests
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id),
  guest_id UUID NOT NULL,
  service_id UUID NOT NULL REFERENCES service_catalog(id),
  status TEXT NOT NULL DEFAULT 'pending',
  requested_for TIMESTAMPTZ,
  quantity INTEGER DEFAULT 1,
  special_instructions TEXT,
  price_eur NUMERIC(8,2),
  guest_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) UNIQUE,
  guest_id UUID NOT NULL,
  property_id UUID NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 1 AND 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- guest_loyalty_profiles
CREATE TABLE IF NOT EXISTS guest_loyalty_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'new',
  total_stays INTEGER DEFAULT 0,
  total_nights INTEGER DEFAULT 0,
  total_spent_eur NUMERIC(10,2) DEFAULT 0,
  active_benefits JSONB DEFAULT '[]',
  first_stay_date DATE,
  last_stay_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- guest_rewards
CREATE TABLE IF NOT EXISTS guest_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL,
  reservation_id UUID REFERENCES reservations(id),
  reward_type TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  value_eur NUMERIC(8,2),
  status TEXT NOT NULL DEFAULT 'active',
  valid_until DATE,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vue guest-safe
CREATE OR REPLACE VIEW guest_reservation_view AS
SELECT
  id,
  booking_reference,
  property_id,
  channel_account_id,
  check_in_at,
  check_out_at,
  adults,
  children,
  status,
  guest_instructions,
  arrival_note,
  actual_check_in_at,
  actual_check_out_at
FROM reservations
WHERE guest_id = (
  SELECT id FROM guests WHERE supabase_user_id = auth.uid()
);

-- Helper function RLS
CREATE OR REPLACE FUNCTION guest_id_for_user()
RETURNS UUID AS $$
  SELECT id FROM guests WHERE supabase_user_id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS
ALTER TABLE booking_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_loyalty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guest_own_tokens" ON booking_access_tokens
  FOR SELECT USING (guest_id = guest_id_for_user());

CREATE POLICY "guest_see_photos" ON property_photos
  FOR SELECT USING (visible_guest_app = true AND is_active = true);

CREATE POLICY "guest_see_amenities" ON property_amenities
  FOR SELECT USING (guest_visible = true);

CREATE POLICY "guest_see_services" ON service_catalog
  FOR SELECT USING (is_active = true);

CREATE POLICY "guest_see_service_availability" ON property_service_availability
  FOR SELECT USING (is_available = true);

CREATE POLICY "guest_own_requests" ON service_requests
  FOR ALL USING (guest_id = guest_id_for_user());

CREATE POLICY "guest_own_reviews" ON reviews
  FOR ALL USING (guest_id = guest_id_for_user());

CREATE POLICY "guest_own_loyalty" ON guest_loyalty_profiles
  FOR SELECT USING (guest_id = guest_id_for_user());

CREATE POLICY "guest_own_rewards" ON guest_rewards
  FOR SELECT USING (guest_id = guest_id_for_user());
