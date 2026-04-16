-- ============================================================================
-- KOO HERITAGE PLATFORM - DATABASE SCHEMA
-- Supabase (PostgreSQL)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search


-- ─── CLANS ──────────────────────────────────────────────────────────────────
-- Top-level grouping: the clan/ukoo a person belongs to
CREATE TABLE clans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    totem TEXT,                          -- Clan totem animal/symbol
    origin TEXT,                         -- Geographic origin
    motto TEXT,                          -- Clan motto/saying
    origin_story TEXT,                   -- Full narrative of clan origins
    migration_path JSONB,               -- Array of places the clan migrated through
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PEOPLE ─────────────────────────────────────────────────────────────────
-- Core person record. Every individual in the tree.
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    other_names TEXT[],                  -- Aliases, nicknames, titles
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    clan_id UUID REFERENCES clans(id),
    birth_year INTEGER,
    birth_month INTEGER,
    birth_day INTEGER,
    birth_place TEXT,
    death_year INTEGER,
    death_month INTEGER,
    death_day INTEGER,
    death_place TEXT,
    occupation TEXT,
    bio TEXT,                            -- Full biography
    name_meaning TEXT,                   -- Why the name was given
    generation INTEGER,                  -- Generation number (1 = oldest)
    is_alive BOOLEAN GENERATED ALWAYS AS (death_year IS NULL) STORED,
    photo_url TEXT,
    created_by UUID,                     -- User who added this person
    verified BOOLEAN DEFAULT FALSE,      -- Moderation flag
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_people_clan ON people(clan_id);
CREATE INDEX idx_people_name ON people USING gin(
    (first_name || ' ' || COALESCE(last_name, '')) gin_trgm_ops
);
CREATE INDEX idx_people_generation ON people(generation);

-- ─── RELATIONSHIPS ──────────────────────────────────────────────────────────
-- All relationships between people.
-- Types: parent_child, spouse, sibling, guardian, godparent, mlezi
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_a_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    person_b_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'parent_child',     -- person_a is parent of person_b
        'spouse',           -- person_a and person_b are spouses
        'sibling',          -- auto-derived, but can be explicit
        'guardian',          -- mlezi / caretaker
        'godparent'         -- godparent relationship
    )),
    start_year INTEGER,                  -- Year relationship began (e.g. marriage year)
    end_year INTEGER,                    -- Year relationship ended (e.g. divorce, death)
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate relationships
    UNIQUE(person_a_id, person_b_id, relationship_type),
    -- Prevent self-relationships
    CHECK(person_a_id != person_b_id)
);

CREATE INDEX idx_rel_person_a ON relationships(person_a_id);
CREATE INDEX idx_rel_person_b ON relationships(person_b_id);
CREATE INDEX idx_rel_type ON relationships(relationship_type);

-- ─── ACHIEVEMENTS ───────────────────────────────────────────────────────────
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    year INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_person ON achievements(person_id);

-- ─── LIFE EVENTS / TIMELINE ────────────────────────────────────────────────
CREATE TABLE life_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN (
        'birth', 'death', 'marriage', 'divorce',
        'milestone', 'education', 'career',
        'migration', 'religious', 'other'
    )),
    event_year INTEGER NOT NULL,
    event_month INTEGER,
    event_day INTEGER,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_person ON life_events(person_id);
CREATE INDEX idx_events_year ON life_events(event_year);
CREATE INDEX idx_events_type ON life_events(event_type);

-- ─── STORIES & MEMORIES ────────────────────────────────────────────────────
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,  -- Can be about a person
    clan_id UUID REFERENCES clans(id) ON DELETE SET NULL,     -- Or about a clan
    author_user_id UUID,                                       -- Who wrote it
    author_name TEXT NOT NULL,                                  -- Display name of author
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    story_type TEXT CHECK (story_type IN (
        'memory', 'history', 'tribute', 'proverb',
        'recipe', 'tradition', 'legacy_message'
    )),
    is_published BOOLEAN DEFAULT FALSE,   -- Moderation
    target_generation INTEGER,             -- For legacy messages: which generation to reveal to
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stories_person ON stories(person_id);
CREATE INDEX idx_stories_type ON stories(story_type);

-- ─── MEDIA ──────────────────────────────────────────────────────────────────
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    uploaded_by UUID,
    media_type TEXT CHECK (media_type IN ('photo', 'video', 'audio', 'document')),
    url TEXT NOT NULL,                    -- Supabase Storage URL
    thumbnail_url TEXT,
    caption TEXT,
    description TEXT,
    year_taken INTEGER,                   -- Approximate year of the media
    file_size_bytes BIGINT,
    mime_type TEXT,
    is_profile_photo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_person ON media(person_id);
CREATE INDEX idx_media_type ON media(media_type);

