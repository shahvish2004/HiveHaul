# HiveHaul Deployment Playbook

## Overview

Safe, staged deployment strategy with rollback capabilities.

---

## Current State (Before Phase 1)

```
Production:
├── hive-haul.vercel.app → index.html (single-file app)
│   ├── Client intake form ✅
│   ├── Manager panel (password-protected)
│   └── Provider panel (password-protected)

Staging:
├── None (v2/ code ready but not deployed)
```

---

## Phase 1 Deployment Plan

### Stage 1: Deploy V2 to Staging (Week 1)

**Objective:** Verify V2 works independently before touching production

#### 1.1 Create Staging Project
```bash
# Option A: Deploy to separate Vercel project
vercel deploy --prod --name hivehaul-v2-staging

# Or Option B: Use preview deployment
# Merge PR to staging branch → Vercel auto-deploys

# Result: hivehaul-v2-staging.vercel.app
```

#### 1.2 Configure Staging Environment
```bash
# Add environment variables
NEXT_PUBLIC_SUPABASE_URL=https://lixblqwodymtgdjlubkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Use same Supabase (shared database for testing)
# OR create separate Supabase project (isolated)
```

#### 1.3 Run Acceptance Tests on Staging
```
[ ] Database tables exist (clients, jobs)
[ ] Job counter works (HH-2026-0509-001)
[ ] Client intake form submits
[ ] Data appears in Supabase
[ ] Manager dashboard loads
[ ] Status filtering works
[ ] Mobile UX responsive
[ ] No console errors
[ ] No dead links
```

#### 1.4 Monitor for 24 Hours
```
[ ] No critical errors
[ ] Load times acceptable
[ ] Database queries fast
[ ] No cascade issues
```

### Stage 2: Database Schema Migration (Week 1)

**Objective:** Update production Supabase with new schema

#### 2.1 Backup Current Database
```bash
# Supabase → Project Settings → Database Backups
# Manual backup before any changes
```

#### 2.2 Apply New Schema
```bash
# Option A: Via Supabase SQL Editor (recommended)
1. Go to SQL Editor
2. Create new query
3. Paste supabase_phase1_schema_v2.sql
4. Review changes
5. Click Run

# Option B: Via Supabase CLI
supabase db push
```

#### 2.3 Verify Schema Creation
```sql
-- Run in SQL Editor to confirm
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show:
-- clients
-- jobs

-- Verify triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Should show:
-- set_job_number
-- update_jobs_updated_at
-- update_clients_updated_at
```

#### 2.4 Test Job Number Generation
```sql
-- Insert test client
INSERT INTO clients (name, email) 
VALUES ('Test Client', 'test@example.com');

-- Insert test job
INSERT INTO jobs (client_id, title, pickup_address, dropoff_address)
VALUES (
  (SELECT id FROM clients WHERE email = 'test@example.com'),
  'Test Job',
  '123 Test St',
  '456 Test Ave'
);

-- Verify job_number auto-generated
SELECT job_number, title FROM jobs 
WHERE title = 'Test Job';

-- Should show: HH-2026-MMDD-001
```

### Stage 3: Test Staging Against Production Database (Week 1-2)

**Objective:** Verify V2 code works with production database structure

#### 3.1 Configure Staging for Production Data
```bash
# Update staging environment:
NEXT_PUBLIC_SUPABASE_URL=[production Supabase URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production key]

# Test against real database with new schema
```

#### 3.2 Test Full Workflow
```
[ ] Client submits form → creates job with number
[ ] Job appears in dashboard immediately
[ ] Job number format correct (HH-YYYY-MMDD-###)
[ ] Status defaults to "New"
[ ] All fields populated correctly
[ ] No data loss
```

#### 3.3 Performance Testing
```
[ ] Form submission < 1s
[ ] Dashboard load < 2s
[ ] Dashboard refresh < 500ms
[ ] Database queries optimized
[ ] No N+1 queries
```

### Stage 4: Deploy V2 to Production (Week 2)

**Objective:** Replace single-file app with V2, keep fallback

