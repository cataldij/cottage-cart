-- Conference Customization Fields
-- Adds comprehensive branding and customization options for conferences

-- ============================================
-- VISUAL/BRANDING CUSTOMIZATIONS
-- ============================================

-- Color scheme
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1e40af';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#f59e0b';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS background_gradient_start TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS background_gradient_end TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#1f2937';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS heading_color TEXT DEFAULT '#111827';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS nav_background_color TEXT DEFAULT '#ffffff';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS nav_text_color TEXT DEFAULT '#374151';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS button_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS button_text_color TEXT DEFAULT '#ffffff';

-- Typography
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'Inter';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'Inter';

-- Images
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS og_image_url TEXT; -- Social share image
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS default_session_image_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS default_speaker_image_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS hero_background_url TEXT; -- Separate from banner for more control
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS hero_overlay_opacity DECIMAL(3,2) DEFAULT 0.3;

-- Theme preset
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS theme_preset TEXT DEFAULT 'default';
-- Values: 'default', 'professional', 'vibrant', 'dark', 'minimal', 'tech', 'creative', 'elegant'

-- Dark mode
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS dark_mode_enabled BOOLEAN DEFAULT false;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS dark_background_color TEXT DEFAULT '#0f172a';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS dark_text_color TEXT DEFAULT '#f1f5f9';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS dark_nav_background_color TEXT DEFAULT '#1e293b';

-- ============================================
-- LAYOUT CUSTOMIZATIONS
-- ============================================

-- Hero section
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS hero_style TEXT DEFAULT 'full';
-- Values: 'full', 'split', 'minimal', 'centered', 'video'
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS hero_height TEXT DEFAULT 'medium';
-- Values: 'small', 'medium', 'large', 'full'

-- Homepage sections (JSON array with order and visibility)
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS homepage_sections JSONB DEFAULT '[
  {"id": "about", "visible": true, "order": 1},
  {"id": "stats", "visible": true, "order": 2},
  {"id": "featured_sessions", "visible": true, "order": 3},
  {"id": "speakers", "visible": true, "order": 4},
  {"id": "sponsors", "visible": true, "order": 5},
  {"id": "cta", "visible": true, "order": 6}
]'::jsonb;

-- Navigation
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS nav_items JSONB DEFAULT '[
  {"id": "overview", "label": "Overview", "visible": true, "order": 1},
  {"id": "agenda", "label": "Agenda", "visible": true, "order": 2},
  {"id": "speakers", "label": "Speakers", "visible": true, "order": 3},
  {"id": "sponsors", "label": "Sponsors", "visible": true, "order": 4},
  {"id": "attendees", "label": "Attendees", "visible": true, "order": 5}
]'::jsonb;

-- Custom nav links
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS custom_nav_links JSONB DEFAULT '[]'::jsonb;
-- Format: [{"label": "Venue Info", "url": "https://...", "external": true}]

-- ============================================
-- FOOTER & SOCIAL
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS footer_text TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS footer_logo_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS privacy_policy_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS terms_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS code_of_conduct_url TEXT;

-- Social links
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_youtube TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_discord TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS social_slack TEXT;

-- ============================================
-- FEATURE TOGGLES
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_networking BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_attendee_directory BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_session_qa BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_live_polls BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_chat BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_session_ratings BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_certificates BOOLEAN DEFAULT false;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_virtual_badges BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_meeting_requests BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_sponsor_booths BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_live_stream BOOLEAN DEFAULT false;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS feature_recordings BOOLEAN DEFAULT true;

-- ============================================
-- REGISTRATION CUSTOMIZATION
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS registration_headline TEXT DEFAULT 'Join Us';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS registration_description TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS registration_button_text TEXT DEFAULT 'Register Now';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS registration_success_message TEXT DEFAULT 'You''re registered! Check your email for confirmation.';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS registration_closed_message TEXT DEFAULT 'Registration is currently closed.';

-- Custom registration fields (JSON array)
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS custom_registration_fields JSONB DEFAULT '[]'::jsonb;
-- Format: [{"id": "dietary", "label": "Dietary Requirements", "type": "select", "options": ["None", "Vegetarian", "Vegan"], "required": false}]

-- ============================================
-- BADGE CUSTOMIZATION
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_template TEXT DEFAULT 'standard';
-- Values: 'standard', 'minimal', 'professional', 'creative', 'photo'
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_background_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_text_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_accent_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_show_company BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_show_title BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_show_photo BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_show_qr BOOLEAN DEFAULT true;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS badge_custom_field TEXT; -- Additional field to show

