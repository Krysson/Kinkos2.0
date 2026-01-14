# KinkOS 2.0 - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git for version control

## 1. Initial Setup

### Clone and Install Dependencies

```bash
# Install dependencies
npm install

# Verify installation
npm run build
```

## 2. Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish initializing (takes ~2 minutes)
3. Go to Project Settings → API
4. Copy the following values:
   - Project URL (starts with `https://`)
   - Anon/Public Key (starts with `eyJ`)

### 2.2 Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 Run Database Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)

You should see "Success. No rows returned" - this is expected!

### 2.4 Verify Database Setup

In the SQL Editor, run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see these tables:
- members
- shifts
- shift_signups
- announcements
- announcement_reads
- resources
- app_settings

## 3. Setting Up Admin Access

### 3.1 Register Your Account

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser
3. Click "Sign up" and register with your email
4. Check your email for the confirmation link and click it
5. Log in with your new account

### 3.2 Grant Admin Access

1. Go to your Supabase Dashboard → SQL Editor
2. Run this query (replace with your email):

```sql
UPDATE members
SET role = 'owner', status = 'active', member_since = NOW()
WHERE email = 'your-email@example.com';
```

3. Verify the update:

```sql
SELECT id, email, display_name, role, status
FROM members
WHERE email = 'your-email@example.com';
```

You should see your account with role = 'owner' and status = 'active'

### 3.3 Refresh Your Session

1. Log out of the application
2. Log back in
3. You should now see "Admin" section in the sidebar/menu

## 4. Development Workflow

### Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Project Structure

```
app/
├── (auth)/           # Public authentication pages
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/      # Protected user pages
│   ├── dashboard/    # Main dashboard
│   ├── schedule/     # Shift calendar
│   ├── announcements/
│   ├── resources/
│   ├── contacts/
│   └── profile/
└── (admin)/          # Admin-only pages
    └── admin/
        ├── page.tsx         # Admin dashboard
        ├── members/         # User management
        ├── shifts/          # Shift management
        └── announcements/   # Create announcements

components/
├── ui/              # shadcn/ui components
├── layout/          # Sidebar, header, navigation
├── admin/           # Admin-specific components
├── profile/         # Profile management
└── schedule/        # Shift-related components

lib/
├── types.ts         # TypeScript type definitions
├── utils.ts         # Helper functions
└── supabase/        # Supabase client setup
    ├── client.ts    # Browser client
    ├── server.ts    # Server client
    └── middleware.ts
```

## 5. Testing the Application

### Test User Flow

1. **Registration**: Create a test account
2. **Dashboard**: View the main dashboard
3. **Profile**: Update your profile information
4. **Contacts**: View member directory (may be empty initially)
5. **Resources**: View resources (will be empty until added)
6. **Announcements**: View announcements (will be empty until created)

### Test Admin Flow

1. **Admin Dashboard**: Access at `/admin`
2. **Member Management**: Go to Admin → Members
   - View all registered members
   - Change user roles
3. **Shift Management**: Go to Admin → Shifts
   - Create a new shift
   - View upcoming shifts
4. **Announcements**: Go to Admin → Announcements
   - Create a test announcement
   - Set priority and publish settings

## 6. Common Issues & Solutions

### Issue: "Invalid JWT" or Authentication Errors

**Solution**: Clear your browser cookies and local storage, then log in again.

```javascript
// Run this in browser console:
localStorage.clear();
```

Then refresh the page.

### Issue: Admin Menu Not Showing

**Solution**:
1. Verify your role in the database (see 3.2)
2. Log out and log back in to refresh session
3. Check browser console for errors

### Issue: Database Connection Errors

**Solution**:
1. Verify your `.env.local` file has correct values
2. Restart the dev server after changing environment variables
3. Check Supabase project status (it might be paused on free tier)

### Issue: Tables Don't Exist

**Solution**:
1. Re-run the database migration script
2. Check for errors in the Supabase SQL Editor
3. Verify you're using the correct project

## 7. Adding Seed Data (Optional)

To populate the database with test data:

```sql
-- Add test shifts
INSERT INTO shifts (title, description, start_time, end_time, max_volunteers, status) VALUES
('Setup Crew', 'Help set up the venue before the event', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 3 hours', 5, 'open'),
('Door Staff', 'Check in guests at the entrance', NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days 4 hours', 2, 'open'),
('Cleanup Crew', 'Help clean up after the event', NOW() + INTERVAL '9 days', NOW() + INTERVAL '9 days 2 hours', 4, 'open');

-- Add test announcements (replace 'admin@example.com' with your email)
INSERT INTO announcements (title, content, priority, is_published, created_by)
SELECT
  'Welcome to KinkOS!',
  'This is your venue management system. Check out the schedule and sign up for shifts!',
  'high',
  true,
  id
FROM members
WHERE email = 'admin@example.com';

-- Add test resources
INSERT INTO resources (title, description, url, category, is_active) VALUES
('Safety Guidelines', 'Read our safety and consent guidelines', 'https://example.com/safety', 'policies', true),
('Volunteer Training', 'Training materials for new volunteers', 'https://example.com/training', 'training', true),
('Waiver Form', 'Download and complete the liability waiver', 'https://example.com/waiver', 'forms', true);
```

## 8. Production Deployment (Vercel)

### Prerequisites
- GitHub repository
- Vercel account (free)

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Supabase for Production**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add `https://your-domain.vercel.app/**` to "Redirect URLs"

## 9. Next Steps

After completing setup:

1. **Customize Branding**: Update venue name in `lib/supabase/client.ts` and components
2. **Add Resources**: Populate the resources table with training materials
3. **Create Shifts**: Set up your first volunteer shifts
4. **Invite Members**: Share the registration link with your team
5. **Configure Settings**: Adjust app settings in the database

## 10. Getting Help

- Check the [PRD.md](./PRD.md) for feature specifications
- Review [CLAUDE.md](./CLAUDE.md) for technical implementation details
- Report issues on GitHub

## 11. Security Notes

- Never commit `.env.local` to version control
- Keep your Supabase service role key secret (not used in this app)
- Enable Row Level Security (RLS) - already configured in migration
- Regularly update dependencies: `npm update`
- Use strong passwords for admin accounts
