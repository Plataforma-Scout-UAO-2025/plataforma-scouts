-- Migration: Add Security Functions and Error Handling
-- Implements secure authentication helpers and proper error handling

-- Create secure authentication helper functions
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Improved get_current_user_tenant_id with error handling
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS INTEGER AS $$
DECLARE
    current_user_id UUID;
    tenant_id INTEGER;
BEGIN
    current_user_id := current_user_id();
    
    IF current_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    SELECT u.tenant_id INTO tenant_id
    FROM users u 
    WHERE u.user_id = current_user_id::int;
    
    RETURN tenant_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't expose details
        RAISE LOG 'Error in get_current_user_tenant_id: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is tenant admin
CREATE OR REPLACE FUNCTION is_tenant_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT platform_role INTO user_role
    FROM users 
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int;
    
    RETURN COALESCE(user_role = 'admin', FALSE);
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to audit sensitive operations
CREATE OR REPLACE FUNCTION audit_log(
    table_name TEXT,
    operation TEXT,
    old_values JSONB DEFAULT NULL,
    new_values JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        user_id,
        tenant_id,
        old_values,
        new_values,
        timestamp
    ) VALUES (
        table_name,
        operation,
        (current_setting('request.jwt.claims', true)::json->>'sub')::int,
        get_current_user_tenant_id(),
        old_values,
        new_values,
        NOW()
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the main operation if audit fails
        RAISE LOG 'Audit logging failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id INTEGER,
    tenant_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only tenant admins can view audit logs for their tenant
CREATE POLICY "Tenant admins can view audit logs" ON audit_log
    FOR SELECT TO authenticated
    USING (
        tenant_id = (SELECT get_current_user_tenant_id()) 
        AND (SELECT is_tenant_admin())
    );

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);

-- Function to safely get user preferences
CREATE OR REPLACE FUNCTION get_user_preference(pref_key TEXT, default_value TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT value INTO result
    FROM user_preferences 
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
    AND key = pref_key;
    
    RETURN COALESCE(result, default_value);
EXCEPTION
    WHEN OTHERS THEN
        RETURN default_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, key)
);

-- Enable RLS on user preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL TO authenticated
    USING ((current_setting('request.jwt.claims', true)::json->>'sub')::int = user_id);

-- Function to validate and sanitize user input
CREATE OR REPLACE FUNCTION sanitize_input(input_text TEXT, max_length INTEGER DEFAULT 255)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remove potentially dangerous characters and limit length
    RETURN LEFT(
        REGEXP_REPLACE(
            TRIM(input_text), 
            '[<>"\''&]', 
            '', 
            'g'
        ), 
        max_length
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check rate limits (simple implementation)
CREATE OR REPLACE FUNCTION check_rate_limit(
    action_type TEXT,
    limit_count INTEGER DEFAULT 100,
    time_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    current_user_id INTEGER;
BEGIN
    current_user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::int;
    
    SELECT COUNT(*)
    INTO current_count
    FROM rate_limit_log
    WHERE user_id = current_user_id
    AND action_type = action_type
    AND created_at > NOW() - INTERVAL '1 minute' * time_window_minutes;
    
    -- Log this action
    INSERT INTO rate_limit_log (user_id, action_type, created_at)
    VALUES (current_user_id, action_type, NOW());
    
    RETURN current_count < limit_count;
EXCEPTION
    WHEN OTHERS THEN
        -- Fail safe - allow the action if rate limiting fails
        RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create rate limit log table
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action_time 
ON rate_limit_log(user_id, action_type, created_at);

-- Cleanup function for rate limit logs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_logs()
RETURNS VOID AS $$
BEGIN
    DELETE FROM rate_limit_log 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON FUNCTION current_user_id() IS 'Safely retrieves current authenticated user ID';
COMMENT ON FUNCTION get_current_user_tenant_id() IS 'Improved tenant lookup with error handling';
COMMENT ON FUNCTION audit_log(TEXT, TEXT, JSONB, JSONB) IS 'Logs sensitive operations for audit trail';
COMMENT ON FUNCTION sanitize_input(TEXT, INTEGER) IS 'Sanitizes user input to prevent injection attacks';
COMMENT ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) IS 'Simple rate limiting for API actions';
COMMENT ON TABLE audit_log IS 'Stores audit trail for sensitive operations';
COMMENT ON TABLE user_preferences IS 'Stores user-specific application preferences';
COMMENT ON TABLE rate_limit_log IS 'Tracks API usage for rate limiting';