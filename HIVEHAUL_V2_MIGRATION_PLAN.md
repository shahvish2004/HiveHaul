# HiveHaul V2 Migration Plan

## Overview
Controlled migration from single-file HTML to Next.js while maintaining production stability. Phase 1 focuses on intake form → Supabase → manager dashboard.

## Migration Strategy

### Rollback Plan
- Single-file version remains at `https://hive-haul.vercel.app/v1/` (fallback)
- Next.js V2 deploys to `https://hive-haul.vercel.app/` (primary)
- Can revert to single-file by modifying vercel.json route rules

### URL Continuity
- `/` → Client intake form (V2)
- `/?manager=1` → Redirects to `/manager` (V2)
- `/?provider=1` → Redirects to `/provider` (V2, Phase 3)
- All new routes under V2 structure

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Deployment**: Main branch auto-deploys

---

## Phase 1: Core Intake & Job Management

### Acceptance Criteria
✓ Client submits intake form → data saved to Supabase  
✓ Manager dashboard displays all jobs with statuses  
✓ Job defaults to "New" status  
✓ No blank screen errors  
✓ Mobile-first UI functional  
✓ Production remains stable  

### Database Schema (Phase 1)
```
clients (lookup table for client info)
├── id (uuid, PK)
├── name
├── email
├── phone
├── created_at

jobs (main job records)
├── id (uuid, PK)
├── client_id (FK → clients)
├── title
├── description
├── status (enum: New, Quoted, Accepted, Assigned, In Progress, Delivered, Completed, Invoiced, Paid, Cancelled)
├── pickup_address
├── dropoff_address
├── created_at
├── updated_at
```

### File Structure (Phase 1)
```
hivehaul-v2/
├── app/
│   ├── layout.tsx           (root layout)
│   ├── page.tsx             (client intake form)
│   ├── manager/
│   │   └── page.tsx         (manager dashboard)
│   └── api/
│       ├── jobs/
│       │   ├── route.ts      (POST: create job, GET: list jobs)
│       │   └── [id]/
│       │       └── route.ts  (PATCH: update job)
│       └── clients/
│           └── route.ts      (POST: create/lookup client)
├── lib/
│   ├── supabase.ts          (Supabase client)
│   └── types.ts             (TypeScript types)
├── components/
│   ├── ClientIntakeForm.tsx
│   ├── JobCard.tsx
│   ├── JobTable.tsx
│   ├── ui/
│   │   └── Button.tsx (basic UI components)
├── public/
│   └── (images, logos)
├── .env.local              (Supabase credentials)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vercel.json             (deployment config)
```

### Page Routes (Phase 1)
| Route | Component | Role | Status |
|-------|-----------|------|--------|
| `/` | ClientIntakeForm | Client | New job creation |
| `/manager` | ManagerDashboard | Manager | View/manage jobs |
| `/?manager=1` | Redirect middleware | N/A | Legacy support |

### Data Flow (Phase 1)
1. **Client submits form** on `/`
   - Form validates inputs (name, email, phone, service details)
   - Creates/finds client record in `clients` table
   - Creates job record in `jobs` table (status: "New")
   - Returns confirmation

2. **Manager views dashboard** on `/manager`
   - Queries all jobs from `jobs` table
   - Groups by status
   - Can click job to see details
   - Can update status (Phase 2)

### API Routes (Phase 1)

#### POST /api/jobs
```json
Request: {
  "client_name": "string",
  "client_email": "string",
  "client_phone": "string",
  "title": "string",
  "description": "string",
  "pickup_address": "string",
  "dropoff_address": "string"
}

Response: {
  "id": "uuid",
  "status": "New",
  "created_at": "ISO timestamp"
}
```

#### GET /api/jobs
```json
Response: [
  {
    "id": "uuid",
    "title": "string",
    "status": "New|Quoted|...",
    "client_name": "string",
    "created_at": "ISO timestamp",
    "pickup_address": "string"
  }
]
```

---

## Implementation Steps

### Step 1: Project Setup
- [ ] Create `hivehaul-v2` directory structure
- [ ] Initialize Next.js with App Router
- [ ] Install dependencies (tailwind, supabase-js)
- [ ] Set up environment variables

### Step 2: Database Schema
- [ ] Run SQL migrations in Supabase
- [ ] Create `clients` and `jobs` tables
- [ ] Set up proper indexes and constraints
- [ ] Enable RLS (Row Level Security) for multi-user support

### Step 3: Supabase Integration
- [ ] Create `lib/supabase.ts` client
- [ ] Create `lib/types.ts` with Job and Client interfaces
- [ ] Build helper functions for CRUD operations

### Step 4: Intake Form (Client Page)
- [ ] Create `/page.tsx` with form component
- [ ] Form validation (client-side)
- [ ] Submit to `POST /api/jobs`
- [ ] Show success/error messages
- [ ] Mobile-responsive design

### Step 5: Manager Dashboard
- [ ] Create `/manager/page.tsx`
- [ ] Fetch jobs from `GET /api/jobs`
- [ ] Display job table/cards
- [ ] Show job counts by status
- [ ] Basic styling with Tailwind

### Step 6: API Routes
- [ ] `POST /api/jobs` → create job + client
- [ ] `GET /api/jobs` → fetch all jobs
- [ ] `PATCH /api/jobs/[id]` → update job (Phase 2)

### Step 7: Testing & Deployment
- [ ] Test intake form submission
- [ ] Verify data in Supabase
- [ ] Test manager dashboard loads jobs
- [ ] Check mobile responsiveness
- [ ] Deploy to Vercel
- [ ] Verify production functionality

---

## Deployment Strategy

### Vercel Configuration (vercel.json)
```json
{
  "rewrites": [
    {
      "source": "/v1/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/((?!v1|_next|public).*)",
      "destination": "/index.tsx"
    }
  ]
}
```

### Env Variables (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Success Metrics
- ✓ Client form submits without errors
- ✓ Data persists in Supabase
- ✓ Manager sees new jobs immediately
- ✓ No ReferenceErrors or blank screens
- ✓ Mobile layout functional
- ✓ <1s response time on manager dashboard
- ✓ Zero downtime deployment

---

## Next Phases (Post Phase 1)
- **Phase 2**: Job status updates, internal notes, assignment
- **Phase 3**: Provider/partner operations
- **Phase 4**: Clock-in/out time tracking
- **Phase 5**: Invoice generation
