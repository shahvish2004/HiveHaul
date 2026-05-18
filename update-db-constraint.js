const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xzgmzizwexfrxdvuxgoe.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z216aXp3ZXhmcnhkdnV4Z29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4MzE4MiwiZXhwIjoyMDkzOTU5MTgyfQ.41AYSlcKErjRP-Btt4kvyKz5k3Hymoj-Tmh0kmbjoFg';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function updateConstraint() {
  try {
    // First, drop the old constraint
    const dropResult = await supabase.rpc('_get_constraint_definition', {
      table_name: 'jobs'
    });

    // Execute the SQL to update the constraint
    // We need to drop the old constraint and create a new one
    const { data, error } = await supabase.from('jobs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying jobs:', error);
      return;
    }

    console.log('Successfully queried jobs. Now we need to update the constraint manually.');
    console.log('The constraint that needs updating is: jobs_status_check');
    console.log('New allowed statuses: New, Under Review, Approved, Deposit Requested, Deposit Received, Scheduled, In Progress, Completed, Cancelled, Declined');
  } catch (err) {
    console.error('Error:', err);
  }
}

updateConstraint();
