-- Sprint 7: Production planning and ingredient price alerts
-- Migration: 20260301_production_planning.sql

-- ============================================================
-- Production plans (saved production forecasts)
-- ============================================================
CREATE TABLE IF NOT EXISTS production_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  predicted_demand integer DEFAULT 0,
  planned_quantity integer DEFAULT 0,
  actual_sold integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, plan_date, product_name)
);

ALTER TABLE production_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their production plans"
  ON production_plans FOR ALL
  USING (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()));

-- ============================================================
-- Ingredient price alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS ingredient_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  alert_type text NOT NULL DEFAULT 'price_increase', -- price_increase, price_decrease, out_of_stock
  previous_price numeric,
  current_price numeric,
  change_percent numeric,
  unit text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ingredient_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their ingredient alerts"
  ON ingredient_alerts FOR ALL
  USING (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()));

-- ============================================================
-- Saved recipes from the scaler (linked to shop)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_scaled_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  scale_factor numeric NOT NULL DEFAULT 1,
  original_yield integer NOT NULL,
  scaled_yield integer NOT NULL,
  yield_unit text NOT NULL DEFAULT 'pieces',
  ingredients jsonb NOT NULL DEFAULT '[]',
  original_cost numeric,
  scaled_cost numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_scaled_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their saved scaled recipes"
  ON saved_scaled_recipes FOR ALL
  USING (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM shops WHERE created_by = auth.uid()));
