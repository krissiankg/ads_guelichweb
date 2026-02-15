import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://thnowfeqcbormjmlfunx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.log('\n📝 To run migrations, you need the service_role key (not the anon key)');
    console.log('   1. Go to: https://app.supabase.com/project/thnowfeqcbormjmlfunx/settings/api');
    console.log('   2. Copy the "service_role" key (keep it secret!)');
    console.log('   3. Run: set SUPABASE_SERVICE_ROLE_KEY=your-service-key');
    console.log('   4. Then run this script again: node run-migrations.js\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrations = [
    {
        name: '1. Create newsletter_subscribers table',
        file: 'supabase/migrations/20260128231246_create_newsletter_subscribers_table.sql'
    },
    {
        name: '2. Create portfolio_projects and admin_users tables',
        file: 'supabase/migrations/20260206211357_create_portfolio_and_admin_tables.sql'
    },
    {
        name: '3. Add JSON fields to portfolio_projects',
        file: 'supabase/migrations/20260210140941_add_portfolio_json_fields.sql'
    },
    {
        name: '4. Fix admin_users RLS policy',
        file: 'supabase/migrations/20260210215210_fix_admin_users_rls_policy.sql'
    }
];

async function runMigration(migration) {
    console.log(`\n🔄 Running: ${migration.name}`);

    try {
        const sql = readFileSync(join(__dirname, migration.file), 'utf-8');

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
            // If exec_sql doesn't exist, try direct query
            const { data, error } = await supabase.from('_migrations').insert({ name: migration.name });
            if (error) throw error;

            // Execute the SQL using the REST API
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: sql })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { data: await response.json(), error: null };
        });

        if (error) {
            console.error(`❌ Error: ${error.message}`);
            return false;
        }

        console.log(`✅ Success: ${migration.name}`);
        return true;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Supabase migrations...\n');
    console.log(`📍 Project: ${supabaseUrl}\n`);

    let successCount = 0;

    for (const migration of migrations) {
        const success = await runMigration(migration);
        if (success) successCount++;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Completed: ${successCount}/${migrations.length} migrations successful`);

    if (successCount === migrations.length) {
        console.log('\n🎉 All migrations completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Create an admin user in Supabase Authentication');
        console.log('   2. Add the user to admin_users table');
        console.log('   3. Access the admin dashboard at: http://localhost:5173/admin');
    } else {
        console.log('\n⚠️  Some migrations failed. Please check the errors above.');
    }
}

main().catch(console.error);
