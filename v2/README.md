# HiveHaul V2 - Operations Platform

Next.js-based lightweight transport and service operations platform built on Supabase.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Set Up Database
Run the SQL migrations in Supabase:
- Go to Supabase dashboard > SQL Editor
- Create new query
- Paste contents of `../supabase_phase1_schema.sql`
- Execute

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the client intake form.
Open [http://localhost:3000/manager](http://localhost:3000/manager) to see the manager dashboard.

## Project Structure

```
app/
├── layout.tsx          - Root layout with metadata
├── page.tsx            - Client intake form page
├── globals.css         - Global Tailwind styles
└── manager/
    └── page.tsx        - Manager dashboard
├── api/
    └── jobs/
        └── route.ts    - Job creation and listing API

components/
├── ClientIntakeForm.tsx - Form component for new job submission
└── JobTable.tsx        - Table component for manager dashboard

lib/
├── supabase.ts         - Supabase client and helper functions
└── types.ts            - TypeScript types for DB entities
```

## Phase 1 Features

✓ Client intake form  
✓ Job creation and storage  
✓ Manager dashboard with job list  
✓ Status filtering  
✓ Mobile-responsive UI  

## API Routes

### POST /api/jobs
Create a new job and client if needed.

**Request:**
```json
{
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "client_phone": "+1 (555) 123-4567",
  "title": "Office Relocation",
  "description": "Move office from Suite A to Suite B",
  "pickup_address": "123 Main St, NYC, NY",
  "dropoff_address": "456 Oak Ave, NYC, NY"
}
```

**Response:**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "status": "New",
  "created_at": "2026-05-09T20:00:00Z"
}
```

### GET /api/jobs
Fetch all jobs with client information.

**Response:**
```json
[
  {
    "id": "uuid",
    "client_id": "uuid",
    "title": "Office Relocation",
    "status": "New",
    "created_at": "2026-05-09T20:00:00Z",
    "client": { "id": "uuid", "name": "John Doe", "email": "john@example.com" }
  }
]
```

## Database Schema

### clients
- id (UUID, PK)
- name
- email
- phone
- company
- address
- created_at
- updated_at

### jobs
- id (UUID, PK)
- client_id (FK)
- title
- description
- status (enum: New, Quoted, Accepted, ...)
- pickup_address
- dropoff_address
- pickup_completed
- dropoff_completed
- internal_notes
- assigned_provider
- created_at
- updated_at

## Deployment

Deploy to Vercel:
```bash
npm run build
npm run start
```

Or push to GitHub and Vercel auto-deploys main branch.

## Next Phases

**Phase 2:** Job status updates, internal notes, assignment  
**Phase 3:** Provider/partner operations  
**Phase 4:** Clock-in/out time tracking  
**Phase 5:** Invoice generation  

## Support

For issues or questions, check the main README in the parent directory.
