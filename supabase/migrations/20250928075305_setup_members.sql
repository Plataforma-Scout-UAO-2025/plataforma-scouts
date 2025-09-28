-- =======================
-- MEMBER
-- =======================
CREATE TABLE member (
  member_id bigserial PRIMARY KEY,
  tenant_id bigint NOT NULL,
  subgroup_id bigint NOT NULL,
  userId uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer,
  role text NOT NULL,
  identification text NOT NULL,
  document_type text,
  email text,
  gender text,
  birth_day date,
  address text,
  phone varchar(20),
  weight text,
  height text,
  hobbies text,
  sports text,
  instruments text,
  status text,
  acceptance_date date,
  in_charge_of integer[],
  emergency_phone json,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT fk_member_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id),
  CONSTRAINT fk_member_subgroup FOREIGN KEY (subgroup_id) REFERENCES subgroup (subgroup_id),
  CONSTRAINT uq_member_identification_per_tenant UNIQUE (tenant_id, identification)
);

-- Índices
CREATE INDEX idx_member_tenant_id ON member(tenant_id);
CREATE INDEX idx_member_subgroup_id ON member(subgroup_id);
CREATE INDEX idx_member_tenant_subgroup_id ON member(tenant_id, subgroup_id);

-- =======================
-- MEDICAL RECORD
-- =======================
CREATE TABLE medical_record (
  medical_record_id bigserial PRIMARY KEY,
  tenant_id bigint NOT NULL,
  member_id bigint NOT NULL,
  blood_type text,
  eps text,
  allergies text,
  chronic_diseases text,
  physical_restrictions text,
  surgical_history text,
  active bool DEFAULT true,
  vaccines_detail jsonb,
  medications_detail jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT fk_medical_record_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id),
  CONSTRAINT fk_medical_record_member FOREIGN KEY (member_id) REFERENCES member (member_id),
  CONSTRAINT uq_medical_record_member UNIQUE (tenant_id, member_id)
);

-- Índices
CREATE INDEX idx_medical_record_tenant_id ON medical_record(tenant_id);

-- =======================
-- SCHOOL DATA
-- =======================
CREATE TABLE school_data (
  school_data_id bigserial PRIMARY KEY,
  tenant_id bigint NOT NULL,
  member_id bigint NOT NULL,
  institution text,
  course text,
  calendar text,
  shift text,
  CONSTRAINT fk_school_data_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id),
  CONSTRAINT fk_school_data_member FOREIGN KEY (member_id) REFERENCES member (member_id),
  CONSTRAINT uq_school_data_member UNIQUE (tenant_id, member_id)
);

-- Índices
CREATE INDEX idx_school_data_tenant_id ON school_data(tenant_id);
