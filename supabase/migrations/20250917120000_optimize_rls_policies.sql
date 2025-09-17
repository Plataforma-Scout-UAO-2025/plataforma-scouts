-- Migration: Optimize RLS Policies for Performance
-- Issues addressed:
-- 1. Wrap auth functions in SELECT for optimization
-- 2. Add explicit role targeting to prevent unnecessary policy evaluation
-- 3. Improve function performance with proper indexing

-- Drop existing policies (they'll be recreated with optimizations)
DROP POLICY IF EXISTS "Users can access their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can access users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can access members in their tenant" ON members;
DROP POLICY IF EXISTS "Users can access sections in their tenant" ON sections;
DROP POLICY IF EXISTS "Users can access subgroups in their tenant" ON subgroups;
DROP POLICY IF EXISTS "Users can access advancement plans in their tenant" ON advancement_plans;
DROP POLICY IF EXISTS "Users can access advancement stages in their tenant" ON advancement_stages;
DROP POLICY IF EXISTS "Users can access advancement requirements in their tenant" ON advancement_requirements;
DROP POLICY IF EXISTS "Users can access member progress in their tenant" ON member_requirement_progress;
DROP POLICY IF EXISTS "Users can access badges in their tenant" ON badges;
DROP POLICY IF EXISTS "Users can access member badges in their tenant" ON member_badges;
DROP POLICY IF EXISTS "Users can access events in their tenant" ON events;
DROP POLICY IF EXISTS "Users can access authorizations in their tenant" ON authorizations;
DROP POLICY IF EXISTS "Users can access transactions in their tenant" ON transactions;
DROP POLICY IF EXISTS "Users can access committees in their tenant" ON committees;
DROP POLICY IF EXISTS "Users can access committee members in their tenant" ON committee_members;
DROP POLICY IF EXISTS "Users can access inventory in their tenant" ON inventory_items;

-- Optimize the tenant lookup function
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM users 
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create optimized RLS policies with proper role targeting and SELECT wrapping

-- TENANTS: Users can only see their own tenant
CREATE POLICY "Users can access their own tenant" ON tenants
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- USERS: Users can see other users in their tenant
CREATE POLICY "Users can access users in their tenant" ON users
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- MEMBERS: Users can access members in their tenant
CREATE POLICY "Users can access members in their tenant" ON members
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- SECTIONS: Users can access sections in their tenant
CREATE POLICY "Users can access sections in their tenant" ON sections
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- SUBGROUPS: Users can access subgroups in their tenant
CREATE POLICY "Users can access subgroups in their tenant" ON subgroups
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- ADVANCEMENT_PLANS: Users can access advancement plans in their tenant
CREATE POLICY "Users can access advancement plans in their tenant" ON advancement_plans
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- ADVANCEMENT_STAGES: Users can access advancement stages in their tenant
CREATE POLICY "Users can access advancement stages in their tenant" ON advancement_stages
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- ADVANCEMENT_REQUIREMENTS: Users can access requirements in their tenant
CREATE POLICY "Users can access advancement requirements in their tenant" ON advancement_requirements
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- MEMBER_REQUIREMENT_PROGRESS: Users can access progress in their tenant
CREATE POLICY "Users can access member progress in their tenant" ON member_requirement_progress
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- BADGES: Users can access badges in their tenant
CREATE POLICY "Users can access badges in their tenant" ON badges
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- MEMBER_BADGES: Users can access member badges in their tenant
CREATE POLICY "Users can access member badges in their tenant" ON member_badges
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- EVENTS: Users can access events in their tenant
CREATE POLICY "Users can access events in their tenant" ON events
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- AUTHORIZATIONS: Users can access authorizations in their tenant
CREATE POLICY "Users can access authorizations in their tenant" ON authorizations
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- TRANSACTIONS: Users can access transactions in their tenant
CREATE POLICY "Users can access transactions in their tenant" ON transactions
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- COMMITTEES: Users can access committees in their tenant
CREATE POLICY "Users can access committees in their tenant" ON committees
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- COMMITTEE_MEMBERS: Users can access committee members in their tenant
CREATE POLICY "Users can access committee members in their tenant" ON committee_members
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- INVENTORY_ITEMS: Users can access inventory in their tenant
CREATE POLICY "Users can access inventory in their tenant" ON inventory_items
  FOR ALL TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

-- Add missing indexes for RLS policy optimization
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Add comments explaining the optimization
COMMENT ON FUNCTION get_current_user_tenant_id() IS 'Optimized tenant lookup function - marked as STABLE for caching';