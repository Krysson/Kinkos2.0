-- KinkOS 2.0 Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- DROP EXISTING TABLES (if re-running)
-- ===========================================
DROP TABLE IF EXISTS announcement_reads CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS shift_signups CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

DROP TYPE IF EXISTS member_role CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS shift_status CASCADE;
DROP TYPE IF EXISTS announcement_priority CASCADE;
DROP TYPE IF EXISTS resource_category CASCADE;

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE member_role AS ENUM ('member', 'volunteer', 'lead', 'admin', 'owner');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE shift_status AS ENUM ('open', 'full', 'completed', 'cancelled');
CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE resource_category AS ENUM ('policies', 'training', 'forms', 'links', 'other');

-- ===========================================
-- MEMBERS TABLE
-- ===========================================

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile Info
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    legal_name TEXT,
    pronouns TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- Membership
    role member_role DEFAULT 'member',
    status member_status DEFAULT 'pending',
    member_since TIMESTAMPTZ,

    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,

    -- Privacy
    show_in_contacts BOOLEAN DEFAULT true,
    show_phone BOOLEAN DEFAULT false,
    show_email BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_auth_id ON members(auth_id);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_email ON members(email);

-- ===========================================
-- SHIFTS TABLE
-- ===========================================

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT DEFAULT 'The Woodshed Orlando',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    min_volunteers INT DEFAULT 1,
    max_volunteers INT NOT NULL,
    status shift_status DEFAULT 'open',
    created_by UUID REFERENCES members(id),
    lead_volunteer UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shifts_start_time ON shifts(start_time);
CREATE INDEX idx_shifts_end_time ON shifts(end_time);
CREATE INDEX idx_shifts_status ON shifts(status);

-- ===========================================
-- SHIFT SIGNUPS (Many-to-Many)
-- ===========================================

CREATE TABLE shift_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    signed_up_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    notes TEXT,
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    no_show BOOLEAN DEFAULT false,
    UNIQUE(shift_id, member_id)
);

CREATE INDEX idx_shift_signups_shift ON shift_signups(shift_id);
CREATE INDEX idx_shift_signups_member ON shift_signups(member_id);
CREATE INDEX idx_shift_signups_active ON shift_signups(shift_id, member_id) WHERE cancelled_at IS NULL;

-- ===========================================
-- ANNOUNCEMENTS TABLE
-- ===========================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority announcement_priority DEFAULT 'normal',
    is_published BOOLEAN DEFAULT true,
    publish_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    target_roles member_role[],
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON announcements(is_published, publish_at);
CREATE INDEX idx_announcements_priority ON announcements(priority);

-- ===========================================
-- ANNOUNCEMENT READS
-- ===========================================

CREATE TABLE announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(announcement_id, member_id)
);

CREATE INDEX idx_announcement_reads_member ON announcement_reads(member_id);
CREATE INDEX idx_announcement_reads_announcement ON announcement_reads(announcement_id);

-- ===========================================
-- RESOURCES TABLE
-- ===========================================

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    category resource_category DEFAULT 'other',
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    required_roles member_role[],
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_active ON resources(is_active);

-- ===========================================
-- APP SETTINGS
-- ===========================================

CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES members(id)
);

-- Seed initial settings
INSERT INTO app_settings (key, value, description) VALUES
    ('venue_name', '"The Woodshed Orlando"', 'Display name of the venue'),
    ('venue_address', '"Orlando, FL"', 'Venue address'),
    ('contact_email', '"info@thewoodshedorlando.com"', 'Primary contact email'),
    ('membership_enabled', 'true', 'Whether new memberships are accepted'),
    ('volunteer_signup_enabled', 'true', 'Whether volunteer signup is open');

-- ===========================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- AUTO-CREATE MEMBER ON AUTH SIGNUP
-- ===========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.members (auth_id, email, display_name, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        'pending'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- HELPER FUNCTIONS FOR RLS
-- ===========================================

CREATE OR REPLACE FUNCTION get_current_member_id()
RETURNS UUID AS $$
    SELECT id FROM members WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM members
        WHERE auth_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_lead_or_above()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM members
        WHERE auth_id = auth.uid()
        AND role IN ('lead', 'admin', 'owner')
    )
$$ LANGUAGE sql SECURITY DEFINER;

-- ===========================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- MEMBERS POLICIES
-- ===========================================

CREATE POLICY "Members can view own profile" ON members FOR SELECT
    USING (auth_id = auth.uid());

