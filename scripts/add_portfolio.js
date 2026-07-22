import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thnowfeqcbormjmlfunx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobm93ZmVxY2Jvcm1qbWxmdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDUxNDgsImV4cCI6MjA4NjcyMTE0OH0.NdnNRgJCtxUMOkwtSqCaGyFzjTmdKtV-klPb3niqcbk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('portfolio_projects').insert([{
    title: 'Spass mit Deutsch Benin',
    category: 'Plateforme Web',
    thumbnail_url: '/portfolio/spass-mit-deutsch.png',
    project_url: 'https://platform.spassmitdeutschbenin.com/',
    description: 'Plateforme officielle de consultation des résultats d\'examen pour le centre de formation Spass mit Deutsch au Bénin.',
    summary: 'Système complet de gestion et de consultation de résultats en ligne avec une interface moderne et sécurisée.',
    features: ['Consultation des résultats', 'Téléchargement de certificats PDF', 'Design responsive', 'Support multilingue (FR/DE)'],
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
    images: ['/portfolio/spass-mit-deutsch.png'],
    objectifs: 'Digitaliser le processus d\'annonce des résultats pour le centre de formation en allemand et permettre un accès rapide et sécurisé aux apprenants.',
    order_index: 0,
    is_featured: true,
    is_visible: true,
    portfolio_type: 'web_app'
  }]);

  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Inserted successfully');
  }
}

run();