-- ─── PROVERBS & WISDOM ─────────────────────────────────────────────────────
CREATE TABLE proverbs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_sw TEXT NOT NULL,                -- Swahili text
    text_en TEXT,                          -- English translation
    clan_id UUID REFERENCES clans(id),    -- Clan-specific proverb
    attribution TEXT,                      -- Who said it
    context TEXT,                          -- When/why it's used
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER ACCOUNTS ──────────────────────────────────────────────────────────
-- Extends Supabase auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    person_id UUID REFERENCES people(id),  -- Link to their person record
    role TEXT DEFAULT 'contributor' CHECK (role IN (
        'admin',        -- Full access, can approve edits
        'editor',       -- Can edit and approve contributions
        'contributor',  -- Can submit edits for review
        'viewer'        -- Read-only
    )),
    clan_id UUID REFERENCES clans(id),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EDIT PROPOSALS (Moderation) ────────────────────────────────────────────
-- Track all proposed changes for moderation
CREATE TABLE edit_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposed_by UUID NOT NULL REFERENCES profiles(id),
    target_table TEXT NOT NULL,           -- Which table is being edited
    target_id UUID,                       -- ID of existing record (NULL for new)
    action TEXT CHECK (action IN ('create', 'update', 'delete')),
    proposed_data JSONB NOT NULL,         -- The proposed changes
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'withdrawn'
    )),
    reviewed_by UUID REFERENCES profiles(id),
    review_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_proposals_status ON edit_proposals(status);
CREATE INDEX idx_proposals_by ON edit_proposals(proposed_by);

-- ─── QR MEMORIAL CODES ─────────────────────────────────────────────────────
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    short_code TEXT UNIQUE NOT NULL,      -- e.g. "koo-mzr-001"
    purpose TEXT,                          -- "gravestone", "photo_frame", etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUDIT LOG ──────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_time ON audit_log(created_at);


-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_proposals ENABLE ROW LEVEL SECURITY;

-- Everyone can read published data
CREATE POLICY "Public read access" ON people FOR SELECT USING (verified = TRUE);
CREATE POLICY "Public read stories" ON stories FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read media" ON media FOR SELECT USING (TRUE);

-- Contributors can insert proposals
CREATE POLICY "Contributors can propose" ON edit_proposals
    FOR INSERT WITH CHECK (auth.uid() = proposed_by);

-- Admins/editors can approve
CREATE POLICY "Editors can review" ON edit_proposals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Admins have full access
CREATE POLICY "Admin full access people" ON people
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

-- Get all relatives of a person
CREATE OR REPLACE FUNCTION get_relatives(target_person_id UUID)
RETURNS TABLE (
    person_id UUID,
    first_name TEXT,
    last_name TEXT,
    relationship_type TEXT,
    direction TEXT  -- 'parent', 'child', 'spouse', etc.
) AS $$
BEGIN
    RETURN QUERY
    -- Person A is the target (they are parent/spouse/guardian OF person B)
    SELECT
        r.person_b_id,
        p.first_name,
        p.last_name,
        r.relationship_type,
        CASE r.relationship_type
            WHEN 'parent_child' THEN 'child'
            WHEN 'spouse' THEN 'spouse'
            WHEN 'guardian' THEN 'ward'
            WHEN 'godparent' THEN 'godchild'
            ELSE r.relationship_type
        END
    FROM relationships r
    JOIN people p ON p.id = r.person_b_id
    WHERE r.person_a_id = target_person_id

    UNION ALL

    -- Person B is the target (they are child/spouse/ward OF person A)
    SELECT
        r.person_a_id,
        p.first_name,
        p.last_name,
        r.relationship_type,
        CASE r.relationship_type
            WHEN 'parent_child' THEN 'parent'
            WHEN 'spouse' THEN 'spouse'
            WHEN 'guardian' THEN 'guardian'
            WHEN 'godparent' THEN 'godparent'
            ELSE r.relationship_type
        END
    FROM relationships r
    JOIN people p ON p.id = r.person_a_id
    WHERE r.person_b_id = target_person_id;
END;
$$ LANGUAGE plpgsql;

-- Search people with fuzzy matching
CREATE OR REPLACE FUNCTION search_people(query TEXT, max_results INTEGER DEFAULT 20)
RETURNS SETOF people AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM people
    WHERE verified = TRUE
    AND (
        first_name || ' ' || COALESCE(last_name, '') ILIKE '%' || query || '%'
        OR occupation ILIKE '%' || query || '%'
        OR birth_place ILIKE '%' || query || '%'
        OR bio ILIKE '%' || query || '%'
    )
    ORDER BY
        similarity(first_name || ' ' || COALESCE(last_name, ''), query) DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;


-- ─── TRIGGERS ───────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER people_updated BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER clans_updated BEFORE UPDATE ON clans
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER stories_updated BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER profiles_updated BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
