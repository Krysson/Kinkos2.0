-- Script to set a user as owner/admin
-- Replace 'your-email@example.com' with your actual email address
-- Run this in Supabase SQL Editor

-- Update the member's role to 'owner' by email
UPDATE members
SET role = 'owner', status = 'active', member_since = NOW()
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, display_name, role, status, member_since
FROM members
WHERE email = 'your-email@example.com';
