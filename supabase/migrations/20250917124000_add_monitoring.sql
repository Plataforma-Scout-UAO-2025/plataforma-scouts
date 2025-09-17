-- Migration: Add Performance Monitoring and Optimization
-- Implements monitoring, additional indexes, and performance optimizations

-- Create performance monitoring views
CREATE OR REPLACE VIEW performance_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals::text as most_common_vals,
    most_common_freqs::text as most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Create slow query monitoring function
CREATE OR REPLACE FUNCTION log_slow_query(
    query_text TEXT,
    execution_time_ms NUMERIC,
    threshold_ms NUMERIC DEFAULT 1000
)
RETURNS VOID AS $$
BEGIN
    IF execution_time_ms > threshold_ms THEN
        INSERT INTO slow_query_log (
            query_text,
            execution_time_ms,
            user_id,
            tenant_id,
            created_at
        ) VALUES (
            LEFT(query_text, 2000), -- Truncate very long queries
            execution_time_ms,
            (current_setting('request.jwt.claims', true)::json->>'sub')::int,
            get_current_user_tenant_id(),
            NOW()
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail if logging fails
        NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create slow query log table
CREATE TABLE IF NOT EXISTS slow_query_log (
    id BIGSERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    execution_time_ms NUMERIC NOT NULL,
    user_id INTEGER,
    tenant_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_members_tenant_section_status 
ON members(tenant_id, current_section_id, member_status);

CREATE INDEX IF NOT EXISTS idx_events_tenant_date_status 
ON events(tenant_id, start_datetime, event_status);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant_member_date 
ON transactions(tenant_id, member_id, transaction_date);

CREATE INDEX IF NOT EXISTS idx_member_progress_tenant_member_status 
ON member_requirement_progress(tenant_id, member_id, status);

CREATE INDEX IF NOT EXISTS idx_authorizations_tenant_event_status 
ON authorizations(tenant_id, event_id, authorization_status);

CREATE INDEX IF NOT EXISTS idx_member_badges_tenant_member_date 
ON member_badges(tenant_id, member_id, date_awarded);

-- Partial indexes for common filtered queries
CREATE INDEX IF NOT EXISTS idx_members_active 
ON members(tenant_id, current_section_id) WHERE member_status = 'active';

CREATE INDEX IF NOT EXISTS idx_events_upcoming 
ON events(tenant_id, start_datetime) WHERE event_status IN ('planned', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_transactions_pending 
ON transactions(tenant_id, payment_status, transaction_date) WHERE payment_status = 'pending';

-- Note: Functional index on age removed due to IMMUTABLE requirement
-- Age calculations can be done in queries instead

-- Create materialized view for common dashboard queries
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    t.tenant_id,
    t.group_name,
    COUNT(DISTINCT m.member_id) as total_members,
    COUNT(DISTINCT m.member_id) FILTER (WHERE m.member_status = 'active') as active_members,
    COUNT(DISTINCT e.event_id) FILTER (WHERE e.start_datetime >= CURRENT_DATE - INTERVAL '30 days') as recent_events,
    SUM(tr.amount) FILTER (WHERE tr.transaction_date >= CURRENT_DATE - INTERVAL '30 days' AND tr.payment_status = 'paid') as monthly_income,
    COUNT(DISTINCT s.section_id) as total_sections,
    MAX(m.updated_at) as last_member_update,
    MAX(e.updated_at) as last_event_update
FROM tenants t
LEFT JOIN members m ON t.tenant_id = m.tenant_id
LEFT JOIN events e ON t.tenant_id = e.tenant_id  
LEFT JOIN transactions tr ON t.tenant_id = tr.tenant_id
LEFT JOIN sections s ON t.tenant_id = s.tenant_id
GROUP BY t.tenant_id, t.group_name;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_dashboard_stats_tenant ON dashboard_stats(tenant_id);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
    
    -- Log the refresh for monitoring
    INSERT INTO system_log (operation, details, created_at)
    VALUES ('dashboard_refresh', 'Dashboard stats refreshed', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create system log table
CREATE TABLE IF NOT EXISTS system_log (
    id BIGSERIAL PRIMARY KEY,
    operation TEXT NOT NULL,
    details TEXT,
    user_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to analyze table statistics
CREATE OR REPLACE FUNCTION analyze_table_stats(p_table_name TEXT)
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    last_vacuum TIMESTAMP,
    last_analyze TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        c.reltuples::BIGINT as row_count,
        pg_size_pretty(pg_relation_size(c.oid)) as table_size,
        pg_size_pretty(pg_indexes_size(c.oid)) as index_size,
        pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
        s.last_vacuum,
        s.last_analyze
    FROM information_schema.tables t
    JOIN pg_class c ON c.relname = t.table_name
    JOIN pg_stat_user_tables s ON s.relname = t.table_name
    WHERE t.table_schema = 'public'
    AND (t.table_name = p_table_name OR p_table_name IS NULL)
    ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE(
    schema_name TEXT,
    table_name TEXT,
    index_name TEXT,
    index_scans BIGINT,
    tuples_read BIGINT,
    tuples_fetched BIGINT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::TEXT as schema_name,
        t.relname::TEXT as table_name,
        i.relname::TEXT as index_name,
        s.idx_scan as index_scans,
        s.idx_tup_read as tuples_read,
        s.idx_tup_fetch as tuples_fetched,
        pg_size_pretty(pg_relation_size(i.oid)) as index_size
    FROM pg_stat_user_indexes s
    JOIN pg_class i ON i.oid = s.indexrelid
    JOIN pg_class t ON t.oid = s.relid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create cleanup function for old log data
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS VOID AS $$
BEGIN
    -- Clean up old slow query logs (keep 30 days)
    DELETE FROM slow_query_log 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Clean up old rate limit logs (keep 7 days) 
    DELETE FROM rate_limit_log 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Clean up old system logs (keep 90 days)
    DELETE FROM system_log 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Log the cleanup
    INSERT INTO system_log (operation, details)
    VALUES ('log_cleanup', 'Old log entries cleaned up');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check database health
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    -- Check for tables without primary keys
    RETURN QUERY
    SELECT 
        'missing_primary_keys'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
        'Tables without primary keys: ' || COUNT(*)::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'Add primary keys to all tables' ELSE 'All tables have primary keys' END::TEXT
    FROM information_schema.tables t
    LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name 
        AND tc.constraint_type = 'PRIMARY KEY'
    WHERE t.table_schema = 'public' AND tc.constraint_name IS NULL;
    
    -- Check for unused indexes
    RETURN QUERY
    SELECT 
        'unused_indexes'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'INFO' END::TEXT,
        'Potentially unused indexes: ' || COUNT(*)::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'Review and consider dropping unused indexes' ELSE 'All indexes appear to be used' END::TEXT
    FROM pg_stat_user_indexes 
    WHERE idx_scan = 0 AND schemaname = 'public';
    
    -- Check for tables needing VACUUM
    RETURN QUERY
    SELECT 
        'vacuum_needed'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
        'Tables needing VACUUM: ' || COUNT(*)::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'Run VACUUM on indicated tables' ELSE 'All tables recently vacuumed' END::TEXT
    FROM pg_stat_user_tables 
    WHERE last_vacuum < NOW() - INTERVAL '7 days' OR last_vacuum IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for monitoring tables
CREATE INDEX IF NOT EXISTS idx_slow_query_log_created_at ON slow_query_log(created_at);
CREATE INDEX IF NOT EXISTS idx_system_log_created_at ON system_log(created_at);
CREATE INDEX IF NOT EXISTS idx_system_log_operation ON system_log(operation);

-- Comments
COMMENT ON MATERIALIZED VIEW dashboard_stats IS 'Cached dashboard statistics for performance';
COMMENT ON FUNCTION refresh_dashboard_stats() IS 'Refreshes the dashboard statistics materialized view';
COMMENT ON FUNCTION analyze_table_stats(TEXT) IS 'Provides detailed statistics about table sizes and maintenance';
COMMENT ON FUNCTION get_index_usage() IS 'Shows index usage statistics to identify unused indexes';
COMMENT ON FUNCTION cleanup_old_logs() IS 'Removes old log entries to maintain database performance';
COMMENT ON FUNCTION database_health_check() IS 'Performs basic database health checks and provides recommendations';