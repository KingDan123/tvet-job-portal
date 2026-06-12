# TVET Hub - National Job Portal for Ethiopia

A comprehensive employment facilitation platform connecting TVET (Technical and Vocational Education and Training) graduates with employers across Ethiopia.

## 🎯 Overview

**Organization:** General Wingate Polytechnic College (GWPTC) - Industry Linkage & Job Creation (ILJC)  
**Scope:** National TVET Network · Ethiopia  
**Document Reference:** OP-GWPTC-ILJC-002 — Employment Facilitation Procedure (Issue 1, Dec. 2025)

### Key Features

- 🎓 **For TVET Graduates**: Build profiles, search jobs, track applications, receive ILJC referrals
- 💼 **For Employers**: Post jobs, search candidates, freemium subscription model
- 👨‍💼 **For ILJC Officers**: Case management, matching algorithm, referral letters, CRM
- 📊 **For Admins**: Analytics, tracer studies, multi-college federation, MoE reporting
- 🌍 **Multi-language**: English, Amharic (አማርኛ), Afaan Oromo

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL 15 with Drizzle ORM
- **Authentication**: JWT (access + refresh tokens), bcrypt
- **Matching Algorithm**: Custom scoring system (field, skills, location, recency)

### Database Schema

The schema implements all 10 FLW (workflow) steps from the GWPTC procedure:

- **Users & Roles**: Multi-role auth (trainee, company, officer, admin)
- **Trainee Profiles**: Skills, certifications, employment preferences
- **Companies**: Subscription tiers, verification status, employer badges
- **Jobs**: Multi-language support, field-of-study tags, expiry
- **Applications**: Status tracking, match scoring
- **Referrals**: ILJC officer letters, follow-up tracking (FLW-5)
- **Training Sessions**: Pre-employment training (FLW-3)
- **Placements**: 30/60/90 day follow-ups (FLW-8, FLW-9)
- **Tracer Surveys**: Labor market research (FLW-10)
- **Audit Log**: Complete activity trail

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd tvet-hub
npm install
```

2. **Set up environment variables:**

Create a `.env` file (already exists with defaults):

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. **Set up database:**

```bash
# Push schema to database
npx drizzle-kit push
```

4. **Run development server:**

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📋 User Roles & Portals

### 1. Trainee Portal (`/dashboard/trainee`)

**Access**: TVET students and graduates

- ✅ Create profile with skills, certifications, preferences
- ✅ Browse and filter job listings
- ✅ One-click job applications with match scoring
- ✅ Track application status pipeline
- 🔄 Training session calendar
- 🔄 CV auto-generation (PDF)
- 🔄 Receive ILJC referrals

### 2. Company Portal (`/dashboard/company`)

**Access**: Employers, MSBs, industries

- ✅ Create and manage job postings
- ✅ Freemium subscription model (Free, Professional, Business, Enterprise)
- 🔄 Review applications
- 🔄 Advanced candidate search (Premium)
- 🔄 Direct messaging (Premium)
- 🔄 Analytics dashboard (Business+)

**Subscription Tiers:**

| Tier | Price (ETB/mo) | Job Posts | Features |
|------|----------------|-----------|----------|
| Free | 0 | 3 active | Basic search only |
| Professional | 500 | Unlimited | Advanced search, messaging, verified badge |
| Business | 1,500 | Unlimited | + Analytics, bulk export |
| Enterprise | Custom | Unlimited | + API access, dedicated officer |

### 3. ILJC Officer Portal (`/dashboard/officer`)

**Access**: Employment officers, vocational counselors

**10-Step FLW Workflow Implementation:**

- FLW-1: Graduate catalog with filters
- FLW-2: Opt-in selection for employment track
- FLW-3: Training session management + attendance
- FLW-4: Employer CRM (contacts, visits, agreements)
- FLW-5: Referral letter generator (PDF)
- FLW-6: Smart matching algorithm (field + skills + location + recency)
- FLW-7: Letter template approval workflow
- FLW-8: Post-placement feedback collection
- FLW-9: 30/60/90 day follow-up scheduler
- FLW-10: Audit trail + export for MoE

### 4. Admin Portal (`/dashboard/admin`)

**Access**: College deans, MoE officials

- 🔄 System-wide analytics (placement rates, sector trends)
- 🔄 Company verification queue
- 🔄 Multi-institution federation
- 🔄 Tracer study builder
- 🔄 Revenue dashboard
- 🔄 Audit log viewer

## 🧮 Matching Algorithm

The system scores trainee-job compatibility (0-100 points):

```javascript
Score = (Field Match × 40) + (Skill Overlap × 30) + (Location Match × 20) + (Recency × 10)
```

- **Field Match**: Program alignment (e.g., Automotive Technology → Mechanic job)
- **Skill Overlap**: % of required skills the trainee has
- **Location Match**: Region/zone proximity preference
- **Recency**: Favors recent graduates (≤1 year = 100%, 1-3 years = 70%, 3+ = 40%)

ILJC officers see scores and can manually override matches.

## 🔐 API Endpoints

### Authentication

```
POST /api/auth/register    - User registration
POST /api/auth/login       - Login (returns JWT)
POST /api/auth/refresh     - Refresh access token
```

### Jobs

```
GET  /api/jobs             - List jobs (with filters)
POST /api/jobs             - Create job (company only)
GET  /api/jobs/:id         - Job details
```

### Applications

```
POST /api/applications     - Submit application (trainee)
GET  /api/applications     - Get user's applications
```

### Trainees

```
GET  /api/trainees/profile - Get profile
PUT  /api/trainees/profile - Update profile
```

All protected routes require `Authorization: Bearer <token>` header.

## 🌐 Internationalization (i18n)

The platform supports three languages:

- **English (en)**: Primary
- **Amharic (አማርኛ)**: Full UI + notifications
- **Afaan Oromo (om)**: Full UI + notifications

Multi-language fields in database:
- Job titles: `titleEn`, `titleAm`, `titleOm`
- Job descriptions: `descriptionEn`, `descriptionAm`, `descriptionOm`
- Skill names: `nameEn`, `nameAm`, `nameOm`

## 💰 Monetization Model

### Why Companies Pay

1. **Recruitment cost reduction**: Average cost-per-hire in Ethiopia is ETB 3,000-15,000. Premium subscription (ETB 1,500/mo) breaks even after one hire.
2. **Quality signaling**: Verified skills, competency-based profiles, pre-employment training badges.
3. **Time-to-hire reduction**: From 6-12 weeks (traditional) to 1-3 weeks (direct messaging).
4. **Compliance**: Auto-generated employment records for Ethiopian Labour Proclamation audits.

### Revenue Projections (Conservative)

| Year | Companies | Avg Tier | MRR (ETB) | ARR (ETB) |
|------|-----------|----------|-----------|-----------|
| Y1 | 200 | 30% paid | 48,000 | 576,000 |
| Y2 | 600 | 35% paid | 175,000 | 2,100,000 |
| Y3 | 1,500 | 40% paid | 580,000 | 6,960,000 |

## 🧪 Testing & Validation

Before deployment, run full validation:

```bash
# Type generation
npx next typegen

