import { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle2, Globe, Palette, Video, Maximize2 } from 'lucide-react';
import { supabase, PortfolioProject, VideoPortfolio } from '../../lib/supabase';
import { Language } from '../../translations';

interface PortfolioContentProps {
  language: Language;
}

type PortfolioTab = 'web' | 'graphic' | 'video';

export function PortfolioContent({ language }: PortfolioContentProps) {
  const fr = language === 'fr';
  const [activeTab, setActiveTab] = useState<PortfolioTab>('web');
  const [webProjects, setWebProjects] = useState<PortfolioProject[]>([]);
  const [graphicProjects, setGraphicProjects] = useState<PortfolioProject[]>([]);
  const [videos, setVideos] = useState<VideoPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail / lightbox states
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoPortfolio | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Web category filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [webRes, graphicRes, videoRes] = await Promise.all([
        supabase.from('portfolio_projects').select('*').eq('portfolio_type', 'web_app').eq('is_visible', true).order('order_index'),
        supabase.from('portfolio_projects').select('*').eq('portfolio_type', 'graphic_design').eq('is_visible', true).order('order_index'),
        supabase.from('video_portfolio').select('*').eq('is_visible', true).order('order_index')
      ]);

      let webData = webRes.data || [];
      
      const buscordProject: PortfolioProject = {
        id: 'mock-buscord-online',
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
        portfolio_type: 'web_app',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const spassMitDeutschProject: PortfolioProject = {
        id: 'mock-spass-mit-deutsch',
        title: 'Spass mit Deutsch Benin',
        category: 'Plateforme Web / App',
        thumbnail_url: '/portfolio/spass-mit-deutsch.png',
        project_url: 'https://platform.spassmitdeutschbenin.com/',
        description: 'Plateforme officielle de consultation des résultats d\'examen pour le centre de formation Spass mit Deutsch au Bénin.',
        summary: 'Système complet de gestion et de consultation de résultats en ligne avec une interface moderne et sécurisée.',
        features: ['Consultation des résultats', 'Téléchargement de certificats PDF', 'Design responsive', 'Espace administrateur sécurisé', 'Support multilingue'],
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
        images: ['/portfolio/spass-mit-deutsch.png'],
        objectifs: 'Digitaliser le processus d\'annonce des résultats pour le centre de formation en allemand et permettre un accès rapide et sécurisé aux apprenants.',
        order_index: -1,
        is_featured: true,
        is_visible: true,
        portfolio_type: 'web_app',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const snbProject: PortfolioProject = {
        id: 'mock-snb-benin',
        title: 'Société de Nutrition du Bénin (SNB)',
        category: 'Site Web Institutionnel',
        thumbnail_url: '/portfolio/snb-bj.png',
        project_url: 'https://snb.bj/',
        description: 'Site web officiel de la Société de Nutrition du Bénin, une association scientifique et professionnelle.',
        summary: 'Refonte complète avec les nouvelles technologies pour l\'association œuvrant pour une alimentation saine, la santé et le développement durable au Bénin.',
        features: ['Présentation de l\'association', 'Actualités et événements', 'Ressources scientifiques', 'Espace membres'],
        technologies: ['React', 'Vite', 'Tailwind CSS', 'TypeScript'],
        images: ['/portfolio/snb-bj.png'],
        objectifs: 'Moderniser la présence en ligne de la SNB et offrir une plateforme performante pour la diffusion des connaissances en nutrition.',
        order_index: -2,
        is_featured: true,
        is_visible: true,
        portfolio_type: 'web_app',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Remove duplicates if present in Supabase
      webData = webData.filter(p => !p.title.toLowerCase().includes('snb') && !p.title.toLowerCase().includes('nutrition') && !p.title.toLowerCase().includes('buscord'));

      webData = [buscordProject, snbProject, spassMitDeutschProject, ...webData];
      setWebProjects(webData);
      setGraphicProjects(graphicRes.data || []);
      setVideos(videoRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Web sub-categories
  const webCategories = ['All', ...Array.from(new Set(webProjects.map(p => p.category).filter(Boolean)))];
  const filteredWebProjects = selectedCategory === 'All' ? webProjects : webProjects.filter(p => p.category === selectedCategory);

  // Top tabs
  const tabs: { id: PortfolioTab; icon: typeof Globe; label: string; count: number }[] = [
    { id: 'web', icon: Globe, label: fr ? 'Web / App' : 'Web / App', count: webProjects.length },
    { id: 'graphic', icon: Palette, label: fr ? 'Design Graphique' : 'Graphic Design', count: graphicProjects.length },
    { id: 'video', icon: Video, label: fr ? 'Vidéo' : 'Video', count: videos.length },
  ];

  const closeDetail = () => {
    setSelectedProject(null);
    setSelectedVideo(null);
    setCurrentImageIndex(0);
    setLightboxImage(null);
  };

  return (
    <>
      {/* Main Content */}
      <div className="w-full mt-12">
        {/* Portfolio Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 px-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); closeDetail(); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <>
                {/* WEB/APP TAB */}
                {activeTab === 'web' && (
                  <>
                    {webCategories.length > 2 && (
                      <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-2 px-2">
                        {webCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                          >{cat}</button>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredWebProjects.map(project => (
                        <div
                          key={project.id}
                          onClick={() => { setSelectedProject(project); setCurrentImageIndex(0); }}
                          className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-slate-200"
                        >
                          <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                            <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute top-3 right-3">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <Globe className="text-blue-600" size={14} />
                                <span className="text-xs font-semibold text-slate-700">{project.category}</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <button className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                {fr ? 'Voir détails' : 'View details'}
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                            {project.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredWebProjects.length === 0 && <EmptyState text={fr ? 'Aucun projet web/app' : 'No web/app projects'} />}
                  </>
                )}

                {/* ========== GRAPHIC DESIGN TAB ========== */}
                {activeTab === 'graphic' && (
                  <div className="space-y-10">
                    {graphicProjects.map(project => (
                      <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 pb-4">
                          <h3 className="text-2xl font-bold text-slate-900">{project.title}</h3>
                          {project.description && <p className="text-slate-500 mt-1">{project.description}</p>}
                        </div>
                        <div className="px-6 pb-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {/* Cover image */}
                            {project.thumbnail_url && (
                              <button
                                onClick={() => setLightboxImage(project.thumbnail_url)}
                                className="group aspect-square rounded-xl overflow-hidden relative bg-slate-100"
                              >
                                <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                </div>
                              </button>
                            )}
                            {/* Gallery images */}
                            {(project.images || []).map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setLightboxImage(img)}
                                className="group aspect-square rounded-xl overflow-hidden relative bg-slate-100"
                              >
                                <img src={img} alt={`${project.title} ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {graphicProjects.length === 0 && <EmptyState text={fr ? 'Aucun design graphique' : 'No graphic designs'} />}
                  </div>
                )}

                {/* ========== VIDEO TAB ========== */}
                {activeTab === 'video' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map(video => (
                      <div
                        key={video.id}
                        onClick={() => setSelectedVideo(video)}
                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-slate-200"
                      >
                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                          <img src={video.cover_image_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                              <Play size={28} className="text-blue-600 ml-1" />
                            </div>
                          </div>
                          <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium capitalize">{video.video_platform}</span>
                          <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                            {video.size_category === 'short' ? (fr ? 'Court' : 'Short') : video.size_category === 'medium' ? 'Medium' : 'Long'}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{video.title}</h3>
                          {video.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{video.description}</p>}
                        </div>
                      </div>
                    ))}
                    {videos.length === 0 && <EmptyState text={fr ? 'Aucune vidéo' : 'No videos'} />}
                  </div>
                )}
              </>
            )}
          </div>
      {/* ========== WEB PROJECT DETAIL OVERLAY ========== */}
      {selectedProject && <ProjectDetailOverlay project={selectedProject} fr={fr} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} onClose={closeDetail} />}

      {/* ========== VIDEO PLAYER OVERLAY ========== */}
      {selectedVideo && <VideoPlayerOverlay video={selectedVideo} fr={fr} onClose={closeDetail} />}

      {/* ========== LIGHTBOX (for graphic images) ========== */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-3xl z-[70] flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <AnimatedBackground />
          <button className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" onClick={() => setLightboxImage(null)}>
            <X className="text-white" size={28} />
          </button>
          <img src={lightboxImage} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

// =======================================================================
// SUB-COMPONENTS
// =======================================================================

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 col-span-full">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
        <ImageIcon className="text-slate-400" size={40} />
      </div>
      <p className="text-slate-600 text-lg">{text}</p>
    </div>
  );
}

// --- Project Detail Overlay ---
function ProjectDetailOverlay({ project, fr, currentImageIndex, setCurrentImageIndex, onClose }: {
  project: PortfolioProject; fr: boolean; currentImageIndex: number;
  setCurrentImageIndex: (i: number) => void; onClose: () => void;
}) {
  // Use images array directly from the project (stored in Supabase), fallback to thumbnail
  const images = (project.images && project.images.length > 0)
    ? project.images
    : [project.thumbnail_url];
  const currentImage = images[currentImageIndex] || images[0];

  const nextImage = () => setCurrentImageIndex((currentImageIndex + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-3xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <AnimatedBackground />
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Image viewer */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="relative flex items-center justify-center max-h-[70vh]">
            <img src={currentImage} alt={project.title} className="w-full max-h-[70vh] object-contain" loading="lazy" />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg hover:scale-110">
                  <ChevronLeft className="text-slate-900" size={24} />
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg hover:scale-110">
                  <ChevronRight className="text-slate-900" size={24} />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl transition-colors shadow-lg">
            <X className="text-slate-900" size={24} />
          </button>
          <div className="absolute top-4 left-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-sm font-semibold text-slate-700">{project.category}</span>
            </div>
          </div>
        </div>

        {/* Image thumbnails */}
        {images.length > 1 && (
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-blue-600 shadow-lg scale-105' : 'border-slate-200 hover:border-blue-400 opacity-60 hover:opacity-100'
                    }`}>
                  <img src={img} alt={`${project.title} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project Info */}
        <div className="p-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">{project.title}</h2>

          {/* Summary / Description */}
          {(project.summary || project.description) && (
            <div className="mb-8">
              <p className="text-slate-600 text-lg leading-relaxed">{project.summary || project.description}</p>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" size={24} />
                {fr ? 'Fonctionnalités clés' : 'Key Features'}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="text-blue-600" size={16} />
                    </div>
                    <span className="text-slate-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {fr ? 'Technologies utilisées' : 'Technologies Used'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg font-medium text-sm border border-blue-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Objectives */}
          {project.objectifs && (
            <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {fr ? 'Objectifs & Impact' : 'Goals & Impact'}
              </h3>
              <p className="text-slate-700 leading-relaxed">{project.objectifs}</p>
            </div>
          )}

          {/* CTA */}
          {project.project_url ? (
            <a href={project.project_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1">
              {fr ? 'Visiter le site web' : 'Visit website'}
              <ExternalLink size={20} />
            </a>
          ) : (
            <div className="bg-slate-100 rounded-xl p-4 text-slate-600">
              {fr ? 'Ce projet est une réalisation en galerie' : 'This project is a gallery item'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Video Player Overlay ---
function VideoPlayerOverlay({ video, fr, onClose }: { video: VideoPortfolio; fr: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-3xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <AnimatedBackground />
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Video Player Area */}
        <div className="relative bg-black rounded-t-3xl overflow-hidden">
          {video.video_embed ? (
            <div className="aspect-video" dangerouslySetInnerHTML={{ __html: video.video_embed }} />
          ) : video.video_url ? (
            <div className="aspect-video">
              {video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(video.video_url)}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              ) : video.video_url.includes('vimeo.com') ? (
                <iframe
                  src={`https://player.vimeo.com/video/${extractVimeoId(video.video_url)}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={video.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <a href={video.video_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                    <Play size={24} />
                    {fr ? 'Ouvrir la vidéo' : 'Open video'}
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center">
              <img src={video.cover_image_url} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl transition-colors shadow-lg z-10">
            <X className="text-slate-900" size={24} />
          </button>
        </div>

        {/* Video Info */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">{video.video_platform}</span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
              {video.size_category === 'short' ? (fr ? 'Court' : 'Short') : video.size_category === 'medium' ? 'Medium' : 'Long'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{video.title}</h2>
          {video.description && <p className="text-slate-600 text-lg leading-relaxed">{video.description}</p>}

          {video.video_url && (
            <a href={video.video_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all">
              {fr ? 'Ouvrir dans une nouvelle fenêtre' : 'Open in new window'}
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
  return match ? match[1] : '';
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none animate-hue opacity-60">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/30 blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/30 blur-[120px] animate-float-delayed" />
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-600/30 blur-[100px] animate-float-slow" />
      <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] rounded-full bg-sky-600/30 blur-[100px] animate-float" />
    </div>
  );
}
