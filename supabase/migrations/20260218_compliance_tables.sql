-- ============================================================================
-- Maker's Market — Sprint 2: Compliance Engine
-- State-by-state cottage food compliance management
-- ============================================================================

-- ============================================================================
-- 1. STATE COMPLIANCE RULES (reference data, seeded below)
-- ============================================================================

CREATE TABLE IF NOT EXISTS state_compliance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code char(2) NOT NULL UNIQUE,
  state_name text NOT NULL,

  -- Revenue cap
  revenue_cap numeric,                    -- NULL = no cap
  revenue_cap_notes text,                 -- human-readable notes
  cap_tiers jsonb,                        -- [{name, limit, requirements}] for multi-tier states

  -- Permitted sales channels
  direct_to_consumer_only boolean DEFAULT true,
  wholesale_allowed boolean DEFAULT false,
  online_sales_allowed boolean DEFAULT false,
  farmers_market_allowed boolean DEFAULT true,
  -- Internet/mail order
  internet_sales_allowed boolean DEFAULT false,

  -- Registration / permits
  requires_registration boolean DEFAULT false,
  registration_fee numeric DEFAULT 0,
  registration_url text,
  registration_notes text,

  -- Food handler certification
  requires_food_handler_cert boolean DEFAULT false,
  cert_validity_years integer DEFAULT 2,

  -- Insurance
  requires_insurance boolean DEFAULT false,

  -- Food safety
  allows_tcs_foods boolean DEFAULT false,  -- Temperature-Controlled for Safety (meat, dairy, etc.)
  uses_prohibited_list boolean DEFAULT false, -- TX-style: allowed unless on prohibited list

  -- Foods
  allowed_foods_list jsonb,               -- [{category, items}]
  prohibited_foods_list jsonb,            -- [{category, items}]

  -- Label requirements
  home_kitchen_disclaimer text,           -- state-specific disclaimer wording
  labeling_requirements jsonb,            -- [{field, required, notes}]

  -- Meta
  additional_notes text,
  last_updated_at timestamptz DEFAULT now(),
  source_urls jsonb                       -- [{label, url}]
);

-- ============================================================================
-- 2. SHOP COMPLIANCE STATUS (per shop)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  state_code char(2) REFERENCES state_compliance_rules(state_code),

  -- Registration / permit
  registration_status text DEFAULT 'not_started'
    CHECK (registration_status IN ('not_started', 'in_progress', 'active', 'expired', 'not_required')),
  registration_number text,
  registration_expiry date,

  -- Food handler certification
  food_handler_status text DEFAULT 'not_started'
    CHECK (food_handler_status IN ('not_started', 'in_progress', 'active', 'expired', 'not_required')),
  food_handler_cert_number text,
  food_handler_expiry date,
  food_handler_provider text,

  -- Insurance
  insurance_status text DEFAULT 'none'
    CHECK (insurance_status IN ('none', 'active', 'expired', 'not_required')),
  insurance_provider text,
  insurance_policy_number text,
  insurance_expiry date,
  insurance_coverage_amount numeric,

  -- Uploaded documents (Supabase Storage paths)
  documents jsonb DEFAULT '[]',           -- [{type, name, path, uploaded_at, expiry}]

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id)
);

-- ============================================================================
-- 3. REVENUE TRACKING (monthly, for cap management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  fiscal_year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  revenue numeric NOT NULL DEFAULT 0,
  order_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, fiscal_year, month)
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shop_compliance_shop_id ON shop_compliance(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_compliance_state_code ON shop_compliance(state_code);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_shop_id ON revenue_tracking(shop_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_year ON revenue_tracking(shop_id, fiscal_year);

-- ============================================================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_shop_compliance_updated_at
  BEFORE UPDATE ON shop_compliance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_revenue_tracking_updated_at
  BEFORE UPDATE ON revenue_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE state_compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;

-- State rules are public read
CREATE POLICY state_compliance_rules_select ON state_compliance_rules
  FOR SELECT USING (true);

-- Shop compliance: owners only
CREATE POLICY shop_compliance_select ON shop_compliance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_compliance.shop_id AND shops.created_by = auth.uid())
  );
CREATE POLICY shop_compliance_insert ON shop_compliance
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_compliance.shop_id AND shops.created_by = auth.uid())
  );
CREATE POLICY shop_compliance_update ON shop_compliance
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_compliance.shop_id AND shops.created_by = auth.uid())
  );

