-- Migration: Add Data Validation and Enhanced Constraints
-- Addresses missing validation rules and data integrity issues

-- Add check constraints for data validation
ALTER TABLE tenants 
ADD CONSTRAINT check_group_name_length CHECK (char_length(group_name) >= 2),
ADD CONSTRAINT check_group_number_format CHECK (group_number ~ '^[0-9]{1,3}[A-Z]?$'),
ADD CONSTRAINT check_foundation_date_reasonable CHECK (foundation_date >= '1900-01-01' AND foundation_date <= CURRENT_DATE);

ALTER TABLE users
ADD CONSTRAINT check_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
ADD CONSTRAINT check_username_format CHECK (username ~ '^[a-zA-Z0-9_.-]+$'),
ADD CONSTRAINT check_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT check_first_name_length CHECK (char_length(first_name) >= 2),
ADD CONSTRAINT check_last_name_length CHECK (char_length(last_name) >= 2),
ADD CONSTRAINT check_platform_role_valid CHECK (platform_role IN ('admin', 'leader', 'treasurer', 'secretary', 'member'));

ALTER TABLE members
ADD CONSTRAINT check_member_first_name_length CHECK (char_length(first_name) >= 2),
ADD CONSTRAINT check_member_last_name_length CHECK (char_length(last_name) >= 2),
ADD CONSTRAINT check_birth_date_reasonable CHECK (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE),
ADD CONSTRAINT check_gender_valid CHECK (gender IN ('M', 'F', 'Other', 'Prefer not to say')),
ADD CONSTRAINT check_member_status_valid CHECK (member_status IN ('active', 'inactive', 'suspended', 'alumni')),
ADD CONSTRAINT check_join_date_reasonable CHECK (join_date <= CURRENT_DATE),
ADD CONSTRAINT check_contact_phone_format CHECK (contact_phone ~ '^[\+]?[0-9\s\-\(\)]+$'),
ADD CONSTRAINT check_guardian_phone_format CHECK (guardian_phone IS NULL OR guardian_phone ~ '^[\+]?[0-9\s\-\(\)]+$');

ALTER TABLE sections
ADD CONSTRAINT check_standard_name_length CHECK (char_length(standard_name) >= 2),
ADD CONSTRAINT check_standard_name_valid CHECK (standard_name IN ('Beavers', 'Cubs', 'Scouts', 'Venturers', 'Rovers', 'Leaders'));

ALTER TABLE events
ADD CONSTRAINT check_event_name_length CHECK (char_length(event_name) >= 3),
ADD CONSTRAINT check_event_dates_logical CHECK (end_datetime IS NULL OR end_datetime >= start_datetime),
ADD CONSTRAINT check_cost_per_member_positive CHECK (cost_per_member IS NULL OR cost_per_member >= 0),
ADD CONSTRAINT check_event_status_valid CHECK (event_status IN ('planned', 'confirmed', 'cancelled', 'completed'));

ALTER TABLE transactions
ADD CONSTRAINT check_transaction_type_valid CHECK (transaction_type IN ('fee', 'camp_payment', 'equipment_purchase', 'fundraising', 'donation', 'refund')),
ADD CONSTRAINT check_amount_not_zero CHECK (amount != 0),
ADD CONSTRAINT check_payment_status_valid CHECK (payment_status IN ('pending', 'paid', 'overdue', 'refunded')),
ADD CONSTRAINT check_transaction_date_reasonable CHECK (transaction_date <= CURRENT_DATE);

ALTER TABLE authorizations
ADD CONSTRAINT check_authorization_status_valid CHECK (authorization_status IN ('pending', 'approved', 'denied', 'expired')),
ADD CONSTRAINT check_guardian_relationship_valid CHECK (guardian_relationship IN ('parent', 'guardian', 'other_family', 'emergency_contact'));

-- Add unique constraints where needed
ALTER TABLE sections 
ADD CONSTRAINT unique_section_per_tenant UNIQUE (tenant_id, standard_name);

ALTER TABLE badges 
ADD CONSTRAINT unique_badge_per_tenant UNIQUE (tenant_id, badge_name);

ALTER TABLE committees
ADD CONSTRAINT unique_committee_per_tenant UNIQUE (tenant_id, committee_name);

-- Add foreign key constraints that were missing
ALTER TABLE member_requirement_progress
ADD CONSTRAINT fk_evaluator_user FOREIGN KEY (evaluator_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE member_badges
ADD CONSTRAINT fk_awarding_leader FOREIGN KEY (awarding_leader_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE events
ADD CONSTRAINT fk_organizing_leader FOREIGN KEY (organizing_leader_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE transactions
ADD CONSTRAINT fk_treasurer FOREIGN KEY (treasurer_id) REFERENCES users(user_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_associated_event FOREIGN KEY (associated_event_id) REFERENCES events(event_id) ON DELETE SET NULL;

-- Create function to validate email format (more robust than regex)
CREATE OR REPLACE FUNCTION is_valid_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic email validation
    RETURN email_address ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
           AND length(email_address) <= 254
           AND email_address NOT LIKE '%@%@%'  -- No double @
           AND email_address NOT LIKE '.%'     -- Doesn't start with dot
           AND email_address NOT LIKE '%.'     -- Doesn't end with dot
           AND email_address NOT LIKE '%.@%'   -- No dot before @
           AND email_address NOT LIKE '%@.%';  -- No dot after @
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update email constraints to use the function
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_email_format;
ALTER TABLE users ADD CONSTRAINT check_email_format CHECK (is_valid_email(email));

-- Add constraint to ensure contact_email is valid if provided
ALTER TABLE members 
ADD CONSTRAINT check_contact_email_format CHECK (contact_email IS NULL OR is_valid_email(contact_email)),
ADD CONSTRAINT check_guardian_email_format CHECK (guardian_email IS NULL OR is_valid_email(guardian_email));

-- Add audit fields trigger for important tables
CREATE OR REPLACE FUNCTION add_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
        NEW.updated_at = NOW();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.created_at = OLD.created_at; -- Preserve original created_at
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON FUNCTION is_valid_email(TEXT) IS 'Validates email address format with comprehensive checks';