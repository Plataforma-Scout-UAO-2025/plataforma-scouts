-- RLS Policies for Multi-Tenant Scouting Management System

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM users 
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has admin role
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT platform_role = 'admin' 
    FROM users 
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TENANTS: Users can only see their own tenant
CREATE POLICY "Users can access their own tenant" ON tenants
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- USERS: Users can see other users in their tenant
CREATE POLICY "Users can access users in their tenant" ON users
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- MEMBERS: Users can access members in their tenant
CREATE POLICY "Users can access members in their tenant" ON members
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- SECTIONS: Users can access sections in their tenant
CREATE POLICY "Users can access sections in their tenant" ON sections
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- SUBGROUPS: Users can access subgroups in their tenant
CREATE POLICY "Users can access subgroups in their tenant" ON subgroups
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- ADVANCEMENT_PLANS: Users can access advancement plans in their tenant
CREATE POLICY "Users can access advancement plans in their tenant" ON advancement_plans
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- ADVANCEMENT_STAGES: Users can access advancement stages in their tenant
CREATE POLICY "Users can access advancement stages in their tenant" ON advancement_stages
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- ADVANCEMENT_REQUIREMENTS: Users can access requirements in their tenant
CREATE POLICY "Users can access advancement requirements in their tenant" ON advancement_requirements
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- MEMBER_REQUIREMENT_PROGRESS: Users can access progress in their tenant
CREATE POLICY "Users can access member progress in their tenant" ON member_requirement_progress
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- BADGES: Users can access badges in their tenant
CREATE POLICY "Users can access badges in their tenant" ON badges
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- MEMBER_BADGES: Users can access member badges in their tenant
CREATE POLICY "Users can access member badges in their tenant" ON member_badges
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- EVENTS: Users can access events in their tenant
CREATE POLICY "Users can access events in their tenant" ON events
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- AUTHORIZATIONS: Users can access authorizations in their tenant
CREATE POLICY "Users can access authorizations in their tenant" ON authorizations
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- TRANSACTIONS: Users can access transactions in their tenant
CREATE POLICY "Users can access transactions in their tenant" ON transactions
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- COMMITTEES: Users can access committees in their tenant
CREATE POLICY "Users can access committees in their tenant" ON committees
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- COMMITTEE_MEMBERS: Users can access committee members in their tenant
CREATE POLICY "Users can access committee members in their tenant" ON committee_members
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- INVENTORY_ITEMS: Users can access inventory in their tenant
CREATE POLICY "Users can access inventory in their tenant" ON inventory_items
  FOR ALL TO authenticated
  USING (tenant_id = get_current_user_tenant_id());

-- Grant usage on sequences to authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