-- Revenue tracking: owners only
CREATE POLICY revenue_tracking_select ON revenue_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = revenue_tracking.shop_id AND shops.created_by = auth.uid())
  );
CREATE POLICY revenue_tracking_insert ON revenue_tracking
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = revenue_tracking.shop_id AND shops.created_by = auth.uid())
  );
CREATE POLICY revenue_tracking_update ON revenue_tracking
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = revenue_tracking.shop_id AND shops.created_by = auth.uid())
  );

-- ============================================================================
-- 7. SEED: TOP 10 COTTAGE FOOD STATES
-- ============================================================================

INSERT INTO state_compliance_rules (
  state_code, state_name,
  revenue_cap, revenue_cap_notes, cap_tiers,
  direct_to_consumer_only, wholesale_allowed, online_sales_allowed,
  farmers_market_allowed, internet_sales_allowed,
  requires_registration, registration_fee, registration_url,
  requires_food_handler_cert, cert_validity_years,
  requires_insurance,
  allows_tcs_foods, uses_prohibited_list,
  allowed_foods_list, prohibited_foods_list,
  home_kitchen_disclaimer, labeling_requirements,
  additional_notes, source_urls
) VALUES

-- ── TEXAS ────────────────────────────────────────────────────────────────────
('TX', 'Texas',
 NULL, 'No annual revenue cap for Class A direct-to-consumer sales.',
 NULL,
 true, false, false, true, false,
 false, 0, NULL,
 false, 2,
 false,
 false, true,
 NULL,
 '[{"category":"Prohibited Foods","items":["Raw oysters","Raw clams","Raw quail eggs","Meat/poultry (raw or cooked)","Fish or shellfish","Garlic-in-oil without acidification","Foods requiring refrigeration (TCS foods)"]}]'::jsonb,
 'This food is made in a home kitchen and is not inspected by the Department of State Health Services or a local health department.',
 '[{"field":"Product name","required":true},{"field":"Name and address of producer","required":true},{"field":"Ingredients list","required":true},{"field":"Net weight or volume","required":true},{"field":"Allergen statement","required":true},{"field":"Home kitchen disclaimer","required":true}]'::jsonb,
 'Texas has one of the most permissive cottage food laws in the country. Sales are allowed at farmers markets, roadside stands, home delivery, and direct to consumer. No permit or license required. Allowed foods are everything NOT on the prohibited list.',
 '[{"label":"Texas DSHS Cottage Food","url":"https://www.dshs.texas.gov/cottage-food"}]'::jsonb),

-- ── FLORIDA ──────────────────────────────────────────────────────────────────
('FL', 'Florida',
 250000, 'Gross annual sales cap of $250,000. Cottage food businesses grossing over $50,000 must obtain a cottage food permit.',
 '[{"name":"Under $50K","limit":50000,"requirements":"No permit required"},{"name":"$50K–$250K","limit":250000,"requirements":"Cottage food permit required"}]'::jsonb,
 true, false, false, true, false,
 false, 0, 'https://www.fdacs.gov/Business-Services/Cottage-Food',
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods (non-hazardous)","Candy and confections","Jams, jellies, preserves (high-acid)","Fruit butters","Honey","Dried herbs and spices","Cereal, granola, trail mix","Dried fruit","Roasted nuts","Chocolate-covered non-perishables","Popcorn and popcorn balls","Canned pickles (high-acid)","Vinegar and flavored vinegars"]}]'::jsonb,
 NULL,
 'Made in a cottage food operation that is not subject to Florida''s food safety regulations.',
 '[{"field":"Product name","required":true},{"field":"Name and address of cottage food operation","required":true},{"field":"Ingredients list (in descending order by weight)","required":true},{"field":"Net weight or volume","required":true},{"field":"Allergen statement","required":true},{"field":"Disclaimer statement","required":true}]'::jsonb,
 'Must be sold direct to consumer. Internet sales allowed only if customer picks up in person. No sales to stores, restaurants, or for resale.',
 '[{"label":"Florida DACS Cottage Food","url":"https://www.fdacs.gov/Business-Services/Cottage-Food"}]'::jsonb),

