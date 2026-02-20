-- ============================================================================
-- Recipe Costing & Pricing Intelligence
-- Enables vendors to cost recipes, track ingredient prices, and get
-- AI-powered pricing recommendations with competitive market data.
-- ============================================================================

-- ============================================================================
-- 1. RECIPES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  batch_yield INTEGER NOT NULL DEFAULT 1,
  yield_unit TEXT NOT NULL DEFAULT 'pieces',

  -- Calculated costs (updated when ingredients change)
  total_ingredient_cost DECIMAL(10,2) DEFAULT 0,
  packaging_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  overhead_cost DECIMAL(10,2) DEFAULT 0,
  total_cost_per_batch DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,4) DEFAULT 0,

  -- Pricing
  suggested_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  margin_percent DECIMAL(5,2),

  -- Market data (populated by AI)
  market_price_low DECIMAL(10,2),
  market_price_high DECIMAL(10,2),
  market_price_avg DECIMAL(10,2),

  -- AI analysis (full JSON response from pricing advisor)
  ai_analysis JSONB,
  ai_analyzed_at TIMESTAMPTZ,

  -- Link to product (if listed in shop)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Metadata
  category TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. RECIPE INGREDIENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- What ingredient
  name TEXT NOT NULL,

  -- How much the recipe uses
  quantity DECIMAL(10,4) NOT NULL,
  unit TEXT NOT NULL,

  -- What the baker paid (package level)
  package_size DECIMAL(10,4),
  package_unit TEXT,
  package_price DECIMAL(10,2),

  -- Calculated cost for this recipe
  cost_in_recipe DECIMAL(10,4) DEFAULT 0,

  -- If price was estimated by AI vs entered by user
  is_estimated BOOLEAN DEFAULT false,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. INGREDIENT PRICE REFERENCE TABLE
-- (Crowdsourced / AI-populated average grocery prices by region)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingredient_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT,

  -- Price info
  avg_price DECIMAL(10,2) NOT NULL,
  unit_size DECIMAL(10,4) NOT NULL,
  unit TEXT NOT NULL,

  -- Region
  state TEXT,
  region TEXT,

  -- Source tracking
  source TEXT DEFAULT 'ai_estimate',
  sample_count INTEGER DEFAULT 1,

  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. MARKET PRICE DATA TABLE
-- (What similar products sell for in the market)
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_price_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_category TEXT NOT NULL,
  product_name TEXT NOT NULL,

  -- Price range
  price_low DECIMAL(10,2),
  price_high DECIMAL(10,2),
  price_avg DECIMAL(10,2),
  price_unit TEXT DEFAULT 'each',

  -- Context
  channel TEXT,
  state TEXT,
  region TEXT,

  -- Source
  source TEXT DEFAULT 'ai_research',
  source_url TEXT,
  sample_count INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_recipes_shop_id ON recipes(shop_id);
CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_prices_normalized ON ingredient_prices(normalized_name);
CREATE INDEX IF NOT EXISTS idx_ingredient_prices_state ON ingredient_prices(state);
CREATE INDEX IF NOT EXISTS idx_market_price_category ON market_price_data(product_category);
CREATE INDEX IF NOT EXISTS idx_market_price_state ON market_price_data(state);

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

CREATE TRIGGER set_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_price_data ENABLE ROW LEVEL SECURITY;

-- Recipes: only shop owner can CRUD
CREATE POLICY recipes_select_own ON recipes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = recipes.shop_id
        AND shops.created_by = auth.uid()
    )
  );

CREATE POLICY recipes_insert ON recipes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = recipes.shop_id
        AND shops.created_by = auth.uid()
    )
  );

CREATE POLICY recipes_update ON recipes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = recipes.shop_id
        AND shops.created_by = auth.uid()
    )
  );

CREATE POLICY recipes_delete ON recipes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = recipes.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Recipe ingredients: accessible if you own the recipe's shop
CREATE POLICY recipe_ingredients_select ON recipe_ingredients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      JOIN shops ON shops.id = recipes.shop_id
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND shops.created_by = auth.uid()
    )
  );

CREATE POLICY recipe_ingredients_insert ON recipe_ingredients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      JOIN shops ON shops.id = recipes.shop_id
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND shops.created_by = auth.uid()
    )
  );

CREATE POLICY recipe_ingredients_update ON recipe_ingredients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      JOIN shops ON shops.id = recipes.shop_id
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND shops.created_by = auth.uid()
    )
  );

CREATE POLICY recipe_ingredients_delete ON recipe_ingredients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      JOIN shops ON shops.id = recipes.shop_id
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND shops.created_by = auth.uid()
    )
  );

-- Ingredient prices: readable by all authenticated users (reference data)
CREATE POLICY ingredient_prices_select ON ingredient_prices
  FOR SELECT
  USING (true);

-- Market price data: readable by all authenticated users (reference data)
CREATE POLICY market_price_data_select ON market_price_data
  FOR SELECT
  USING (true);

-- ============================================================================
-- DONE
-- ============================================================================