CREATE POLICY "Members can view active members in directory" ON members FOR SELECT
    USING (status = 'active' AND show_in_contacts = true);

CREATE POLICY "Admins can view all members" ON members FOR SELECT
    USING (is_admin());

CREATE POLICY "Members can update own profile" ON members FOR UPDATE
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Admins can update any member" ON members FOR UPDATE
    USING (is_admin());

CREATE POLICY "System can insert members" ON members FOR INSERT
    WITH CHECK (auth_id = auth.uid());

-- ===========================================
-- SHIFTS POLICIES
-- ===========================================

CREATE POLICY "Authenticated can view shifts" ON shifts FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Leads can create shifts" ON shifts FOR INSERT
    WITH CHECK (is_lead_or_above());

CREATE POLICY "Leads can update shifts" ON shifts FOR UPDATE
    USING (is_lead_or_above());

CREATE POLICY "Admins can delete shifts" ON shifts FOR DELETE
    USING (is_admin());

-- ===========================================
-- SHIFT SIGNUPS POLICIES
-- ===========================================

CREATE POLICY "Members can view signups" ON shift_signups FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can signup for shifts" ON shift_signups FOR INSERT
    WITH CHECK (member_id = get_current_member_id());

CREATE POLICY "Members can update own signups" ON shift_signups FOR UPDATE
    USING (member_id = get_current_member_id());

CREATE POLICY "Admins can manage all signups" ON shift_signups FOR ALL
    USING (is_admin());

-- ===========================================
-- ANNOUNCEMENTS POLICIES
-- ===========================================

CREATE POLICY "Members can view published announcements" ON announcements FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND is_published = true
        AND (publish_at IS NULL OR publish_at <= NOW())
        AND (expires_at IS NULL OR expires_at > NOW())
    );

CREATE POLICY "Admins can view all announcements" ON announcements FOR SELECT
    USING (is_admin());

CREATE POLICY "Leads can create announcements" ON announcements FOR INSERT
    WITH CHECK (is_lead_or_above());

CREATE POLICY "Leads can update announcements" ON announcements FOR UPDATE
    USING (is_lead_or_above());

CREATE POLICY "Admins can delete announcements" ON announcements FOR DELETE
    USING (is_admin());

-- ===========================================
-- ANNOUNCEMENT READS POLICIES
-- ===========================================

CREATE POLICY "Members can view own reads" ON announcement_reads FOR SELECT
    USING (member_id = get_current_member_id());

CREATE POLICY "Members can mark announcements as read" ON announcement_reads FOR INSERT
    WITH CHECK (member_id = get_current_member_id());

CREATE POLICY "Admins can view all reads" ON announcement_reads FOR SELECT
    USING (is_admin());

-- ===========================================
-- RESOURCES POLICIES
-- ===========================================

CREATE POLICY "Members can view active resources" ON resources FOR SELECT
    USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can view all resources" ON resources FOR SELECT
    USING (is_admin());

CREATE POLICY "Leads can manage resources" ON resources FOR ALL
    USING (is_lead_or_above());

-- ===========================================
-- APP SETTINGS POLICIES
-- ===========================================

CREATE POLICY "Authenticated can read settings" ON app_settings FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can modify settings" ON app_settings FOR ALL
    USING (is_admin());

-- ===========================================
-- SEED DATA FOR DEVELOPMENT (OPTIONAL)
-- ===========================================

-- Uncomment to add test data
-- INSERT INTO members (email, display_name, role, status, member_since) VALUES
--     ('admin@example.com', 'Admin User', 'owner', 'active', NOW()),
--     ('volunteer@example.com', 'Volunteer User', 'volunteer', 'active', NOW());

-- INSERT INTO shifts (title, description, start_time, end_time, max_volunteers, status) VALUES
--     ('Setup Crew', 'Help set up the venue before the event', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 3 hours', 5, 'open'),
--     ('Door Staff', 'Check in guests at the entrance', NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days 4 hours', 2, 'open');

-- INSERT INTO announcements (title, content, priority, is_published) VALUES
--     ('Welcome to KinkOS!', 'This is your venue management system. Check out the schedule and sign up for shifts!', 'high', true),
--     ('Safety Reminder', 'Please review the safety protocols in the Resources section.', 'normal', true);

-- ===========================================
-- COMPLETED
-- ===========================================

-- Schema creation complete!
-- Next steps:
-- 1. Generate TypeScript types: npx supabase gen types typescript --project-id your-project-id > types/database.types.ts
-- 2. Set up your .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 3. Test authentication flow
