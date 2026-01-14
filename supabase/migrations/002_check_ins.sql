-- KinkOS 2.0 Check-In System

-- 1. Check-ins Table
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    check_in_type TEXT NOT NULL DEFAULT 'social_visit',
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    checked_in_by UUID REFERENCES members(id),
    checked_out_by UUID REFERENCES members(id),
    counts_toward_capacity BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_check_ins_member_id ON check_ins(member_id);
CREATE INDEX idx_check_ins_active ON check_ins(check_in_time) WHERE check_out_time IS NULL;
CREATE INDEX idx_check_ins_shift_id ON check_ins(shift_id);

-- 2. Occupancy Function
CREATE OR REPLACE FUNCTION get_current_occupancy()
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM check_ins
    WHERE check_out_time IS NULL AND counts_toward_capacity = true;
$$ LANGUAGE sql STABLE;

-- 3. RLS Policies
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view check-ins" ON check_ins FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Leads and above can manage check-ins" ON check_ins FOR ALL
    USING (is_lead_or_above());

-- 4. Update Member Status on Check-In (Optional logic/triggers can go here)
-- For now, we'll handle visit counts in the application layer OR via a trigger.
-- Let's add visit counts to members table if not already there, or just calculate on the fly.
-- PRD mentioned social visit count and total visit count.

ALTER TABLE members ADD COLUMN IF NOT EXISTS social_visit_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS total_visit_count INTEGER DEFAULT 0;

-- Trigger to increment visit counts on check-in
CREATE OR REPLACE FUNCTION increment_visit_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_in_type = 'social_visit' THEN
        UPDATE members SET 
            social_visit_count = social_visit_count + 1,
            total_visit_count = total_visit_count + 1
        WHERE id = NEW.member_id;
    ELSE
        UPDATE members SET 
            total_visit_count = total_visit_count + 1
        WHERE id = NEW.member_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_check_in_increment_counts ON check_ins;
CREATE TRIGGER on_check_in_increment_counts
    AFTER INSERT ON check_ins
    FOR EACH ROW EXECUTE FUNCTION increment_visit_counts();
