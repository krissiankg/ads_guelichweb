import { createClient } from '@supabase/supabase-js';

// Run with: node --env-file=.env scripts/add_buscord.js
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis (fichier .env)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('portfolio_projects').insert([{
    title: 'BUSCORD — Bureau d\'Études & Contrôle',
    category: 'Site Web Institutionnel',
    thumbnail_url: '/portfolio/buscord.png',
    project_url: 'https://buscord.online/',
    description: 'Plateforme web institutionnelle du Bureau de Suivi-Contrôle et de Réalisation pour le Développement au Burkina Faso.',
    summary: 'Conception et réalisation d\'une vitrine digitale haut de gamme pour BUSCORD, partenaire clé des bailleurs de fonds, ONG et institutions internationales dans l\'humanitaire et le BTP.',
    features: [
      'Présentation des domaines d\'intervention (Suivi-contrôle, BTP, Intermédiation sociale)',
      'Showcase des réalisations (Écoles, Forages, Lycées)',
      'Indicateurs d\'impact dynamique & métriques (7+ projets, 440M+ FCFA)',
      'UX/UI responsive moderne (Glassmorphism & typographie soignée)',
      'Formulaire de contact & d\'interaction bailleurs'
    ],
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
    images: ['/portfolio/buscord.png', '/portfolio/buscord-hero.jpg'],
    objectifs: 'Valoriser l\'expertise terrain et les 15+ années d\'expérience de BUSCORD auprès des partenaires internationaux et bailleurs humanitaires.',
    order_index: -3,
    is_featured: true,
    is_visible: true,
    portfolio_type: 'web_app'
  }]);

  if (error) {
    console.error('Error inserting into Supabase:', error);
  } else {
    console.log('Buscord project inserted successfully into Supabase!');
  }
}

run();
