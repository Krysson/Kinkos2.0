# KinkOS 2.0 - Product Requirements Document

**Version:** 1.0  
**Date:** January 2026  
**Status:** MVP In Development

---

## 1. Product Overview

### Vision
Comprehensive venue management platform for The Woodshed Orlando, replacing multiple disparate tools with a unified system.

### Problem Statement
Current operations rely on spreadsheets, paper forms, and disconnected tools for volunteer scheduling, member tracking, and venue operations. This creates inefficiency, data inconsistency, and poor user experience.

### Solution
KinkOS 2.0 provides a single platform handling:
- Volunteer shift scheduling and coordination
- Member management and check-in
- Digital waiver and paperwork
- Venue operations (cleaning, inspections)
- Communication and announcements

### Target Users
| User Type | Description | Primary Needs |
|-----------|-------------|---------------|
| Volunteers | Work shifts, also visit recreationally | View/signup shifts, track hours |
| Members | Recreational visitors | Check-in, view events, access resources |
| Guests | Day-pass visitors | Sign waivers, check-in |
| Leads | Senior volunteers | Approve members, add notes |
| Admins | Operations managers | Full system access |
| Owners | Venue owners | All access + role assignment |

---

## 2. MVP Scope (Phase 1)

### 2.1 Authentication
| Requirement | Priority | Notes |
|-------------|----------|-------|
| Email/password registration | P0 | Supabase Auth |
| Login/logout | P0 | Server-side session |
| Password reset | P0 | Email flow |
| Auto-create member on signup | P0 | DB trigger |
| Protected routes | P0 | Middleware redirect |

### 2.2 Dashboard
| Requirement | Priority | Notes |
|-------------|----------|-------|
| Welcome message (scene name) | P0 | Personalized greeting |
| Upcoming shifts count | P0 | Next 7 days |
| Hours this month | P1 | Calculated from signups |
| Recent announcements (3) | P0 | Unread highlighted |
| Next shift card | P0 | Date, time, title |

### 2.3 Schedule/Shifts
| Requirement | Priority | Notes |
|-------------|----------|-------|
| Month calendar view | P0 | Default view |
| Week view toggle | P1 | Alternative view |
| Day view toggle | P1 | Alternative view |
| Shift cards | P0 | Title, time, spots remaining |
| Sign up for shift | P0 | Capacity enforced |
| Cancel signup | P0 | Own signups only |
| Filter: All/My Shifts/Available | P0 | Quick filters |

### 2.4 Announcements
| Requirement | Priority | Notes |
|-------------|----------|-------|
| List all announcements | P0 | Newest first |
| Read/unread indicators | P0 | Visual distinction |
| Important announcements pinned | P0 | Top of list |
| Mark as read on view | P0 | Auto-mark |
| Mark all as read button | P1 | Bulk action |

### 2.5 Resources
| Requirement | Priority | Notes |
|-------------|----------|-------|
| Category tabs | P0 | Training, Policies, Forms, Safety |
| Search bar | P1 | Filter by title |
| Card grid display | P0 | Title, description, link |
| External link opens new tab | P0 | Target blank |

### 2.6 Contacts
| Requirement | Priority | Notes |
|-------------|----------|-------|
| Table view | P0 | Scene name, role, phone |
| Privacy toggle (own) | P0 | Hide phone/email |
| Search/filter | P1 | By name or role |
| Respect privacy settings | P0 | Don't show hidden |

### 2.7 Profile
| Requirement | Priority | Notes |
|-------------|----------|-------|
| View own profile | P0 | All fields |
| Edit own profile | P0 | Scene name, pronouns, phone |
| Emergency contact | P0 | Name, phone, relationship |
| Privacy settings | P0 | Contact visibility |

### 2.8 Admin Panel
| Requirement | Priority | Notes |
|-------------|----------|-------|
| Role-gated access | P0 | Admin/Owner only |
| User list with roles | P0 | Table view |
| Assign/remove roles | P0 | Dropdown select |
| Create shift | P0 | Title, date, time, capacity |
| Edit/delete shift | P0 | Existing shifts |
| Create announcement | P0 | Title, content, important flag |
| Manage resources | P1 | Add/edit/delete |

---