-- ── CALIFORNIA ───────────────────────────────────────────────────────────────
('CA', 'California',
 75000, 'Class A: $75,000 gross annual sales, direct to consumer only from home. Class B: $75,000, additional venues allowed with permit.',
 '[{"name":"Class A","limit":75000,"requirements":"No permit. Must sell from home only."},{"name":"Class B","limit":75000,"requirements":"County permit required. Can sell at additional venues."}]'::jsonb,
 true, false, false, true, false,
 false, 0, 'https://cdph.ca.gov/Programs/CEH/DRSEM/Pages/CFO.aspx',
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Chocolate","Jams and preserves","Dried goods","Roasted coffee","Dried pasta","Vinegar","Pickled vegetables (high-acid)","Fruit butter","Granola","Dried herbs","Honey"]}]'::jsonb,
 NULL,
 'MADE IN A HOME KITCHEN.',
 '[{"field":"Product name","required":true},{"field":"Name and address of cottage food operation","required":true},{"field":"Date product was processed","required":true},{"field":"Ingredients list","required":true},{"field":"Net weight or volume","required":true},{"field":"Allergen statement","required":true},{"field":" MADE IN A HOME KITCHEN statement","required":true}]'::jsonb,
 'California Class A requires no permit but limits to home-only sales. Class B allows farmers markets and other venues with a county permit. No internet or mail order sales.',
 '[{"label":"CA CDPH Cottage Food Operations","url":"https://cdph.ca.gov/Programs/CEH/DRSEM/Pages/CFO.aspx"}]'::jsonb),

-- ── UTAH ─────────────────────────────────────────────────────────────────────
('UT', 'Utah',
 NULL, 'No annual revenue cap.',
 NULL,
 true, false, true, true, true,
 false, 0, NULL,
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Chocolate","Jams and preserves","Dried goods","Roasted nuts","Granola","Dried fruit","Spices","Vinegar","Honey","Pickled vegetables (high-acid)","Popcorn","Cereals","Pasta (dried)"]}]'::jsonb,
 NULL,
 'Made in a home kitchen not inspected by the state or local health department.',
 '[{"field":"Product name","required":true},{"field":"Name and address of producer","required":true},{"field":"Ingredients","required":true},{"field":"Net weight","required":true},{"field":"Allergen statement","required":true},{"field":"Home kitchen disclaimer","required":true}]'::jsonb,
 'Utah has very permissive cottage food laws with no revenue cap. Internet and mail-order sales are allowed. No permit required.',
 '[{"label":"Utah Cottage Food Law","url":"https://le.utah.gov/xcode/Title4/Chapter5/4-5.html"}]'::jsonb),

-- ── WYOMING ──────────────────────────────────────────────────────────────────
('WY', 'Wyoming',
 NULL, 'No annual revenue cap.',
 NULL,
 true, false, false, true, false,
 false, 0, NULL,
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Jams, jellies, preserves","Dried goods","Roasted nuts","Honey","Granola","Dried fruit","Spices","Vinegar"]}]'::jsonb,
 NULL,
 'Homemade food — not inspected by the Wyoming Department of Agriculture.',
 '[{"field":"Product name","required":true},{"field":"Producer name and address","required":true},{"field":"Ingredients","required":true},{"field":"Net weight","required":true},{"field":"Allergen statement","required":true},{"field":"Disclaimer","required":true}]'::jsonb,
 'Wyoming has no revenue cap and no permit requirement for most cottage foods sold direct-to-consumer.',
 '[{"label":"Wyoming Dept of Agriculture","url":"https://agriculture.wy.gov"}]'::jsonb),

-- ── COLORADO ─────────────────────────────────────────────────────────────────
('CO', 'Colorado',
 NULL, 'No annual revenue cap for direct-to-consumer sales.',
 NULL,
 true, false, false, true, false,
 false, 0, NULL,
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Jams and preserves","Dried goods","Granola","Dried fruit","Honey","Vinegar","Dried pasta","Roasted nuts","Spices","Popcorn"]}]'::jsonb,
 NULL,
 'Produced in a residential kitchen that has not been inspected.',
 '[{"field":"Product name","required":true},{"field":"Producer name and address","required":true},{"field":"Ingredients (descending by weight)","required":true},{"field":"Net weight or volume","required":true},{"field":"Allergen statement","required":true},{"field":"Non-inspected kitchen disclaimer","required":true}]'::jsonb,
 'Colorado allows direct-to-consumer cottage food sales with no revenue cap and no permit required. Cannot sell to retail stores.',
 '[{"label":"Colorado Dept of Public Health","url":"https://cdphe.colorado.gov"}]'::jsonb),

