# TVET Hub - Quick Start Guide

**Fast-track setup in 3 minutes** ⚡

## Prerequisites

- Node.js 20+
- PostgreSQL 15+

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Push database schema
npm run db:push

# 3. Seed sample data
npm run db:seed

# 4. Start development server
npm run dev
```

Visit **http://localhost:3000**

## Test Accounts

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| 🎓 Trainee | abebe.kebede@student.et | trainee123 | Browse jobs, apply, track status |
| 💼 Company | hr@ethioconstruction.et | company123 | Post jobs, review applications |
| 👨‍💼 Officer | officer@gwptc.edu.et | officer123 | Manage referrals, training |
| 🔧 Admin | admin@gwptc.edu.et | admin123 | Analytics, settings |

## Key Features Implemented ✅

### For Graduates
- ✅ Profile creation with skills & certifications
- ✅ Job search with filters (sector, region, type)
- ✅ One-click job applications
- ✅ Application status tracking
- ✅ Match scoring (field, skills, location)

### For Employers
- ✅ Job posting with multi-language support
- ✅ Freemium subscription tiers (Free, Pro, Business, Enterprise)
- ✅ Application management
- ✅ Subscription limits enforcement (Free = 3 jobs)

### Backend
- ✅ JWT authentication (access + refresh tokens)
- ✅ Role-based access control (4 roles)
- ✅ Complete database schema (22 tables)
- ✅ Matching algorithm (0-100 scoring)
- ✅ Multi-language data (EN/AM/OM)
- ✅ Audit logging
- ✅ GWPTC 10-step FLW workflow foundation

## API Endpoints

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "role": "trainee",
  "fullName": "Full Name"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Browse Jobs
GET /api/jobs?sector=Construction&region=Addis%20Ababa

# Apply to Job (requires auth)
POST /api/applications
Headers: { "Authorization": "Bearer <token>" }
{
  "jobId": "uuid-here"
}

# Update Profile (requires auth)
PUT /api/trainees/profile
Headers: { "Authorization": "Bearer <token>" }
{
  "program": "Automotive Technology",
  "graduationYear": 2024
}
```

## Project Structure

```
src/
├── app/
│   ├── api/               # API routes
│   ├── auth/              # Login/Register
│   ├── dashboard/         # Role-based dashboards
│   ├── pricing/           # Pricing page
│   └── page.tsx           # Landing page
├── db/
│   ├── schema.ts          # 22 tables, enums, relations
│   └── index.ts           # Drizzle client
└── lib/
    ├── auth.ts            # JWT, bcrypt
    ├── matching.ts        # Algorithm
    ├── subscription.ts    # Freemium logic
    └── middleware.ts      # RBAC
```

## Next Steps (Phase 2-5)

- [ ] ILJC Officer portal (referral letters, CRM)
- [ ] Admin analytics dashboard
- [ ] Chapa payment integration
- [ ] SMS/Email notifications
- [ ] CV auto-generation (PDF)
- [ ] Multi-college federation
- [ ] Mobile app (React Native)

## Commands Cheat Sheet

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run db:push      # Apply schema changes
npm run db:seed      # Seed sample data
```

## Support

📖 Full documentation: See **README.md**  
🔧 Setup guide: See **SETUP.md**  
📧 Email: iljc@gwptc.edu.et

---

**Built for Ethiopia's TVET Community** 🇪🇹
