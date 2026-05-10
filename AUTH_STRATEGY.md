# HiveHaul Authentication & Authorization Strategy

## Phase 1 (Current): No Authentication

- ✅ Public intake form at `/`
- ✅ Manager dashboard at `/manager` (unprotected)
- ✅ Anyone can view all jobs
- ✅ No user accounts
- ✅ No role-based access

**Why:** MVP speed, simple deployment, test core flows

---

## Phase 2 (Job Management): Magic Link Auth

### Recommended Approach: Supabase Auth with Magic Links

**Why Magic Links?**
- No passwords to remember
- Works on all devices (desktop, mobile, tablet)
- Perfect for field workers who receive jobs via email
- Secure (email verification required)
- One-click login (click link in email)
- Supabase handles all security (PKCE, token refresh)
- No additional dependency needed
- Free tier includes generous email limits

### Implementation Overview

#### 2.1 Database Setup
```sql
-- Supabase auto-creates auth.users table
-- Add custom profile fields:

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'manager',  -- manager, provider, client
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### 2.2 Login Flow
```
Manager clicks "Login" on /manager
→ Form asks for email
→ Supabase sends magic link to email
→ Manager clicks link
→ Authenticated session created
→ Redirected to /manager dashboard
→ Session persists (token stored in cookie)
```

#### 2.3 Implementation Steps

**Step 1: Add login page**
```tsx
// app/login/page.tsx
export default function LoginPage() {
  // Email input field
  // "Send Magic Link" button
  // "Check your email" message after submission
}
```

**Step 2: Handle magic link redirect**
```tsx
// app/auth/callback/route.ts
// Supabase redirects here with ?code=...
// Exchange code for session
// Redirect to /manager
```

**Step 3: Protect manager routes**
```tsx
// Middleware to check session
// Redirect to /login if not authenticated
```

**Step 4: Add logout button**
```tsx
// Sign out button in manager dashboard
// Clear session
// Redirect to /
```

### Magic Link Configuration

```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js'

export const signInWithMagicLink = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase(),
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  
  if (error) throw error
  return { success: true }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const signOut = async () => {
  await supabase.auth.signOut()
}
```

### Security Considerations

✅ **Secure by Default:**
- PKCE flow (Supabase handles)
- Short-lived tokens (15 min)
- Refresh tokens (7 days)
- Secure cookie storage
- HTTPS required in production

⚠️ **What We Need:**
- Email verification (Supabase provides)
- CSRF protection (Next.js middleware)
- Rate limiting (Supabase free plan includes)

---

## Phase 3 (Provider Operations): Role-Based Access

### Three User Roles

**1. Manager (Admin)**
- View all jobs
- Update job status
- Assign providers
- Add internal notes
- View all providers
- Generate invoices

**2. Provider (Worker)**
- View assigned jobs
- Clock in/out
- Upload proof photos
- Update job progress
- View own time logs

**3. Client (Optional - Phase 4+)**
- View own jobs (intake confirmation)
- See status updates
- Receive notifications
- Download invoice

### Role-Based Access Implementation

```typescript
// lib/auth.ts
export const checkRole = (session, requiredRole) => {
  if (!session) return false
  
  const userRole = session.user.user_metadata?.role
  
  const roleHierarchy = {
    manager: ['manager'],
    provider: ['provider'],
    client: ['client'],
  }
  
  return roleHierarchy[requiredRole]?.includes(userRole)
}

// Middleware
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Protect routes
  if (req.nextUrl.pathname.startsWith('/manager')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    if (session.user.user_metadata?.role !== 'manager') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: ['/manager/:path*', '/provider/:path*'],
}
```

### Database Setup for Roles

```sql
-- Update profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'manager';

-- RLS policies for role-based access
CREATE POLICY "Managers can view all jobs" ON jobs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
  );

CREATE POLICY "Providers can view assigned jobs" ON jobs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'provider'
    AND assigned_provider = auth.uid()
  );

-- Managers can update any job
CREATE POLICY "Managers can update jobs" ON jobs
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
  );

-- Providers can only update assigned jobs
CREATE POLICY "Providers can update assigned jobs" ON jobs
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'provider'
    AND assigned_provider = auth.uid()
  );
```

---

## Phase 4+ (Advanced): SSO & API Keys

### Optional Enhancements

**Single Sign-On (SSO)**
- Google OAuth (managers via company Google account)
- Microsoft Entra (enterprise integration)
- Implementation: Supabase Auth Providers

**API Keys**
- For third-party integrations
- Zapier, Make, custom apps
- Implementation: Separate table + middleware

**Mobile App Auth**
- Deep links + magic links
- Bearer token auth
- Refresh token rotation

---

## Security Checklist

- [ ] Magic link email templating (branded)
- [ ] Email rate limiting (prevent abuse)
- [ ] Session timeout on inactivity (15 min)
- [ ] Password-less approach (no password resets)
- [ ] Audit logging (who changed what)
- [ ] CSRF tokens on forms
- [ ] HTTPS everywhere
- [ ] Secure cookie flags (HttpOnly, SameSite, Secure)
- [ ] Content Security Policy headers

---

## Testing Plan

**Phase 2 Testing:**
```bash
# Magic link flow
1. Go to /login
2. Enter email
3. Check email (Supabase test console)
4. Click link
5. Verify redirected to /manager
6. Verify session persists on refresh
7. Click logout
8. Verify redirected to /
9. Try accessing /manager → redirected to /login
```

**Role Testing:**
```bash
# Create test users with different roles
# Test access control per role
# Verify RLS policies block/allow correctly
```

---

## Configuration

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=https://hive-haul.vercel.app
```

### Supabase Configuration
```
Auth Providers: Enabled (Magic Link)
Email Confirmations: Enabled
JWT Expiry: 3600 (1 hour)
Refresh Token Expiry: 604800 (7 days)
```

---

## Timeline

- **Phase 2 (Week 1-2):** Magic link auth
- **Phase 3 (Week 3-4):** Role-based access + provider dashboard
- **Phase 4+ (Later):** SSO, API keys, advanced features

---

## Questions to Confirm

1. ✅ Magic links acceptable for Phase 2?
2. ✅ Three roles (Manager, Provider, Client) make sense?
3. ✅ Email-based approach OK, or need SMS?
4. ✅ Session timeout of 15 min for field workers acceptable?
5. ✅ Supabase Auth preferred, or prefer alternative?
