-- Migration: Add Role-Based Access Control (RBAC)
-- This adds granular permission control based on user roles within tenants

-- Create user roles enum for better type safety
CREATE TYPE user_role AS ENUM (
    'admin',          -- Full access to tenant data
    'leader',         -- Can manage sections, members, events
    'treasurer',      -- Can manage financial data
    'secretary',      -- Can manage records and reports
    'member'          -- Read-only access to relevant data
);

-- Add role column to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'tenant_role') THEN
        ALTER TABLE users ADD COLUMN tenant_role user_role DEFAULT 'member';
    END IF;
END $$;

-- Create helper functions for RBAC
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT tenant_role 
    FROM users 
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_current_user_role()) = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_can_manage_finances()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_current_user_role()) IN ('admin', 'treasurer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_can_manage_members()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_current_user_role()) IN ('admin', 'leader', 'secretary');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add more restrictive policies for sensitive tables

-- TRANSACTIONS: Only admins and treasurers can manage financial data
DROP POLICY IF EXISTS "Users can access transactions in their tenant" ON transactions;

CREATE POLICY "Users can view transactions in their tenant" ON transactions
  FOR SELECT TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

CREATE POLICY "Treasurers can manage transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_finances())
  );

CREATE POLICY "Treasurers can update transactions" ON transactions
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_finances())
  );

CREATE POLICY "Treasurers can delete transactions" ON transactions
  FOR DELETE TO authenticated
  USING (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_finances())
  );

-- MEMBERS: Only leaders can modify member data
DROP POLICY IF EXISTS "Users can access members in their tenant" ON members;

CREATE POLICY "Users can view members in their tenant" ON members
  FOR SELECT TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

CREATE POLICY "Leaders can manage members" ON members
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_members())
  );

CREATE POLICY "Leaders can update members" ON members
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_members())
  );

CREATE POLICY "Leaders can delete members" ON members
  FOR DELETE TO authenticated
  USING (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_members())
  );

-- EVENTS: Only leaders and admins can create/modify events
DROP POLICY IF EXISTS "Users can access events in their tenant" ON events;

CREATE POLICY "Users can view events in their tenant" ON events
  FOR SELECT TO authenticated
  USING (tenant_id = (SELECT get_current_user_tenant_id()));

CREATE POLICY "Leaders can manage events" ON events
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_members())
  );

CREATE POLICY "Leaders can update events" ON events
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_members())
  );

CREATE POLICY "Leaders can delete events" ON events
  FOR DELETE TO authenticated
  USING (
    tenant_id = (SELECT get_current_user_tenant_id()) 
    AND (SELECT user_can_manage_members())
  );

-- Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, tenant_role);

-- Comments
COMMENT ON TYPE user_role IS 'Defines user roles within a tenant for RBAC';
COMMENT ON FUNCTION get_current_user_role() IS 'Returns the current user role for RBAC decisions';
COMMENT ON FUNCTION user_can_manage_finances() IS 'Checks if user can manage financial data';
COMMENT ON FUNCTION user_can_manage_members() IS 'Checks if user can manage member data';