# TypeScript check
npm run typecheck

# Build
npm run build

# Apply schema
npx drizzle-kit push

# Start production server
npm run start
```

## 📊 Database Seeding (Development)

To populate the database with sample data:

```bash
# Create seed script
node scripts/seed.js
```

Sample data includes:
- 3 institutions
- 10 trainees across different programs
- 5 companies (1 verified)
- 10 jobs (various sectors)
- Sample skills taxonomy (50+ skills)

## 🔒 Security

- ✅ JWT authentication with 15-min access tokens + 7-day refresh tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation with Zod schemas
- ✅ Role-based access control (RBAC)
- ✅ SQL injection prevention (Drizzle parameterized queries)
- 🔄 Rate limiting on auth endpoints
- 🔄 File upload validation (type + size + virus scan)
- ✅ Audit trail for all state changes

## 📈 Roadmap

### Phase 1 (MVP) ✅
- [x] Database schema
- [x] Authentication system
- [x] Trainee profile & job browsing
- [x] Company job posting
- [x] Basic application flow
- [x] Landing page

### Phase 2 (ILJC Portal) 🔄
- [ ] Officer case management
- [ ] Referral letter generator (PDF with Ethiopic font)
- [ ] Training session management
- [ ] Employer CRM

### Phase 3 (Analytics & Admin) 🔄
- [ ] Admin dashboard
- [ ] Placement analytics
- [ ] Tracer study module
- [ ] MoE report export

### Phase 4 (Payments & Premium) 🔄
- [ ] Chapa payment integration
- [ ] Subscription management
- [ ] Feature gates enforcement
- [ ] Invoice generation

### Phase 5 (Enhancements) 📋
- [ ] SMS notifications (Afro Message API)
- [ ] Email notifications (Resend/SES)
- [ ] CV auto-generation (PDF)
- [ ] Multi-college federation
- [ ] Mobile app (React Native)

## 🤝 Contributing

This project follows the GWPTC Employment Facilitation Procedure (OP-GWPTC-ILJC-002).

For contributions:
1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns
4. Write tests for new features
5. Submit pull request

## 📄 License

Proprietary - General Wingate Polytechnic College (GWPTC)

## 📞 Support

For technical support or questions:
- Email: iljc@gwptc.edu.et
- Phone: +251 XXX XXX XXX

---

**Built with ❤️ for Ethiopia's TVET Community**

*Empowering technical workforce through better job connections.*
