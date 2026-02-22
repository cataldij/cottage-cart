-- Sprint 5: Customer management, loyalty/rewards, and revenue analytics
-- Migration: 20260222_customer_loyalty_tables.sql

-- ============================================================
-- Customer notes & favorites (augments order-derived customers)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  notes text,
  is_favorite boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, email)
);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their customer profiles"
  ON customer_profiles FOR ALL
  USING (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  );

-- ============================================================
-- Loyalty programs (one per shop)
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Rewards',
  type text NOT NULL DEFAULT 'points',  -- points, punch_card, spend_threshold
  points_per_dollar numeric DEFAULT 1,
  reward_threshold numeric DEFAULT 100,
  reward_description text DEFAULT '10% off your next order',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id)
);

ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their loyalty programs"
  ON loyalty_programs FOR ALL
  USING (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  );

-- ============================================================
-- Customer loyalty points tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_loyalty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  program_id uuid REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  points numeric DEFAULT 0,
  lifetime_points numeric DEFAULT 0,
  rewards_redeemed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, customer_email, program_id)
);

ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage customer loyalty"
  ON customer_loyalty FOR ALL
  USING (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  );

-- ============================================================
-- Message broadcasts (shop-wide announcements)
-- ============================================================
CREATE TABLE IF NOT EXISTS message_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'announcement', -- announcement, promotion, new_product, reminder
  sent_to_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their broadcasts"
  ON message_broadcasts FOR ALL
  USING (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  );

-- ============================================================
-- Message templates
-- ============================================================
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'custom', -- order_confirmation, ready_pickup, thank_you, custom
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their message templates"
  ON message_templates FOR ALL
  USING (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid())
  );

-- Seed default message templates (inserted per-shop on first use via app logic)
-- No global seeds needed here.
