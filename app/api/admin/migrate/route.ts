import { NextRequest, NextResponse } from 'next/server'

// This is a temporary admin endpoint for applying the database migration
// Should only be accessible in development mode
// Remove after migration is applied

const ADMIN_SECRET = process.env.ADMIN_MIGRATION_SECRET || 'temp-migration-key'

export async function POST(request: NextRequest) {
  try {
    // Verify admin secret for security
    const secret = request.headers.get('x-admin-secret')

    if (secret !== ADMIN_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Import the Supabase client with service role
    const { createClient } = await import('@supabase/supabase-js')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('status')
      .limit(1)

    if (testError) {
      return NextResponse.json(
        { error: 'Database connection failed', details: testError.message },
        { status: 500 }
      )
    }

    // Since Supabase JS client doesn't support raw SQL, we need to use a workaround
    // For now, return instructions for manual application

    return NextResponse.json({
      status: 'error',
      message: 'Supabase JavaScript client does not support raw SQL execution',
      instructions: {
        method1: 'Use Supabase Dashboard SQL Editor',
        method2: 'Use Supabase CLI (supabase db push)',
        method3: 'Use this curl command to trigger via another method'
      },
      migration_sql: `
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
CHECK (
  status IN (
    'New',
    'Under Review',
    'Approved',
    'Deposit Requested',
    'Deposit Received',
    'Scheduled',
    'In Progress',
    'Completed',
    'Cancelled',
    'Declined'
  )
);
      `.trim()
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
