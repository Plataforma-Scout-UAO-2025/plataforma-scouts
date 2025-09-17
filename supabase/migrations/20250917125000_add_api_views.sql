-- Migration: Add API Views and Client Optimization
-- Creates optimized views and functions for common client queries

-- Create optimized views for common API endpoints

-- Member summary view with all relevant joined data
CREATE VIEW member_summary AS
SELECT 
    m.member_id,
    m.tenant_id,
    m.first_name,
    m.last_name,
    m.first_name || ' ' || m.last_name as full_name,
    m.birth_date,
    EXTRACT(YEAR FROM AGE(m.birth_date)) as age,
    m.gender,
    m.member_status,
    m.join_date,
    m.totem_name,
    s.standard_name as section_name,
    s.group_specific_name as section_display_name,
    sg.subgroup_name,
    m.section_role,
    CASE 
        WHEN m.birth_date IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(YEAR FROM AGE(m.birth_date)) < 8 THEN 'Beavers'
                WHEN EXTRACT(YEAR FROM AGE(m.birth_date)) < 11 THEN 'Cubs'
                WHEN EXTRACT(YEAR FROM AGE(m.birth_date)) < 15 THEN 'Scouts'
                WHEN EXTRACT(YEAR FROM AGE(m.birth_date)) < 18 THEN 'Venturers'
                ELSE 'Rovers'
            END
        ELSE NULL
    END as suggested_section,
    -- Emergency contact info
    m.guardian_name,
    m.guardian_phone,
    m.guardian_email,
    m.contact_phone,
    m.contact_email,
    -- Metadata
    m.created_at,
    m.updated_at
FROM members m
LEFT JOIN sections s ON m.current_section_id = s.section_id
LEFT JOIN subgroups sg ON m.subgroup_id = sg.subgroup_id;

-- Event summary view with participation counts
CREATE VIEW event_summary AS
SELECT 
    e.event_id,
    e.tenant_id,
    e.event_name,
    e.description,
    e.start_datetime,
    e.end_datetime,
    e.location,
    e.cost_per_member,
    e.event_status,
    e.organizing_leader_id,
    u.first_name || ' ' || u.last_name as organizing_leader_name,
    -- Participation statistics
    COUNT(a.member_id) as total_authorizations,
    COUNT(a.member_id) FILTER (WHERE a.authorization_status = 'approved') as approved_count,
    COUNT(a.member_id) FILTER (WHERE a.authorization_status = 'pending') as pending_count,
    COUNT(a.member_id) FILTER (WHERE a.authorization_status = 'denied') as denied_count,
    -- Financial info
    e.cost_per_member * COUNT(a.member_id) FILTER (WHERE a.authorization_status = 'approved') as total_expected_income,
    COALESCE(SUM(t.amount) FILTER (WHERE t.payment_status = 'paid'), 0) as total_payments_received,
    -- Metadata
    e.created_at,
    e.updated_at
FROM events e
LEFT JOIN users u ON e.organizing_leader_id = u.user_id
LEFT JOIN authorizations a ON e.event_id = a.event_id
LEFT JOIN transactions t ON e.event_id = t.associated_event_id
GROUP BY e.event_id, e.tenant_id, e.event_name, e.description, e.start_datetime, 
         e.end_datetime, e.location, e.cost_per_member, e.event_status, 
         e.organizing_leader_id, u.first_name, u.last_name, e.created_at, e.updated_at;

-- Financial summary view
CREATE VIEW financial_summary AS
SELECT 
    t.tenant_id,
    DATE_TRUNC('month', t.transaction_date) as month,
    t.transaction_type,
    SUM(t.amount) FILTER (WHERE t.amount > 0) as total_income,
    SUM(ABS(t.amount)) FILTER (WHERE t.amount < 0) as total_expenses,
    SUM(t.amount) as net_amount,
    COUNT(*) as transaction_count,
    COUNT(*) FILTER (WHERE t.payment_status = 'paid') as paid_count,
    COUNT(*) FILTER (WHERE t.payment_status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE t.payment_status = 'overdue') as overdue_count
FROM transactions t
GROUP BY t.tenant_id, DATE_TRUNC('month', t.transaction_date), t.transaction_type;

-- Member progress summary
CREATE VIEW member_progress_summary AS
SELECT 
    mp.tenant_id,
    mp.member_id,
    m.first_name || ' ' || m.last_name as member_name,
    s.stage_name,
    ap.plan_name,
    COUNT(ar.requirement_id) as total_requirements,
    COUNT(mp.requirement_id) FILTER (WHERE mp.status = 'completed') as completed_requirements,
    COUNT(mp.requirement_id) FILTER (WHERE mp.status = 'pending') as pending_requirements,
    ROUND(
        (COUNT(mp.requirement_id) FILTER (WHERE mp.status = 'completed')::DECIMAL / 
         NULLIF(COUNT(ar.requirement_id), 0)) * 100, 
        2
    ) as completion_percentage,
    MAX(mp.completion_date) as last_completion_date
FROM advancement_stages s
LEFT JOIN advancement_requirements ar ON s.stage_id = ar.stage_id
LEFT JOIN member_requirement_progress mp ON ar.requirement_id = mp.requirement_id
LEFT JOIN members m ON mp.member_id = m.member_id
LEFT JOIN advancement_plans ap ON s.plan_id = ap.plan_id
GROUP BY mp.tenant_id, mp.member_id, m.first_name, m.last_name, s.stage_name, ap.plan_name;

