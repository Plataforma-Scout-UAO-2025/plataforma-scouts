-- Migration: Create scouting management system schema
-- Generated for Supabase

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to update updated_at timestamp (define early)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tenants table (root entity for multi-tenancy)
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    group_number VARCHAR(10),
    parent_association_name VARCHAR(100),
    logo_url VARCHAR(255),
    scarf_url VARCHAR(255),
    motto VARCHAR(255),
    foundation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    platform_role VARCHAR(50) DEFAULT 'member',
    totem_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, username)
);

-- Create sections table
CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    standard_name VARCHAR(50) NOT NULL,
    group_specific_name VARCHAR(100),
    program_description TEXT,
    section_logo_url VARCHAR(255),
    section_flag_url VARCHAR(255),
    section_yell TEXT,
    call_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, standard_name)
);

-- Create subgroups table
CREATE TABLE subgroups (
    subgroup_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
    subgroup_name VARCHAR(100) NOT NULL,
    subgroup_type VARCHAR(50),
    creation_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    associated_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10),
    address VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(100),
    health_info TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    member_status VARCHAR(20) DEFAULT 'active',
    current_section_id INTEGER REFERENCES sections(section_id) ON DELETE SET NULL,
    subgroup_id INTEGER REFERENCES subgroups(subgroup_id) ON DELETE SET NULL,
    section_role VARCHAR(50),
    totem_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advancement_plans table
CREATE TABLE advancement_plans (
    plan_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_description TEXT,
    order_level INTEGER,
    plan_document_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, section_id, plan_name)
);

