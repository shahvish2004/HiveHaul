import { NextRequest, NextResponse } from 'next/server'

const migrationSql = `
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

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization')
    const token = process.env.MIGRATION_SECRET || 'test-migration-token'

    // Simple token verification
    if (auth !== `Bearer ${token}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Try to make a request to Supabase admin API
    // This is a workaround since JS client doesn't support raw SQL

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({
        sql: migrationSql
      })
    })

    if (!response.ok) {
      // RPC endpoint might not exist, return helpful message
      const text = await response.text()

      return NextResponse.json({
        status: 'error',
        message: 'Supabase RPC endpoint not available',
        instructions: {
          method: 'Supabase Dashboard',
          steps: [
            '1. Go to https://app.supabase.com/',
            '2. Sign in and select project: xzgmzizwexfrxdvuxgoe',
            '3. Click: SQL Editor (left sidebar)',
            '4. Click: New Query',
            '5. Copy and paste this SQL:',
            migrationSql,
            '6. Click: RUN',
            '7. Confirm: "Success. No rows returned"'
          ]
        }
      })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Migration applied successfully'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
