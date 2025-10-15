-- 2️⃣ BADGE
CREATE TABLE public.badge
(
    badge_id                  BIGSERIAL PRIMARY KEY,
    tenant_id                 VARCHAR,
    subgroup_id               BIGINT REFERENCES public.subgroup (subgroup_id) ON DELETE CASCADE,
    name                      VARCHAR NOT NULL,
    description               TEXT,
    required_activities_count INTEGER     DEFAULT 0,
    is_active                 BOOLEAN     DEFAULT TRUE,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW(),
    image_object_id           UUID,
    CONSTRAINT badge_image_fkey FOREIGN KEY (image_object_id)
        REFERENCES storage.objects (id)
        ON DELETE SET NULL
);

-- 3️⃣ BADGE_ACTIVITY
CREATE TABLE public.badge_activity
(
    activity_id BIGSERIAL PRIMARY KEY,
    badge_id    BIGINT REFERENCES public.badge (badge_id) ON DELETE CASCADE,
    tenant_id   VARCHAR,
    title       VARCHAR NOT NULL,
    description TEXT
);

-- 5️⃣ BADGE_PROGRESS
CREATE TYPE progress_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');

CREATE TABLE public.badge_progress
(
    progress_id     BIGSERIAL PRIMARY KEY,
    tenant_id       VARCHAR,
    member_id       BIGINT REFERENCES public.member (member_id) ON DELETE CASCADE,
    badge_id        BIGINT REFERENCES public.badge (badge_id) ON DELETE CASCADE,
    activity_id     BIGINT REFERENCES public.badge_activity (activity_id) ON DELETE CASCADE,
    description     TEXT,
    image_object_id UUID,
    date            DATE            DEFAULT CURRENT_DATE,
    status          progress_status DEFAULT 'pending',
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    CONSTRAINT badge_progress_image_fkey FOREIGN KEY (image_object_id)
        REFERENCES storage.objects (id)
        ON DELETE SET NULL
);

-- 6️⃣ BADGE_PROGRESS_APPROVAL
CREATE TABLE public.badge_progress_approval
(
    approval_id BIGSERIAL PRIMARY KEY,
    progress_id BIGINT REFERENCES public.badge_progress (progress_id) ON DELETE CASCADE,
    member_id   BIGINT REFERENCES public.member (member_id) ON DELETE CASCADE,
    tenant_id   VARCHAR,
    approved    BOOLEAN     DEFAULT FALSE,
    note        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7️⃣ MEMBER_BADGE
CREATE TABLE public.member_badge
(
    member_badge_id BIGSERIAL PRIMARY KEY,
    tenant_id       VARCHAR,
    member_id       BIGINT REFERENCES public.member (member_id) ON DELETE CASCADE,
    badge_id        BIGINT REFERENCES public.badge (badge_id) ON DELETE CASCADE,
    assigned_by     BIGINT REFERENCES public.member (member_id) ON DELETE SET NULL,
    assigned_at     TIMESTAMPTZ DEFAULT NOW()
);