-- Create advancement_stages table
CREATE TABLE advancement_stages (
    stage_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES advancement_plans(plan_id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_description TEXT,
    order_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advancement_requirements table
CREATE TABLE advancement_requirements (
    requirement_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL REFERENCES advancement_stages(stage_id) ON DELETE CASCADE,
    requirement_description TEXT NOT NULL,
    requirement_type VARCHAR(50),
    order_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member_requirement_progress table
CREATE TABLE member_requirement_progress (
    member_req_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    requirement_id INTEGER NOT NULL REFERENCES advancement_requirements(requirement_id) ON DELETE CASCADE,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    evaluator_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    evidence_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, requirement_id)
);

-- Create badges table
CREATE TABLE badges (
    badge_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_type VARCHAR(50),
    image_url VARCHAR(255),
    related_advancement_plan_id INTEGER REFERENCES advancement_plans(plan_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, badge_name)
);

-- Create member_badges table
CREATE TABLE member_badges (
    member_badge_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
    date_awarded DATE DEFAULT CURRENT_DATE,
    awarding_leader_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, badge_id)
);

-- Create events table
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE,
    end_datetime TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    cost_per_member DECIMAL(10,2),
    organizing_leader_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    event_status VARCHAR(50) DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create authorizations table
CREATE TABLE authorizations (
    authorization_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    authorizing_guardian_name VARCHAR(100),
    guardian_relationship VARCHAR(50),
    authorization_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    authorization_status VARCHAR(20) DEFAULT 'pending',
    signed_document_url VARCHAR(255),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

-- Create transactions table
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(member_id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_period VARCHAR(50),
    concept TEXT,
    treasurer_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    associated_event_id INTEGER REFERENCES events(event_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create committees table
CREATE TABLE committees (
    committee_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    committee_name VARCHAR(100) NOT NULL,
    committee_level VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, committee_name)
);

-- Create committee_members table
CREATE TABLE committee_members (
    committee_member_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    committee_id INTEGER NOT NULL REFERENCES committees(committee_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    committee_role VARCHAR(50),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(committee_id, user_id, start_date)
);

-- Create inventory_items table
CREATE TABLE inventory_items (
    item_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    storage_location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_members_tenant_id ON members(tenant_id);
CREATE INDEX idx_members_current_section_id ON members(current_section_id);
CREATE INDEX idx_members_subgroup_id ON members(subgroup_id);
CREATE INDEX idx_members_member_status ON members(member_status);
CREATE INDEX idx_members_birth_date ON members(birth_date);

CREATE INDEX idx_sections_tenant_id ON sections(tenant_id);
CREATE INDEX idx_subgroups_tenant_id ON subgroups(tenant_id);
CREATE INDEX idx_subgroups_section_id ON subgroups(section_id);
CREATE INDEX idx_subgroups_is_active ON subgroups(is_active);

CREATE INDEX idx_advancement_plans_tenant_id ON advancement_plans(tenant_id);
CREATE INDEX idx_advancement_plans_section_id ON advancement_plans(section_id);
CREATE INDEX idx_advancement_stages_tenant_id ON advancement_stages(tenant_id);
CREATE INDEX idx_advancement_stages_plan_id ON advancement_stages(plan_id);
CREATE INDEX idx_advancement_requirements_tenant_id ON advancement_requirements(tenant_id);
CREATE INDEX idx_advancement_requirements_stage_id ON advancement_requirements(stage_id);

CREATE INDEX idx_member_requirement_progress_tenant_id ON member_requirement_progress(tenant_id);
CREATE INDEX idx_member_requirement_progress_member_id ON member_requirement_progress(member_id);
CREATE INDEX idx_member_requirement_progress_requirement_id ON member_requirement_progress(requirement_id);
CREATE INDEX idx_member_requirement_progress_status ON member_requirement_progress(status);

CREATE INDEX idx_badges_tenant_id ON badges(tenant_id);
CREATE INDEX idx_member_badges_tenant_id ON member_badges(tenant_id);
CREATE INDEX idx_member_badges_member_id ON member_badges(member_id);
CREATE INDEX idx_member_badges_badge_id ON member_badges(badge_id);

CREATE INDEX idx_events_tenant_id ON events(tenant_id);
CREATE INDEX idx_events_start_datetime ON events(start_datetime);
CREATE INDEX idx_events_event_status ON events(event_status);
CREATE INDEX idx_events_organizing_leader_id ON events(organizing_leader_id);

CREATE INDEX idx_authorizations_tenant_id ON authorizations(tenant_id);
CREATE INDEX idx_authorizations_event_id ON authorizations(event_id);
CREATE INDEX idx_authorizations_member_id ON authorizations(member_id);
CREATE INDEX idx_authorizations_status ON authorizations(authorization_status);

CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_associated_event_id ON transactions(associated_event_id);

CREATE INDEX idx_committees_tenant_id ON committees(tenant_id);
CREATE INDEX idx_committee_members_tenant_id ON committee_members(tenant_id);
CREATE INDEX idx_committee_members_committee_id ON committee_members(committee_id);
CREATE INDEX idx_committee_members_user_id ON committee_members(user_id);

CREATE INDEX idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);

-- Create triggers for updated_at columns
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subgroups_updated_at BEFORE UPDATE ON subgroups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advancement_plans_updated_at BEFORE UPDATE ON advancement_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advancement_stages_updated_at BEFORE UPDATE ON advancement_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advancement_requirements_updated_at BEFORE UPDATE ON advancement_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_requirement_progress_updated_at BEFORE UPDATE ON member_requirement_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_badges_updated_at BEFORE UPDATE ON member_badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authorizations_updated_at BEFORE UPDATE ON authorizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_committees_updated_at BEFORE UPDATE ON committees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_committee_members_updated_at BEFORE UPDATE ON committee_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for multi-tenancy
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subgroups ENABLE ROW LEVEL SECURITY;
ALTER TABLE advancement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE advancement_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE advancement_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_requirement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Add comments to tables for documentation
COMMENT ON TABLE tenants IS 'Multi-tenant root table for scouting groups';
COMMENT ON TABLE users IS 'Platform users including leaders and admin staff';
COMMENT ON TABLE members IS 'Scout members with their personal information';
COMMENT ON TABLE sections IS 'Age-based scouting sections (Cubs, Scouts, Rovers, etc.)';
COMMENT ON TABLE subgroups IS 'Smaller groups within sections (patrols, sixes, etc.)';
COMMENT ON TABLE advancement_plans IS 'Advancement/progression programs for each section';
COMMENT ON TABLE advancement_stages IS 'Stages within advancement plans';
COMMENT ON TABLE advancement_requirements IS 'Requirements for each advancement stage';
COMMENT ON TABLE member_requirement_progress IS 'Individual member progress on requirements';
COMMENT ON TABLE badges IS 'Activity badges and special awards';
COMMENT ON TABLE member_badges IS 'Badges earned by members';
COMMENT ON TABLE events IS 'Group activities, camps, and meetings';
COMMENT ON TABLE authorizations IS 'Guardian permissions for member event participation';
COMMENT ON TABLE transactions IS 'Financial transactions for members';
COMMENT ON TABLE committees IS 'Group committees and leadership roles';
COMMENT ON TABLE committee_members IS 'Committee membership records';
COMMENT ON TABLE inventory_items IS 'Group equipment and supplies inventory';
