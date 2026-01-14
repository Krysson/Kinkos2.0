-- KinkOS 2.0 Digital Waiver System

-- 1. Waivers Table
CREATE TABLE IF NOT EXISTS waivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    waiver_type TEXT NOT NULL DEFAULT 'member',
    
    -- Agreement flags
    bylaws_agreed BOOLEAN DEFAULT false,
    liability_release_agreed BOOLEAN DEFAULT false,
    dungeon_rules_agreed BOOLEAN DEFAULT false,
    code_of_conduct_agreed BOOLEAN DEFAULT false,
    
    -- Signature info
    signature_svg TEXT NOT NULL, -- Storing SVG path or base64
    initials TEXT NOT NULL,
    
    -- Verification info
    witness_member_id UUID REFERENCES members(id),
    signed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL, -- Usually signed_date + 1 year
    
    -- Identification info (verified by witness)
    id_type TEXT,
    id_verified_dob DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_waivers_member_id ON waivers(member_id);
CREATE INDEX idx_waivers_valid_until ON waivers(valid_until);

-- 2. RLS Policies
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own waivers" ON waivers FOR SELECT
    USING (member_id = get_current_member_id());

CREATE POLICY "Leads and above can view all waivers" ON waivers FOR SELECT
    USING (is_lead_or_above());

CREATE POLICY "Members can insert their own waivers" ON waivers FOR INSERT
    WITH CHECK (member_id = get_current_member_id());

-- 3. Update Member Status when waiver is signed (optional logic)
-- We could have a trigger that marks a member as 'active' if they have a valid waiver.

-- 4. Helper function to check if member has valid waiver
CREATE OR REPLACE FUNCTION has_valid_waiver(m_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM waivers
        WHERE member_id = m_id
        AND valid_until >= CURRENT_DATE
    )
$$ LANGUAGE sql STABLE;
