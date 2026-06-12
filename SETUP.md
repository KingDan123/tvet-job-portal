# TVET Hub - Development Setup Guide

This guide will help you set up the TVET Hub platform for local development.

## Prerequisites

Ensure you have the following installed:

- **Node.js** v20 or higher
- **npm** v10 or higher
- **PostgreSQL** v15 or higher
- **Git**

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd tvet-hub

# Install dependencies
npm install
```

### 2. Configure Environment

The `.env` file is already configured with defaults:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=tvet-hub-secret-key-change-in-production-use-secure-random
JWT_REFRESH_SECRET=tvet-hub-refresh-secret-change-in-production-use-secure-random
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**⚠️ Important:** Change the JWT secrets before deploying to production!

### 3. Set Up Database

```bash
# Ensure PostgreSQL is running
# Create database (if not exists)
createdb app_db

# Push schema to database
npm run db:push

# Seed sample data (optional but recommended)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

## Sample Login Credentials

After seeding, use these credentials to test different portals:

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Admin | admin@gwptc.edu.et | admin123 | /dashboard/admin |
| ILJC Officer | officer@gwptc.edu.et | officer123 | /dashboard/officer |
| Trainee | abebe.kebede@student.et | trainee123 | /dashboard/trainee |
| Company | hr@ethioconstruction.et | company123 | /dashboard/company |

## Project Structure

```
tvet-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (serverless functions)
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── jobs/          # Job management
│   │   │   ├── applications/  # Application management
│   │   │   └── trainees/      # Trainee profile
│   │   ├── auth/              # Auth pages (login, register)
│   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── trainee/       # Trainee portal
│   │   │   ├── company/       # Company portal
│   │   │   ├── officer/       # ILJC officer portal
│   │   │   └── admin/         # Admin portal
│   │   ├── pricing/           # Pricing page
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── db/
│   │   ├── schema.ts          # Drizzle ORM schema
│   │   └── index.ts           # Database client
│   └── lib/
│       ├── auth.ts            # Authentication utilities
│       ├── matching.ts        # Job-trainee matching algorithm
│       ├── subscription.ts    # Freemium logic
│       ├── middleware.ts      # API middleware (auth, RBAC)
│       └── types.ts           # TypeScript types
├── scripts/
│   └── seed.ts                # Database seeding script
├── .env                       # Environment variables
├── package.json
├── tsconfig.json
├── README.md
└── SETUP.md (this file)
```

## Database Schema Overview

### Core Tables

- **users** - All system users (multi-role)
- **institutions** - TVET colleges
- **traineeProfiles** - Graduate profiles
- **companies** - Employers
- **jobs** - Job postings
- **applications** - Job applications
- **skills** - Skill taxonomy
- **traineeSkills** - Trainee-skill mapping

### FLW Workflow Tables

- **referrals** - ILJC officer referrals (FLW-5)
- **trainingSessions** - Pre-employment training (FLW-3)
- **sessionAttendance** - Training attendance
- **employerContacts** - CRM (FLW-4)
- **placements** - Employment tracking (FLW-9)
- **placementFollowups** - 30/60/90 day check-ins (FLW-8)
- **tracerSurveys** - Labor market research (FLW-10)
- **auditLog** - Complete audit trail

## Development Workflow

### Making Schema Changes

1. Edit `src/db/schema.ts`
2. Run `npm run db:push` to apply changes
3. Re-seed if needed: `npm run db:seed`

### Testing API Endpoints

Use tools like **Postman** or **curl**:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "trainee",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Fetch jobs (authenticated)
curl http://localhost:3000/api/jobs \
  -H "Authorization: Bearer <your-access-token>"
```

### TypeScript Type Checking

```bash
# Check types without emitting files
npm run typecheck

# Watch mode (useful during development)
npx tsc --noEmit --watch
```

### Building for Production

```bash
# Build the app
npm run build

# Start production server
npm run start
```

## Common Tasks

### Add a New API Endpoint

1. Create route file: `src/app/api/your-endpoint/route.ts`
2. Implement GET/POST/PUT/DELETE handlers
3. Add authentication middleware if needed
4. Document in README

Example:

```typescript
// src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof NextResponse) return user;

  return NextResponse.json({
    success: true,
    data: { message: 'Hello from your endpoint!' },
  });
}
```

### Add a New Dashboard Page

1. Create page: `src/app/dashboard/your-role/your-page/page.tsx`
2. Use `'use client'` directive for client components
3. Add auth check in useEffect
4. Link from sidebar navigation

### Add a New Database Table

1. Define in `src/db/schema.ts`:

```typescript
export const yourTable = pgTable('your_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

2. Add relations if needed
3. Run `npm run db:push`

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** Ensure PostgreSQL is running:

```bash
# Check status
pg_ctl status

# Start PostgreSQL
pg_ctl start

# Or on macOS with Homebrew
brew services start postgresql@15
```

### Build Errors

```
Type error: Cannot find module '@/db'
```

**Solution:** Run type generation:

```bash
npx next typegen
```

### Seed Script Fails

```
Error: duplicate key value violates unique constraint
```

**Solution:** Clear database and re-seed:

```bash
# Drop and recreate database
dropdb app_db
createdb app_db

# Push schema and seed
npm run db:push
npm run db:seed
```

## Next Steps

After setup, explore:

1. **Landing Page**: http://localhost:3000
2. **Register**: http://localhost:3000/auth/register
3. **Trainee Dashboard**: Login as trainee
4. **Company Dashboard**: Login as company
5. **Browse Jobs**: http://localhost:3000/dashboard/trainee/jobs
6. **Pricing Page**: http://localhost:3000/pricing

## Testing Workflow (10-Step FLW)

To test the complete GWPTC employment procedure:

1. **FLW-1**: Login as officer → view graduate catalog
2. **FLW-2**: Select graduates for employment track
3. **FLW-3**: Create training session → invite trainees
4. **FLW-4**: Add employer contacts (CRM)
5. **FLW-5**: Generate referral letter for trainee
6. **FLW-6**: View matching algorithm scores
7. **FLW-7**: Approve and send letters
8. **FLW-8**: Collect placement feedback
9. **FLW-9**: Schedule 30/60/90 day follow-ups
10. **FLW-10**: Export audit trail for MoE

## Performance Tips

- Use `npm run dev -- --turbo` for faster dev builds
- Clear `.next` folder if you see caching issues: `rm -rf .next`
- Monitor database queries in PostgreSQL logs
- Use React DevTools for component profiling

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test thoroughly
4. Run `npm run typecheck` and `npm run build`
5. Submit pull request

## Support

For issues or questions:

- Check README.md for architecture details
- Review existing API routes in `src/app/api/`
- Check schema definitions in `src/db/schema.ts`
- Contact: iljc@gwptc.edu.et

---

**Happy Coding! 🚀**