-- ============================================
-- EMAIL CUSTOMIZATION
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS email_header_logo_url TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS email_header_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS email_footer_text TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS email_welcome_subject TEXT DEFAULT 'Welcome to {{conference_name}}!';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS email_welcome_body TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS email_reminder_subject TEXT DEFAULT 'Reminder: {{conference_name}} starts soon!';
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS email_reminder_body TEXT;

-- ============================================
-- SEO & ANALYTICS
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS google_analytics_id TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT;

-- ============================================
-- MOBILE APP CUSTOMIZATION
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS mobile_splash_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS mobile_icon_background_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS mobile_status_bar_style TEXT DEFAULT 'light';
-- Values: 'light', 'dark'
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS mobile_tab_bar_color TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS mobile_tab_bar_active_color TEXT;

-- ============================================
-- CUSTOM CSS (Advanced)
-- ============================================

ALTER TABLE conferences ADD COLUMN IF NOT EXISTS custom_css TEXT;
-- Allows advanced users to inject custom CSS

-- ============================================
-- THEME PRESETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS theme_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),

  -- All theme values
  primary_color TEXT NOT NULL,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  background_gradient_start TEXT,
  background_gradient_end TEXT,
  text_color TEXT,
  heading_color TEXT,
  nav_background_color TEXT,
  nav_text_color TEXT,
  button_color TEXT,
  button_text_color TEXT,
  font_heading TEXT,
  font_body TEXT,
  hero_style TEXT,
  hero_overlay_opacity DECIMAL(3,2),

  -- Dark mode variants
  dark_background_color TEXT,
  dark_text_color TEXT,
  dark_nav_background_color TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default theme presets
INSERT INTO theme_presets (name, slug, description, primary_color, secondary_color, accent_color, background_color, text_color, heading_color, font_heading, font_body, hero_style, hero_overlay_opacity)
VALUES
  ('Default', 'default', 'Clean and professional default theme', '#2563eb', '#1e40af', '#f59e0b', '#ffffff', '#1f2937', '#111827', 'Inter', 'Inter', 'full', 0.3),
  ('Professional', 'professional', 'Sleek corporate look with navy and gold', '#1e3a5f', '#0f2942', '#c4a35a', '#f8fafc', '#334155', '#0f172a', 'Playfair Display', 'Source Sans Pro', 'full', 0.4),
  ('Vibrant', 'vibrant', 'Bold and colorful for creative events', '#8b5cf6', '#7c3aed', '#f472b6', '#faf5ff', '#581c87', '#3b0764', 'Poppins', 'Poppins', 'full', 0.25),
  ('Dark Mode', 'dark', 'Modern dark theme for tech events', '#6366f1', '#818cf8', '#22d3ee', '#0f172a', '#e2e8f0', '#f8fafc', 'Space Grotesk', 'Inter', 'full', 0.5),
  ('Minimal', 'minimal', 'Clean and understated elegance', '#18181b', '#27272a', '#a1a1aa', '#fafafa', '#3f3f46', '#18181b', 'DM Sans', 'DM Sans', 'minimal', 0.2),
  ('Tech', 'tech', 'Futuristic tech conference look', '#00d9ff', '#0891b2', '#10b981', '#0c1222', '#94a3b8', '#f1f5f9', 'JetBrains Mono', 'Inter', 'full', 0.6),
  ('Creative', 'creative', 'Artistic and expressive design', '#ec4899', '#db2777', '#fbbf24', '#fdf2f8', '#831843', '#500724', 'Outfit', 'Outfit', 'split', 0.3),
  ('Elegant', 'elegant', 'Sophisticated and luxurious feel', '#78350f', '#92400e', '#d4af37', '#fffbeb', '#451a03', '#1c0a00', 'Cormorant Garamond', 'Lora', 'centered', 0.35)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on theme_presets
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Anyone can view public presets
CREATE POLICY "Anyone can view public theme presets"
  ON theme_presets FOR SELECT
  USING (is_public = true);

-- Creators can manage their own presets
CREATE POLICY "Users can manage their own theme presets"
  ON theme_presets FOR ALL
  USING (created_by = auth.uid());

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_conferences_theme_preset ON conferences(theme_preset);
CREATE INDEX IF NOT EXISTS idx_theme_presets_slug ON theme_presets(slug);
