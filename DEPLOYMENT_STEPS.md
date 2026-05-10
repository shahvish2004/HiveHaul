# HiveHaul™ Phase 1 Deployment Guide

## Infrastructure Setup

### Supabase Projects
- **Staging:** hivehaul-staging
- **Production:** hivehaul-production

### Vercel Project
- **Project:** hivehaul
- **Environment:** Auto-deployed from main branch

---

## STEP 1: Create Supabase Staging Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. **Name:** `hivehaul-staging`
4. **Region:** us-east-1 (or closest to you)
5. Click **Create new project**
6. Wait for initialization (~2 min)
7. Copy the following from Settings → API:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## STEP 2: Set Up Staging Database Schema

1. In Supabase (hivehaul-staging), click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy entire content from `/hivehaul/supabase_phase1_schema.sql`
4. Paste into the query editor
5. Click **Run**
6. Verify success: You should see the `clients` and `jobs` tables in the left panel

---

## STEP 3: Configure Vercel Preview Environment

### Create .env.staging file in v2/

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Add to Vercel Preview Deployment

1. Go to [vercel.com/shahvish2004s-projects](https://vercel.com/shahvish2004s-projects)
2. Click **hivehaul** project
3. Click **Settings → Environment Variables**
4. Add staging credentials as **Preview** environment variables

---

## STEP 4: Deploy to Preview

```bash
cd /c/Users/shahv/hivehaul/v2
npm run build
vercel deploy --prod
```

Wait for deployment to complete. Preview URL: `https://hivehaul.vercel.app`

---

## STEP 5: Test Preview (Acceptance Criteria)

### Functional Tests
- [ ] Navigate to `https://hivehaul.vercel.app/`
- [ ] Fill client intake form with:
  - Name: Test Client
  - Email: test@example.com
  - Phone: 555-1234
  - Service Title: Moving Service
  - Pickup: 123 Main St
  - Dropoff: 456 Oak Ave
- [ ] Click "Submit Service Request"
- [ ] See "Success" message
- [ ] Navigate to `https://hivehaul.vercel.app/manager`
- [ ] Verify the job appears in the dashboard
- [ ] Verify job status is "New"
- [ ] Click status filter "New" - should show your job
- [ ] Verify mobile responsive (DevTools: 375px width)

### Technical Tests
- [ ] Browser console: No JavaScript errors (F12)
- [ ] Network tab: No 404 or 500 errors
- [ ] API response: Job has `job_number` like `HH-YYYY-MMDD-###`
- [ ] Supabase: Job appears in `jobs` table
- [ ] Supabase: Client appears in `clients` table

---

## STEP 6: Create Production Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. **Name:** `hivehaul-production`
4. **Region:** us-east-1 (same as staging)
5. Click **Create new project**
6. Wait for initialization
7. Copy credentials (same as Step 1)

---

## STEP 7: Set Up Production Database Schema

1. In Supabase (hivehaul-production), click **SQL Editor**
2. Click **New Query**
3. Copy content from `/hivehaul/supabase_phase1_schema.sql`
4. Click **Run**
5. Verify: `clients` and `jobs` tables exist

---

## STEP 8: Configure Vercel Production Environment

1. Go to Vercel hivehaul project
2. Click **Settings → Environment Variables**
3. Add production credentials as **Production** environment variables

### Production .env.local (DO NOT COMMIT)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## STEP 9: Deploy to Production

```bash
cd /c/Users/shahv/hivehaul/v2
npm run build
npm test  # All 42 tests must pass
vercel deploy --prod  # Must add --prod for production
```

---

## STEP 10: Final Verification (Production)

### Same tests as Step 5, but with production URL:
- **Production URL:** `https://hivehaul.vercel.app` (or custom domain)

### Security Checks
- [ ] No console errors
- [ ] No exposed secrets (check Network tab for credentials)
- [ ] No sensitive data in environment variables (check in Vercel Settings)
- [ ] HTTPS only (no mixed content warnings)

### Performance Checks
- [ ] Page load < 3 seconds
- [ ] Form submission API response < 500ms
- [ ] Dashboard loads < 2 seconds
- [ ] Mobile load < 5 seconds

---

## Rollback Plan

If production issues occur:

1. **Immediate Rollback:**
   ```bash
   vercel rollback
   ```

2. **Revert to Previous Build:**
   - Vercel automatically keeps deployment history
   - Click deployment → **Rollback**

3. **Database Rollback:**
   - Supabase backups available in Settings → Backups
   - Or restore from staging (test first)

---

## Post-Deployment

### Monitoring
- Check Vercel Analytics dashboard daily
- Monitor Supabase query performance
- Review error logs in Vercel Deployments

### Updates
- All updates go through GitHub → Vercel auto-deploys
- Test in preview first
- Staging = preview branch
- Production = main branch

---

## Environment Variables Summary

### Staging Preview
```
NEXT_PUBLIC_SUPABASE_URL=hivehaul-staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging_key_here
```

### Production
```
NEXT_PUBLIC_SUPABASE_URL=hivehaul-production.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key_here
```

> **SECURITY:** Anon keys are safe to expose (NEXT_PUBLIC_). Service role keys must NEVER be exposed.

---

## Deployment Checklist

- [ ] Staging Supabase project created
- [ ] Staging schema applied
- [ ] Staging environment variables in Vercel
- [ ] Preview deployment successful
- [ ] All acceptance tests pass in preview
- [ ] 42 unit tests pass (`npm test`)
- [ ] No console errors or secrets exposed
- [ ] Production Supabase project created
- [ ] Production schema applied
- [ ] Production environment variables configured
- [ ] Production deployment successful
- [ ] Production acceptance tests pass
- [ ] Performance verified
- [ ] Monitoring configured

---

## Estimated Timeline
- Supabase setup: 15 min
- Database schema: 5 min
- Preview deployment: 5 min
- Acceptance testing: 20 min
- Production deployment: 5 min
- **Total: ~50 minutes**

---

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase SQL Editor for query errors
3. Check browser console (F12) for client errors
4. Review `.env` files for missing credentials
5. Verify Supabase project has schema tables
