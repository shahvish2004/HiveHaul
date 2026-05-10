# HiveHaul V2 Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account (using existing project)
- Vercel account for deployment

## Step 1: Create Database Tables

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select the project: `lixblqwodymtgdjlubkm`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL from `supabase_phase1_schema.sql`
6. Click **Run** button

This creates:
- `clients` table (stores client contact info)
- `jobs` table (stores service job records)

## Step 2: Install Dependencies

```bash
cd v2
npm install
```

## Step 3: Configure Environment

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

The file is already populated with Supabase credentials (shared with transcend-website).

## Step 4: Test Locally

Start development server:
```bash
npm run dev
```

Visit:
- Client form: http://localhost:3000
- Manager dashboard: http://localhost:3000/manager

**Test Workflow:**
1. Fill out client intake form
2. Submit (should say "Job Submitted Successfully")
3. Go to manager dashboard
4. New job should appear in the "New" status filter

## Step 5: Deploy to Vercel

Option A: Deploy via CLI
```bash
npm install -g vercel
vercel deploy
```

Option B: Deploy via GitHub
1. Push code to GitHub
2. Vercel auto-deploys on push

Visit: https://hive-haul.vercel.app/

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check `.env.local` file exists in `v2/` directory
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
- Never commit `.env.local` to git

### Error: "Database connection failed"
- Verify Supabase tables were created successfully
- Check Supabase project URL matches `.env.local`
- Verify internet connection

### Form doesn't submit
- Check browser console (F12) for errors
- Verify API route `/api/jobs` is working
- Check Supabase credentials in `.env.local`

### Manager dashboard shows no jobs
- Make sure you submitted at least one job first
- Refresh the page (auto-refreshes every 30s)
- Check Supabase SQL Editor → `jobs` table for records

---

## Database Schema Reference

### clients table
```
id          UUID (primary key)
name        TEXT (required)
email       TEXT (required, unique)
phone       TEXT (optional)
company     TEXT (optional)
address     TEXT (optional)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### jobs table
```
id                 UUID (primary key)
client_id          UUID (foreign key → clients.id)
title              TEXT (required)
description        TEXT (optional)
status             TEXT (default: 'New')
pickup_address     TEXT (required)
dropoff_address    TEXT (required)
pickup_completed   BOOLEAN (default: false)
dropoff_completed  BOOLEAN (default: false)
internal_notes     TEXT (optional)
assigned_provider  UUID (optional, for Phase 3)
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### Job Status Enum
- New
- Quoted
- Accepted
- Assigned
- In Progress
- Delivered
- Completed
- Invoiced
- Paid
- Cancelled

---

## Phase 1 Acceptance Tests

Run through these manually:

1. **Client Submits Form**
   - [ ] Fill intake form with all required fields
   - [ ] Click "Submit Service Request"
   - [ ] See success message "Job Submitted Successfully"
   - [ ] Check Supabase → `jobs` table (new record exists)
   - [ ] Check Supabase → `clients` table (new client exists)

2. **Manager Views Dashboard**
   - [ ] Navigate to `/manager`
   - [ ] See list of all jobs
   - [ ] See job counts per status
   - [ ] Filter by "New" status
   - [ ] New job appears in the list

3. **Job Defaults to New Status**
   - [ ] Submit job through form
   - [ ] Check manager dashboard
   - [ ] Job status shows "New" (not empty, not error)

4. **No Blank Screen**
   - [ ] Root URL loads client form (not blank)
   - [ ] Manager URL loads dashboard (not blank)
   - [ ] Browser console has no ReferenceErrors

5. **Mobile Responsive**
   - [ ] Test on mobile width (375px)
   - [ ] Form fields are readable
   - [ ] Buttons are clickable
   - [ ] No horizontal scroll

6. **Production Stability**
   - [ ] Old single-file version still accessible at `/v1/`
   - [ ] Can rollback if needed

---

## Next Steps (After Phase 1 Complete)

- Phase 2: Job status updates, internal notes, assignment
- Phase 3: Provider/partner operations and clock-in/out
- Phase 4: Invoice generation
- Phase 5: Advanced reporting and analytics
