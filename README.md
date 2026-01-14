# KinkOS 2.0

<p align="center">
  <strong>Comprehensive Venue Management Platform</strong><br>
  Shift scheduling • Member management • Venue operations
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/license/MIT-green?style=flat-square" alt="License" />
</p>

---

## Overview

KinkOS 2.0 is a full-stack venue management system designed for private membership clubs. It streamlines volunteer coordination, member tracking, and day-to-day venue operations in a single, mobile-first platform.

Built with modern web technologies, KinkOS replaces spreadsheets and disconnected tools with an intuitive interface that works seamlessly on phones, tablets, and desktops.

---

## Features

### For Volunteers

- 📅 **Shift Scheduling** — Browse and sign up for available shifts with real-time capacity tracking
- 📊 **Personal Dashboard** — View upcoming shifts, hours worked, and recent announcements
- 👥 **Contact Directory** — Connect with other volunteers (privacy-controlled)
- 📚 **Resource Library** — Access training materials, policies, and forms
- 🔔 **Announcements** — Stay updated with important venue news

### For Administrators

- 👤 **User Management** — Assign roles, manage accounts, view member status
- ✏️ **Shift Management** — Create, edit, duplicate, and delete shifts
- 📢 **Announcement System** — Broadcast messages with read tracking
- 📁 **Resource Management** — Organize and share documents
- 🔒 **Role-Based Access** — Granular permissions (Volunteer → Lead → Admin → Owner)

### Technical Highlights

- 📱 **Mobile-First Design** — Optimized for all screen sizes
- 🌙 **Dark/Light Theme** — System-aware theme switching
- ⚡ **Real-Time Updates** — Live data with React Query
- 🔐 **Secure Authentication** — Server-side auth with Supabase
- 🛡️ **Row Level Security** — Database-enforced access control

---

## Tech Stack

| Layer                | Technology               |
| -------------------- | ------------------------ |
| **Framework**        | Next.js 14+ (App Router) |
| **Language**         | TypeScript (strict mode) |
| **Database**         | Supabase (PostgreSQL)    |
| **Authentication**   | Supabase Auth            |
| **UI Components**    | shadcn/ui + Radix UI     |
| **Styling**          | Tailwind CSS             |
| **State Management** | TanStack React Query 5.x |
| **Forms**            | React Hook Form + Zod    |
| **Icons**            | Lucide React             |
| **Hosting**          | Vercel                   |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account ([supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Krysson/Kinkos2.0.git
   cd Kinkos2.0
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the SQL migrations in your Supabase SQL Editor. See `docs/` or `supabase/migrations/` for schema files.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
Kinkos2.0/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, register (public routes)
│   ├── (dashboard)/        # Main app (protected routes)
│   ├── (admin)/            # Admin panel (role-gated)
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Sidebar, header, navigation
│   └── [feature]/          # Feature-specific components
│
├── lib/
│   ├── supabase/           # Supabase client configuration
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
│
├── hooks/
│   ├── use-auth.ts         # Authentication hook
│   └── queries/            # React Query hooks
│
├── public/                 # Static assets
├── CLAUDE.md               # AI assistant context
├── PRD.md                  # Product requirements
└── README.md
```

---

## Available Scripts

| Command                             | Description              |
| ----------------------------------- | ------------------------ |
| `npm run dev`                       | Start development server |
| `npm run build`                     | Build for production     |
| `npm run start`                     | Start production server  |
| `npm run lint`                      | Run ESLint               |
| `npx shadcn@latest add [component]` | Add shadcn component     |

---

## Environment Variables

| Variable                        | Required | Description            |
| ------------------------------- | -------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key |

---

## Database Schema

KinkOS uses the following core tables:

| Table                | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `members`            | All users (volunteers, admins, members, guests) |
| `member_roles`       | Role assignments per member                     |
| `shifts`             | Scheduled volunteer shifts                      |
| `shift_signups`      | Member-shift associations                       |
| `announcements`      | Broadcast messages                              |
| `announcement_reads` | Read tracking per user                          |
| `resources`          | Document/link library                           |

See [PRD.md](./PRD.md) for detailed schema documentation.

---

## Role Hierarchy

| Role          | Permissions                                 |
| ------------- | ------------------------------------------- |
| **Owner**     | Full access, assign any role                |
| **Admin**     | Operational control, ban/suspend members    |
| **Lead**      | Approve members, add notes, enhanced access |
| **Volunteer** | View/signup shifts, basic access            |

---

## Roadmap

- [x] **Phase 1: MVP** — Auth, shifts, announcements, resources, contacts
- [ ] **Phase 2: Member Management** — Check-in, waivers, QR codes, kiosk mode
- [ ] **Phase 3: Operations** — Cleaning schedules, inspections, event checklists
- [ ] **Phase 4: Advanced** — Email automation, reporting, CRM

---

## Contributing

This is a private project for The Woodshed Orlando. If you're a team member:

1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Make your changes
3. Run linting (`npm run lint`)
4. Commit with descriptive messages
5. Push and create a Pull Request

---

## Documentation

| Document                 | Description                                   |
| ------------------------ | --------------------------------------------- |
| [CLAUDE.md](./CLAUDE.md) | Technical context for AI-assisted development |
| [PRD.md](./PRD.md)       | Product requirements and specifications       |

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

<p align="center">
  <strong>KinkOS 2.0</strong><br>
  <em>Developed by <a href="https://krysson.com">Krysson Consulting</a></em>
</p>
