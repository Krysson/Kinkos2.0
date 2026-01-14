# Database Scripts

## Setting Up Admin Access

To ensure you have admin access to the application:

1. **Register an account** through the application's registration page
2. **Open Supabase Dashboard** and go to SQL Editor
3. **Run the set-admin.sql script** after replacing `'your-email@example.com'` with your actual email

Example:
```sql
UPDATE members
SET role = 'owner', status = 'active', member_since = NOW()
WHERE email = 'youremail@example.com';
```

4. **Verify** the update worked by checking the members table
5. **Log out and log back in** to refresh your session with the new role

## Alternative: Set First User as Owner

If you want to automatically make the first registered user an owner, you can run this query:

```sql
-- Make the first member an owner if no owners exist
UPDATE members
SET role = 'owner', status = 'active', member_since = NOW()
WHERE id = (
  SELECT id FROM members
  ORDER BY created_at ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM members WHERE role = 'owner'
);
```

This will only set the first user as owner if no owners currently exist in the system.