-- ── MICHIGAN ─────────────────────────────────────────────────────────────────
('MI', 'Michigan',
 25000, 'Gross annual sales cap of $25,000.',
 NULL,
 true, false, false, true, false,
 false, 0, NULL,
 true, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Jams, jellies, preserves (high-acid)","Dried herbs and spices","Roasted nuts","Granola","Dried fruit","Honey","Vinegar","Popcorn","Cereal and trail mix"]}]'::jsonb,
 NULL,
 'Made in a home kitchen that has not been inspected by the Michigan Department of Agriculture and Rural Development.',
 '[{"field":"Product name","required":true},{"field":"Producer name and address","required":true},{"field":"Ingredients","required":true},{"field":"Net weight","required":true},{"field":"Allergen statement","required":true},{"field":"Non-inspected disclaimer","required":true}]'::jsonb,
 'Michigan requires a food handler certificate. Sales cap is $25,000 gross annually. Must sell direct to consumer.',
 '[{"label":"Michigan MDARD Cottage Food","url":"https://www.michigan.gov/mdard/about/boards-comittees/cottage-food"}]'::jsonb),

-- ── OHIO ─────────────────────────────────────────────────────────────────────
('OH', 'Ohio',
 35000, 'Gross annual sales cap of $35,000.',
 NULL,
 true, false, false, true, false,
 false, 0, NULL,
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Jams, jellies, preserves (high-acid)","Granola","Dried herbs","Roasted nuts","Honey","Popcorn","Trail mix","Dried fruit","Vinegar"]}]'::jsonb,
 NULL,
 'This product is home produced and the production facility is not required to be licensed under Ohio''s cottage food law.',
 '[{"field":"Product name","required":true},{"field":"Producer name and address","required":true},{"field":"Ingredients","required":true},{"field":"Net weight","required":true},{"field":"Allergen statement","required":true},{"field":"Home-produced disclaimer","required":true}]'::jsonb,
 'Ohio allows direct-to-consumer cottage food sales up to $35,000 per year. No permit required. Must label products properly.',
 '[{"label":"Ohio Dept of Agriculture Cottage Foods","url":"https://agri.ohio.gov/divisions/food-safety/cottage-food"}]'::jsonb),

-- ── NORTH CAROLINA ───────────────────────────────────────────────────────────
('NC', 'North Carolina',
 20000, 'Gross annual sales cap of $20,000.',
 NULL,
 true, false, false, true, false,
 false, 0, NULL,
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Jams, jellies, preserves (high-acid)","Honey","Dried herbs","Granola","Dried fruit","Roasted nuts","Popcorn","Vinegar"]}]'::jsonb,
 NULL,
 'This product was made in a home kitchen that is not inspected by the NC Department of Agriculture & Consumer Services.',
 '[{"field":"Product name","required":true},{"field":"Producer name and address","required":true},{"field":"Ingredients","required":true},{"field":"Net weight","required":true},{"field":"Allergen statement","required":true},{"field":"Home kitchen disclaimer","required":true}]'::jsonb,
 'North Carolina limits cottage food sales to $20,000 gross per year. Sales must be direct to the consumer. Must be labeled with a home kitchen disclaimer.',
 '[{"label":"NC DACS Cottage Food","url":"https://www.ncagr.gov/fooddrug/food/cottage.htm"}]'::jsonb),

-- ── VIRGINIA ─────────────────────────────────────────────────────────────────
('VA', 'Virginia',
 NULL, 'No annual revenue cap. However, some localities may impose limits. Previously had a $3,500/year cap which was removed in 2022.',
 NULL,
 true, false, false, true, false,
 false, 0, NULL,
 false, 2,
 false,
 false, false,
 '[{"category":"Allowed Foods","items":["Baked goods","Candy","Jams, jellies, preserves","Honey","Dried herbs","Granola","Dried fruit","Nuts","Popcorn","Vinegar","Pickles (high-acid)"]}]'::jsonb,
 NULL,
 'This product was made in a home kitchen that may not meet all state requirements for commercial food production.',
 '[{"field":"Product name","required":true},{"field":"Producer name and address","required":true},{"field":"Ingredients","required":true},{"field":"Net weight","required":true},{"field":"Allergen statement","required":true}]'::jsonb,
 'Virginia removed its $3,500 cap in 2022. Cottage food can now be sold without a revenue limit. Internet sales allowed with in-person pickup. No permit required.',
 '[{"label":"Virginia Dept of Agriculture","url":"https://www.vdacs.virginia.gov/food-safety-cottage-food.shtml"}]'::jsonb);

-- ============================================================================
-- DONE
-- ============================================================================
