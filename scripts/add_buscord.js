import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thnowfeqcbormjmlfunx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobm93ZmVxY2Jvcm1qbWxmdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDUxNDgsImV4cCI6MjA4NjcyMTE0OH0.NdnNRgJCtxUMOkwtSqCaGyFzjTmdKtV-klPb3niqcbk';

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
