import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thnowfeqcbormjmlfunx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobm93ZmVxY2Jvcm1qbWxmdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDUxNDgsImV4cCI6MjA4NjcyMTE0OH0.NdnNRgJCtxUMOkwtSqCaGyFzjTmdKtV-klPb3niqcbk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log('🔍 Vérification de l\'état de la base de données...\n');

    const tables = ['newsletter_subscribers', 'portfolio_projects', 'admin_users'];
    const results = {};

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                if (error.message.includes('does not exist') || error.code === '42P01') {
                    results[table] = '❌ Table non créée';
                } else {
                    results[table] = `⚠️  Erreur: ${error.message}`;
                }
            } else {
                results[table] = '✅ Table existe';
            }
        } catch (err) {
            results[table] = `❌ Erreur: ${err.message}`;
        }
    }

    console.log('📊 État des tables:\n');
    for (const [table, status] of Object.entries(results)) {
        console.log(`   ${status} - ${table}`);
    }

    const allExist = Object.values(results).every(status => status.startsWith('✅'));

    console.log('\n' + '='.repeat(60));

    if (allExist) {
        console.log('\n🎉 Toutes les tables sont déjà créées !');
        console.log('\n📝 Vous pouvez maintenant:');
        console.log('   1. Tester la newsletter sur votre site');
        console.log('   2. Créer un compte admin et accéder à /admin');
    } else {
        console.log('\n⚠️  Certaines tables manquent.');
        console.log('\n📝 Pour créer les tables, vous devez:');
        console.log('   1. Aller sur: https://app.supabase.com/project/thnowfeqcbormjmlfunx/sql/new');
        console.log('   2. Copier-coller le SQL des migrations (voir guide_migrations_supabase.md)');
        console.log('   3. Exécuter chaque migration dans l\'ordre');
        console.log('\n💡 Ou utilisez le guide complet que j\'ai créé pour vous.');
    }
}

checkTables().catch(console.error);