-- Section statistics view
CREATE VIEW section_statistics AS
SELECT 
    s.section_id,
    s.tenant_id,
    s.standard_name,
    s.group_specific_name,
    COUNT(m.member_id) as total_members,
    COUNT(m.member_id) FILTER (WHERE m.member_status = 'active') as active_members,
    COUNT(DISTINCT sg.subgroup_id) as subgroup_count,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(m.birth_date))), 1) as average_age,
    MIN(m.birth_date) as oldest_member_birth,
    MAX(m.birth_date) as youngest_member_birth,
    COUNT(m.member_id) FILTER (WHERE m.gender = 'M') as male_count,
    COUNT(m.member_id) FILTER (WHERE m.gender = 'F') as female_count,
    COUNT(m.member_id) FILTER (WHERE m.gender NOT IN ('M', 'F')) as other_gender_count
FROM sections s
LEFT JOIN members m ON s.section_id = m.current_section_id AND m.member_status = 'active'
LEFT JOIN subgroups sg ON s.section_id = sg.section_id AND sg.is_active = true
GROUP BY s.section_id, s.tenant_id, s.standard_name, s.group_specific_name;

-- Create API helper functions

-- Function to get member's current advancement progress
CREATE OR REPLACE FUNCTION get_member_advancement_progress(p_member_id INTEGER)
RETURNS TABLE(
    stage_name TEXT,
    plan_name TEXT,
    total_requirements INTEGER,
    completed_requirements INTEGER,
    completion_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.stage_name::TEXT,
        ap.plan_name::TEXT,
        COUNT(ar.requirement_id)::INTEGER as total_requirements,
        COUNT(mp.requirement_id) FILTER (WHERE mp.status = 'completed')::INTEGER as completed_requirements,
        ROUND(
            (COUNT(mp.requirement_id) FILTER (WHERE mp.status = 'completed')::DECIMAL / 
             NULLIF(COUNT(ar.requirement_id), 0)) * 100, 
            2
        ) as completion_percentage
    FROM members m
    JOIN sections sec ON m.current_section_id = sec.section_id
    JOIN advancement_plans ap ON sec.section_id = ap.section_id
    JOIN advancement_stages s ON ap.plan_id = s.plan_id
    LEFT JOIN advancement_requirements ar ON s.stage_id = ar.stage_id
    LEFT JOIN member_requirement_progress mp ON ar.requirement_id = mp.requirement_id 
        AND mp.member_id = p_member_id
    WHERE m.member_id = p_member_id
    GROUP BY s.stage_name, ap.plan_name, s.order_level
    ORDER BY s.order_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming events for a member
CREATE OR REPLACE FUNCTION get_member_upcoming_events(p_member_id INTEGER, days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
    event_id INTEGER,
    event_name TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE,
    end_datetime TIMESTAMP WITH TIME ZONE,
    location TEXT,
    cost_per_member DECIMAL,
    authorization_status TEXT,
    organizing_leader_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.event_id,
        e.event_name::TEXT,
        e.start_datetime,
        e.end_datetime,
        e.location::TEXT,
        e.cost_per_member,
        COALESCE(a.authorization_status, 'not_requested')::TEXT,
        u.first_name || ' ' || u.last_name as organizing_leader_name
    FROM events e
    LEFT JOIN authorizations a ON e.event_id = a.event_id AND a.member_id = p_member_id
    LEFT JOIN users u ON e.organizing_leader_id = u.user_id
    JOIN members m ON m.member_id = p_member_id
    WHERE e.tenant_id = m.tenant_id
    AND e.start_datetime >= CURRENT_DATE
    AND e.start_datetime <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND e.event_status IN ('planned', 'confirmed')
    ORDER BY e.start_datetime;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get member's financial summary
CREATE OR REPLACE FUNCTION get_member_financial_summary(p_member_id INTEGER)
RETURNS TABLE(
    total_fees DECIMAL,
    total_paid DECIMAL,
    outstanding_balance DECIMAL,
    last_payment_date DATE,
    overdue_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(t.amount), 0) as total_fees,
        COALESCE(SUM(t.amount) FILTER (WHERE t.payment_status = 'paid'), 0) as total_paid,
        COALESCE(SUM(t.amount) FILTER (WHERE t.payment_status IN ('pending', 'overdue')), 0) as outstanding_balance,
        MAX(t.transaction_date) FILTER (WHERE t.payment_status = 'paid') as last_payment_date,
        COUNT(*) FILTER (WHERE t.payment_status = 'overdue')::INTEGER as overdue_count
    FROM transactions t
    WHERE t.member_id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Views inherit RLS from their base tables automatically
-- No need to change ownership as views respect the underlying table policies

-- Create indexes to support the views
CREATE INDEX IF NOT EXISTS idx_members_full_name 
ON members(tenant_id, (first_name || ' ' || last_name));

CREATE INDEX IF NOT EXISTS idx_events_status_date 
ON events(tenant_id, event_status, start_datetime);

-- Note: DATE_TRUNC functional index removed due to IMMUTABLE requirement
-- Monthly aggregations can be done efficiently in queries instead

-- Comments
COMMENT ON VIEW member_summary IS 'Optimized view for member listing with all relevant data';
COMMENT ON VIEW event_summary IS 'Event view with participation and financial statistics';
COMMENT ON VIEW financial_summary IS 'Monthly financial summary by transaction type';
COMMENT ON VIEW member_progress_summary IS 'Member advancement progress overview';
COMMENT ON VIEW section_statistics IS 'Section membership and demographic statistics';
COMMENT ON FUNCTION get_member_advancement_progress(INTEGER) IS 'Gets detailed advancement progress for a specific member';
COMMENT ON FUNCTION get_member_upcoming_events(INTEGER, INTEGER) IS 'Gets upcoming events for a member with authorization status';
COMMENT ON FUNCTION get_member_financial_summary(INTEGER) IS 'Gets financial summary for a specific member';