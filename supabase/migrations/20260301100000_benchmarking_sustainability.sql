-- Sprint 8: Peer benchmarking and sustainability scoring
-- Migration: 20260301_benchmarking_sustainability.sql

-- ============================================================
-- Anonymous peer benchmarking data (aggregated, no PII)
-- ============================================================
CREATE TABLE IF NOT EXISTS benchmark_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  snapshot_month integer NOT NULL, -- 1-12
  snapshot_year integer NOT NULL,
  state_code char(2),
  category text, -- bakery, jams, sauces, etc.
  total_revenue numeric DEFAULT 0,
  total_orders integer DEFAULT 0,
  avg_order_value numeric DEFAULT 0,
  product_count integer DEFAULT 0,
  avg_product_price numeric DEFAULT 0,
  top_product_category text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, snapshot_month, snapshot_year)
);

ALTER TABLE benchmark_snapshots ENABLE ROW LEVEL SECURITY;

-- Makers can only see their own snapshots (aggregates computed at read time)
CREATE POLICY "Shop owners can manage their benchmark snapshots"
  ON benchmark_snapshots FOR ALL
  USING (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()));

-- Read-only policy for anonymous aggregates (no shop_id exposed)
CREATE POLICY "Anyone can read aggregate benchmarks"
  ON benchmark_snapshots FOR SELECT
  USING (true);

-- ============================================================
-- Product sustainability scores
-- ============================================================
CREATE TABLE IF NOT EXISTS product_sustainability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  overall_score integer DEFAULT 0, -- 0-100
  local_sourcing_score integer DEFAULT 0, -- 0-100
  packaging_score integer DEFAULT 0, -- 0-100
  waste_score integer DEFAULT 0, -- 0-100
  energy_score integer DEFAULT 0, -- 0-100
  local_ingredients_pct integer DEFAULT 0,
  packaging_type text DEFAULT 'mixed', -- compostable, recyclable, reusable, mixed, plastic
  food_waste_pct integer DEFAULT 0, -- estimated waste percentage
  uses_renewable_energy boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, product_id)
);

ALTER TABLE product_sustainability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their sustainability scores"
  ON product_sustainability FOR ALL
  USING (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()));
