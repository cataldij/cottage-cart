-- ============================================================================
-- CottageCart Platform Schema
-- A marketplace for cottage food businesses: home bakeries, chocolatiers,
-- hot sauce makers, food trucks, jams & preserves, and specialty food vendors.
-- ============================================================================

-- ============================================================================
-- 1. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. SHOPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'bakery'
    CHECK (category IN ('bakery', 'chocolatier', 'hot_sauce', 'food_truck', 'jams_preserves', 'specialty', 'other')),

  -- Location
  location_name TEXT,
  location_address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Links
  website_url TEXT,

  -- Ordering & Fulfillment
  pickup_instructions TEXT,
  delivery_available BOOLEAN DEFAULT false,
  delivery_radius DECIMAL(5,2),
  delivery_fee DECIMAL(8,2),
  is_public BOOLEAN DEFAULT true,
  accepting_orders BOOLEAN DEFAULT true,
  requires_preorder BOOLEAN DEFAULT true,
  order_button_text TEXT DEFAULT 'Pre-Order Now',

  -- Branding: Core
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  text_color TEXT,
  heading_color TEXT,
  nav_background_color TEXT,
  nav_text_color TEXT,
  button_color TEXT,
  button_text_color TEXT,

  -- Branding: App-specific buttons
  app_button_style TEXT,
  app_button_color TEXT,
  app_button_text_color TEXT,

  -- Branding: Typography
  font_heading TEXT,
  font_body TEXT,

  -- Branding: Hero section
  hero_height TEXT,
  hero_style TEXT,
  hero_background_url TEXT,
  hero_video_url TEXT,
  hero_overlay_opacity TEXT,

  -- Branding: Background (website)
  background_pattern TEXT,
  background_pattern_color TEXT,
  background_gradient_start TEXT,
  background_gradient_end TEXT,
  background_image_url TEXT,
  background_image_overlay TEXT,

  -- Branding: Background (app)
  app_background_pattern TEXT,
  app_background_pattern_color TEXT,
  app_background_gradient_start TEXT,
  app_background_gradient_end TEXT,
  app_background_image_url TEXT,
  app_background_image_overlay TEXT,

  -- Branding: App layout
  app_icon_theme TEXT,
  app_tile_size TEXT,
  app_tile_columns TEXT,
  app_tile_layout TEXT,
  app_tile_gap TEXT,

  -- Footer & Social
  footer_text TEXT,
  terms_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,

  -- Advanced
  custom_css TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. PRODUCT CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES product_categories(id),
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  allergens TEXT[],
  dietary_tags TEXT[],
  preparation_time TEXT,
  max_quantity INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'ready', 'picked_up', 'cancelled')),
  pickup_date DATE,
  pickup_time TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  is_delivery BOOLEAN DEFAULT false,
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT
);

-- ============================================================================
-- 7. SHOP HOURS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  is_pickup_only BOOLEAN DEFAULT true,
  UNIQUE(shop_id, day_of_week)
);

-- ============================================================================
-- 8. SHOP DESIGN TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_design_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  tokens JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 9. REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES shop_orders(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 10. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);
CREATE INDEX IF NOT EXISTS idx_shops_created_by ON shops(created_by);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_shop_id ON shop_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_customer_id ON shop_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_shop_id ON product_categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order_id ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_hours_shop_id ON shop_hours(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop_id ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_shop_design_tokens_shop_id ON shop_design_tokens(shop_id);

-- ============================================================================
-- 11. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_shop_orders_updated_at
  BEFORE UPDATE ON shop_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_shop_design_tokens_updated_at
  BEFORE UPDATE ON shop_design_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_design_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- SHOPS POLICIES
-- --------------------------------------------------------------------------

-- Anyone can read public shops
CREATE POLICY shops_select_public ON shops
  FOR SELECT
  USING (is_public = true);

-- Owners can read their own shops (including non-public)
CREATE POLICY shops_select_own ON shops
  FOR SELECT
  USING (auth.uid() = created_by);

-- Authenticated users can create shops
CREATE POLICY shops_insert ON shops
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Owners can update their own shops
CREATE POLICY shops_update ON shops
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Owners can delete their own shops
CREATE POLICY shops_delete ON shops
  FOR DELETE
  USING (auth.uid() = created_by);

-- --------------------------------------------------------------------------
-- PRODUCTS POLICIES
-- --------------------------------------------------------------------------

-- Anyone can read products of public shops
CREATE POLICY products_select_public ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.is_public = true
    )
  );