#### 4.1 Update Vercel Configuration
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/v1/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/((?!v1|_next|public).*)",
      "destination": "/app"
    }
  ]
}
```

**What this does:**
- `/` → V2 app (new)
- `/manager` → V2 app (new)
- `/v1/*` → single-file app (fallback)

#### 4.2 Deploy V2 Code
```bash
# Merge v2/ into main branch root (or create deployment)
git push origin main

# Vercel auto-deploys
# Monitor deployment: vercel.com > hive-haul project
```

#### 4.3 Verify Production URLs
```
[ ] https://hive-haul.vercel.app/ → Client form (V2)
[ ] https://hive-haul.vercel.app/manager → Dashboard (V2)
[ ] https://hive-haul.vercel.app/v1/ → Old app (fallback)
[ ] https://hive-haul.vercel.app/?manager=1 → V2 redirects to /manager
```

#### 4.4 Load Test Production
```bash
# Simulate concurrent users
Apache Bench:
ab -n 100 -c 10 https://hive-haul.vercel.app/

# Result: All requests should succeed
```

---

## Rollback Plan (If Issues)

### Immediate Rollback (< 5 min)

**If critical errors in production:**

#### Option 1: Revert vercel.json
```bash
# Revert latest commit
git revert HEAD --no-edit

# Push
git push origin main

# Vercel redeploys
# All traffic → old single-file app
```

**Time:** 2-3 minutes  
**Impact:** Users see old app, no data loss

#### Option 2: Change Vercel route rules
```json
// Temporarily route all traffic to /v1/
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Time:** 1 minute  
**Impact:** All traffic to old app immediately

#### Option 3: Vercel rollback UI
```
1. Go to vercel.com > hive-haul
2. Deployments tab
3. Click previous successful deployment
4. Click "Promote to Production"
5. Done (instant)
```

**Time:** 30 seconds  
**Impact:** Instant rollback

### Post-Incident Process

```
1. Identify root cause
2. Fix in code
3. Test extensively in staging
4. Re-deploy to production
5. Monitor closely for 24h
6. Post-mortem on what failed
```

---

## Monitoring Checklist

### During Deployment (Real-time)

```
[ ] Vercel build succeeds
[ ] No build warnings
[ ] Deployment status: READY
[ ] All domains resolve correctly
[ ] Pages load without 404/500 errors
[ ] Database connection works
[ ] API endpoints respond
[ ] Console has no critical errors
```

### Post-Deployment (First 24 hours)

```
[ ] Monitor Vercel analytics
[ ] Monitor error rate (should be 0)
[ ] Monitor response times
[ ] Monitor database connections
[ ] User feedback (any complaints?)
[ ] Run acceptance tests again
[ ] Test on real mobile device
[ ] Check email/Slack alerts
[ ] No unexpected errors in logs
```

### Ongoing (Weekly)

```
[ ] Check Vercel deployment metrics
[ ] Review database query performance
[ ] Check storage usage
[ ] Monitor costs
[ ] Review error logs
[ ] User feedback summary
```

---

## Environmental Variables (Production)

Must be set in Vercel dashboard before deployment:

```
NEXT_PUBLIC_SUPABASE_URL=https://lixblqwodymtgdjlubkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## File Organization (Post-Deployment)

```
hive-haul/ (GitHub root)
├── v2/                     ← V2 Next.js source
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── ...
├── index.html              ← V1 single-file (fallback)
├── vercel.json             ← Routing config
└── DEPLOYMENT_PLAYBOOK.md  ← This file
```

---

## Deployment Timeline

| Date | Stage | Action |
|------|-------|--------|
| Week 1 (Mon) | Stage 1 | Deploy V2 to staging |
| Week 1 (Mon-Wed) | Stage 1 | Test staging (24h+) |
| Week 1 (Wed) | Stage 2 | Backup + apply schema |
| Week 1 (Wed-Fri) | Stage 3 | Test staging with prod DB |
| Week 2 (Mon) | Stage 4 | Deploy V2 to production |
| Week 2 (Tue) | Monitoring | 24h production monitoring |
| Week 2 (Wed) | Review | Post-deployment review |

---

## Questions to Confirm

1. ✅ Separate Vercel projects (staging + prod) or same project?
2. ✅ Shared Supabase database for testing, or separate project?
3. ✅ How long should staging run before prod (1 day, 1 week)?
4. ✅ Automated tests for deployment verification?
5. ✅ Who approves production deployment?

---

## Success Criteria

✅ V2 code deployed to production  
✅ Client form works on production  
✅ Manager dashboard works on production  
✅ Database schema applied correctly  
✅ Job numbers generating correctly  
✅ No data loss  
✅ < 1% error rate  
✅ Response times acceptable  
✅ Fallback to V1 available if needed  
✅ 24h monitoring passed  

---

## Emergency Contacts

- Vercel status: https://www.vercelstatus.com
- Supabase status: https://status.supabase.com
- GitHub: https://github.com/shahvish2004/HiveHaul
