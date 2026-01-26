-- =============================================
-- ENHANCED SECURITY MIGRATION
-- Adds audit logging, rate limiting, validation, and additional protections
-- =============================================

-- =============================================
-- AUDIT LOGGING
-- =============================================

-- Audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Index for efficient audit queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (extend this based on your admin system)
CREATE POLICY "System admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    -- Add your admin check here
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE user_id = auth.uid()
      AND role = 'organizer'
    )
  );

-- Function to log sensitive operations
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_conferences
  AFTER INSERT OR UPDATE OR DELETE ON conferences
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_conference_members
  AFTER INSERT OR UPDATE OR DELETE ON conference_members
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- =============================================
-- RATE LIMITING (DATABASE LEVEL)
-- =============================================

-- Rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

-- Index for efficient rate limit queries
CREATE INDEX idx_rate_limits_identifier_action ON rate_limits(identifier, action, window_start DESC);

-- Cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rate limit check function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
BEGIN
  v_window_start := date_trunc('minute', now());

  SELECT COALESCE(SUM(count), 0) INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND window_start >= now() - (p_window_minutes || ' minutes')::interval;

  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;

  INSERT INTO rate_limits (identifier, action, window_start, count)
  VALUES (p_identifier, p_action, v_window_start, 1)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DATA VALIDATION FUNCTIONS
-- =============================================

-- Email validation
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- URL validation
CREATE OR REPLACE FUNCTION is_valid_url(url text)
RETURNS boolean AS $$
BEGIN
  RETURN url ~* '^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- UUID validation
CREATE OR REPLACE FUNCTION is_valid_uuid(val text)
RETURNS boolean AS $$
BEGIN
  RETURN val ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Sanitize HTML input (basic XSS prevention)
CREATE OR REPLACE FUNCTION sanitize_html(input text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(input, '<script[^>]*>.*?</script>', '', 'gi'),
    '<[^>]*>', '', 'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- ADDITIONAL CONSTRAINTS
-- =============================================

-- Add check constraints for data integrity
ALTER TABLE profiles
  ADD CONSTRAINT check_email_format CHECK (is_valid_email(email));

-- Prevent negative values
ALTER TABLE ticket_types
  ADD CONSTRAINT check_price_positive CHECK (price >= 0),
  ADD CONSTRAINT check_quantity_positive CHECK (quantity_available >= 0);

ALTER TABLE orders
  ADD CONSTRAINT check_total_positive CHECK (total_amount >= 0);

-- =============================================
-- PERFORMANCE INDEXES FOR RLS
-- =============================================

-- Indexes to speed up RLS policy checks
CREATE INDEX IF NOT EXISTS idx_conference_members_user_conference
  ON conference_members(user_id, conference_id);

CREATE INDEX IF NOT EXISTS idx_conference_members_conference_role
  ON conference_members(conference_id, role);

CREATE INDEX IF NOT EXISTS idx_sessions_conference
  ON sessions(conference_id);

CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_room
  ON chat_room_members(user_id, room_id);

CREATE INDEX IF NOT EXISTS idx_messages_room
  ON messages(room_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_conference
  ON announcements(conference_id, created_at DESC);

-- =============================================
-- SECURITY HELPER FUNCTIONS
-- =============================================

-- Check if user is conference organizer
CREATE OR REPLACE FUNCTION is_conference_organizer(
  p_user_id uuid,
  p_conference_id uuid
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conference_members
    WHERE user_id = p_user_id
      AND conference_id = p_conference_id
      AND role = 'organizer'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if user is conference member
CREATE OR REPLACE FUNCTION is_conference_member(
  p_user_id uuid,
  p_conference_id uuid
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conference_members
    WHERE user_id = p_user_id
      AND conference_id = p_conference_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get user's role in conference
CREATE OR REPLACE FUNCTION get_conference_role(
  p_user_id uuid,
  p_conference_id uuid
)
RETURNS text AS $$
  SELECT role FROM conference_members
  WHERE user_id = p_user_id
    AND conference_id = p_conference_id
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================
-- MISSING RLS POLICIES
-- =============================================

-- Add missing policies for announcements INSERT
CREATE POLICY "Organizers can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = announcements.conference_id
      AND user_id = auth.uid()
      AND role = 'organizer'
    )
  );

-- Add missing policies for speaker profiles
CREATE POLICY "Members can view speaker profiles"
  ON speaker_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM session_speakers ss
      JOIN sessions s ON s.id = ss.session_id
      JOIN conference_members cm ON cm.conference_id = s.conference_id
      WHERE ss.speaker_id = speaker_profiles.id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Speakers can update own profile"
  ON speaker_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organizers can manage speaker profiles"
  ON speaker_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM session_speakers ss
      JOIN sessions s ON s.id = ss.session_id
      JOIN conference_members cm ON cm.conference_id = s.conference_id
      WHERE ss.speaker_id = speaker_profiles.id
      AND cm.user_id = auth.uid()
      AND cm.role = 'organizer'
    )
  );