-- Shop owners can read all their products
CREATE POLICY products_select_own ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can insert products
CREATE POLICY products_insert ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can update their products
CREATE POLICY products_update ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can delete their products
CREATE POLICY products_delete ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- PRODUCT CATEGORIES POLICIES
-- --------------------------------------------------------------------------

-- Anyone can read categories of public shops
CREATE POLICY product_categories_select_public ON product_categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = product_categories.shop_id
        AND shops.is_public = true
    )
  );

-- Shop owners can read all their categories
CREATE POLICY product_categories_select_own ON product_categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = product_categories.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can insert categories
CREATE POLICY product_categories_insert ON product_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = product_categories.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can update their categories
CREATE POLICY product_categories_update ON product_categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = product_categories.shop_id
        AND shops.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = product_categories.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can delete their categories
CREATE POLICY product_categories_delete ON product_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = product_categories.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- ORDERS POLICIES
-- --------------------------------------------------------------------------

-- Customers can read their own orders
CREATE POLICY shop_orders_select_customer ON shop_orders
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Shop owners can read orders for their shops
CREATE POLICY shop_orders_select_shop_owner ON shop_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_orders.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Authenticated users can create orders
CREATE POLICY shop_orders_insert ON shop_orders
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Shop owners can update order status
CREATE POLICY shop_orders_update_shop_owner ON shop_orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_orders.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Customers can cancel their own pending orders
CREATE POLICY shop_orders_update_customer ON shop_orders
  FOR UPDATE
  USING (auth.uid() = customer_id AND status = 'pending')
  WITH CHECK (auth.uid() = customer_id AND status = 'cancelled');

-- --------------------------------------------------------------------------
-- ORDER ITEMS POLICIES
-- --------------------------------------------------------------------------

-- Customers can read items for their own orders
CREATE POLICY shop_order_items_select_customer ON shop_order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shop_orders
      WHERE shop_orders.id = shop_order_items.order_id
        AND shop_orders.customer_id = auth.uid()
    )
  );

-- Shop owners can read items for orders at their shops
CREATE POLICY shop_order_items_select_shop_owner ON shop_order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shop_orders
      JOIN shops ON shops.id = shop_orders.shop_id
      WHERE shop_orders.id = shop_order_items.order_id
        AND shops.created_by = auth.uid()
    )
  );

-- Authenticated users can insert order items (when creating an order)
CREATE POLICY shop_order_items_insert ON shop_order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shop_orders
      WHERE shop_orders.id = shop_order_items.order_id
        AND shop_orders.customer_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- SHOP HOURS POLICIES
-- --------------------------------------------------------------------------

-- Anyone can read shop hours for public shops
CREATE POLICY shop_hours_select_public ON shop_hours
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
        AND shops.is_public = true
    )
  );

-- Shop owners can read their own hours
CREATE POLICY shop_hours_select_own ON shop_hours
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can insert hours
CREATE POLICY shop_hours_insert ON shop_hours
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can update their hours
CREATE POLICY shop_hours_update ON shop_hours
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
        AND shops.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can delete their hours
CREATE POLICY shop_hours_delete ON shop_hours
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- SHOP DESIGN TOKENS POLICIES
-- --------------------------------------------------------------------------

-- Anyone can read active design tokens for public shops
CREATE POLICY shop_design_tokens_select_public ON shop_design_tokens
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_design_tokens.shop_id
        AND shops.is_public = true
    )
  );

-- Shop owners can read all their design tokens
CREATE POLICY shop_design_tokens_select_own ON shop_design_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_design_tokens.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can insert design tokens
CREATE POLICY shop_design_tokens_insert ON shop_design_tokens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_design_tokens.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can update their design tokens
CREATE POLICY shop_design_tokens_update ON shop_design_tokens
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_design_tokens.shop_id
        AND shops.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_design_tokens.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- Shop owners can delete their design tokens
CREATE POLICY shop_design_tokens_delete ON shop_design_tokens
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_design_tokens.shop_id
        AND shops.created_by = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- REVIEWS POLICIES
-- --------------------------------------------------------------------------

-- Anyone can read reviews for public shops
CREATE POLICY reviews_select_public ON reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = reviews.shop_id
        AND shops.is_public = true
    )
  );

-- Customers can create reviews for orders they placed
CREATE POLICY reviews_insert ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM shop_orders
      WHERE shop_orders.id = reviews.order_id
        AND shop_orders.customer_id = auth.uid()
        AND shop_orders.status = 'picked_up'
    )
  );

-- ============================================================================
-- DONE
-- ============================================================================