## 3. Navigation & Layout

### Mobile (< 768px)
- Hamburger menu (top-left)
- Full-screen slide-out navigation
- Bottom nav bar: Home, Schedule, Profile, Menu

### Desktop (≥ 768px)
- Collapsible sidebar (280px expanded, 72px collapsed)
- Persistent header with user avatar, theme toggle
- Main content area with breadcrumbs

### Nav Structure
```
Main
├── Dashboard
├── Schedule
├── Events (Phase 2)
├── Resources
├── Contacts
└── Announcements

Admin (if admin/owner)
├── User Management
├── Shift Management
└── Settings
```

---

## 4. Data Model (MVP)

### members
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PK |
| auth_user_id | UUID | Yes | FK to auth.users |
| legal_name | Text | Yes | Registration |
| scene_name | Text | No | Display name |
| email | Text | Yes | Unique |
| phone | Text | No | Optional |
| pronouns | Text | No | Optional |
| emergency_contact_name | Text | No | Safety |
| emergency_contact_phone | Text | No | Safety |
| member_status | Text | Yes | Default: provisional |
| created_at | Timestamp | Yes | Auto |

### member_roles
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PK |
| member_id | UUID | Yes | FK to members |
| role | Text | Yes | volunteer/lead/admin/owner |

### shifts
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PK |
| title | Text | Yes | Shift name |
| description | Text | No | Details |
| start_time | Timestamp | Yes | Shift start |
| end_time | Timestamp | Yes | Shift end |
| capacity | Integer | Yes | Max signups |
| created_by | UUID | No | FK to members |

### shift_signups
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PK |
| shift_id | UUID | Yes | FK to shifts |
| member_id | UUID | Yes | FK to members |
| signed_up_at | Timestamp | Yes | Auto |

### announcements
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PK |
| title | Text | Yes | Headline |
| content | Text | Yes | Body |
| is_important | Boolean | Yes | Default: false |
| created_by | UUID | No | FK to members |
| created_at | Timestamp | Yes | Auto |

### announcement_reads
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| announcement_id | UUID | Yes | FK |
| member_id | UUID | Yes | FK |
| read_at | Timestamp | Yes | Auto |

### resources
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PK |
| title | Text | Yes | Name |
| description | Text | No | Summary |
| url | Text | Yes | External link |
| category | Text | No | Grouping |

---

## 5. Non-Functional Requirements

### Performance
- Page load < 2 seconds (LCP)
- Shift signup < 500ms response
- Support 50 concurrent users

### Security
- Row Level Security on all tables
- Server-side auth validation
- HTTPS only
- No sensitive data in client

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatible
- Color contrast ratios met

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px
- Touch-friendly targets (44px minimum)

---

## 6. Future Phases (Post-MVP)

### Phase 2: Member Management
- Digital waiver with signature capture
- Member check-in system
- QR code generation
- Occupancy tracking (140 capacity)
- Tablet kiosk mode (PWA)

### Phase 3: Operations
- Cleaning schedules
- Inspection logs
- Event checklists
- Maintenance tracking

### Phase 4: Advanced
- Automated email reminders
- Reporting dashboard
- Incident tracking
- CRM for vendors/educators

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| MVP Feature Complete | 100% | Checklist verification |
| Page Load Time | < 2s | Lighthouse LCP |
| Auth Flow Success | > 95% | Analytics |
| Mobile Usability | Score 90+ | Lighthouse |
| User Adoption | 12 users migrated | Account creation |

---

## 8. Constraints

- Solo developer (Cursor + Claude Code CLI)
- 3-month timeline for MVP
- Fresh start approach (no data migration)
- Limited to Supabase free tier initially
- Must work on Android tablets (PWA)

---

## 9. Glossary

| Term | Definition |
|------|------------|
| Scene Name | Privacy-focused display name (not legal name) |
| Provisional | New member status (first 3 visits) |
| Full Member | After 3 social visits |
| Social Visit | Visiting to participate (not working) |
| Work Shift | Scheduled volunteer work time |
| RLS | Row Level Security (Supabase) |
| PWA | Progressive Web App |

---

## 10. Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial MVP scope |

---

*Reference: See CLAUDE.md for technical implementation details*