-- Add policy for session attendance
CREATE POLICY "Members can record attendance"
  ON session_attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM sessions s
      JOIN conference_members cm ON cm.conference_id = s.conference_id
      WHERE s.id = session_attendance.session_id
      AND cm.user_id = auth.uid()
    )
  );

-- Add policy for sponsor leads (organizers and sponsors only)
CREATE POLICY "Sponsors can view own leads"
  ON sponsor_leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsors sp
      JOIN conference_members cm ON cm.conference_id = sp.conference_id
      WHERE sp.id = sponsor_leads.sponsor_id
      AND cm.user_id = auth.uid()
      AND (cm.role = 'organizer' OR cm.role = 'sponsor')
    )
  );

-- =============================================
-- AUTOMATIC DATA SANITIZATION
-- =============================================

-- Sanitize user input in profiles
CREATE OR REPLACE FUNCTION sanitize_profile_bio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bio IS NOT NULL THEN
    NEW.bio := sanitize_html(NEW.bio);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_profile_bio_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sanitize_profile_bio();

-- =============================================
-- SESSION TIMEOUT AND SECURITY
-- =============================================

-- Function to check and enforce session timeouts
CREATE OR REPLACE FUNCTION check_session_validity()
RETURNS boolean AS $$
DECLARE
  v_last_activity timestamptz;
  v_timeout_minutes integer := 60; -- 60 minute timeout
BEGIN
  -- Get last activity from user metadata or similar
  -- This is a placeholder - implement based on your session management
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PREVENT SQL INJECTION IN DYNAMIC QUERIES
-- =============================================

-- Function to safely execute search queries
CREATE OR REPLACE FUNCTION safe_search_conferences(
  search_term text,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  start_date timestamptz,
  end_date timestamptz
) AS $$
BEGIN
  -- Use parameterized query to prevent SQL injection
  RETURN QUERY
  SELECT c.id, c.name, c.description, c.start_date, c.end_date
  FROM conferences c
  WHERE (c.is_public = true OR EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = c.id
      AND user_id = p_user_id
    ))
    AND (
      c.name ILIKE '%' || search_term || '%'
      OR c.description ILIKE '%' || search_term || '%'
    )
  ORDER BY c.start_date DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================
-- PASSWORD AND SENSITIVE DATA PROTECTION
-- =============================================

-- Ensure sensitive columns are never exposed via RLS
-- Note: Supabase auth.users table is already protected, but be careful with custom sensitive data

-- Function to hash/mask sensitive data in logs
CREATE OR REPLACE FUNCTION mask_sensitive_data(data jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb := data;
BEGIN
  -- Mask email addresses
  IF result ? 'email' THEN
    result := jsonb_set(result, '{email}', to_jsonb('***@***'));
  END IF;

  -- Mask phone numbers
  IF result ? 'phone' THEN
    result := jsonb_set(result, '{phone}', to_jsonb('***-***-****'));
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE audit_logs IS 'Tracks all sensitive operations for security auditing';
COMMENT ON TABLE rate_limits IS 'Database-level rate limiting to prevent abuse';
COMMENT ON FUNCTION check_rate_limit IS 'Validates request rate limits before allowing operations';
COMMENT ON FUNCTION sanitize_html IS 'Removes potentially dangerous HTML/script tags from user input';
COMMENT ON FUNCTION is_conference_organizer IS 'Helper to check if user has organizer role';
