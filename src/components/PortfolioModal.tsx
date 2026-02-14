import { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Image as ImageIcon, Filter, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase, PortfolioProject } from '../lib/supabase';
import { getTranslation, Language } from '../translations';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface ProjectDetails {
  summary?: string;
  features?: string[];
  technologies?: string[];
  images?: string[];
  objectifs?: string;
}

export function PortfolioModal({ isOpen, onClose, language }: PortfolioModalProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const t = getTranslation(language);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('is_visible', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('video')) return Play;
    if (category.toLowerCase().includes('link')) return ExternalLink;
    return ImageIcon;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {language === 'fr' ? 'Portfolio GUELICHWEB' : 'GUELICHWEB Portfolio'}
              </h2>
              <p className="text-blue-100">
                {language === 'fr' ? 'Découvrez nos réalisations' : 'Discover our work'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="text-white" size={28} />
            </button>
          </div>

          <div className="px-8 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Filter className="text-slate-600 flex-shrink-0" size={20} />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => {
                  const Icon = getCategoryIcon(project.category);
                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-slate-200"
                    >
                      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <Icon className="text-blue-600" size={14} />
                            <span className="text-xs font-semibold text-slate-700">{project.category}</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                            {language === 'fr' ? 'Voir détails' : 'View details'}
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                  <ImageIcon className="text-slate-400" size={40} />
                </div>
                <p className="text-slate-600 text-lg">
                  {language === 'fr' ? 'Aucun projet dans cette catégorie' : 'No projects in this category'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProject && (() => {
        let projectDetails: ProjectDetails = {};
        try {
          projectDetails = typeof selectedProject.description === 'string'
            ? JSON.parse(selectedProject.description)
            : selectedProject.description || {};
        } catch (e) {
          projectDetails = { summary: selectedProject.description as string };
        }

        const images = projectDetails.images || [selectedProject.thumbnail_url];
        const currentImage = images[currentImageIndex] || images[0];

        const nextImage = () => {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
        };

        const prevImage = () => {
          setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        };

        const handleProjectClose = () => {
          setSelectedProject(null);
          setCurrentImageIndex(0);
        };

        return (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="relative flex items-center justify-center max-h-[70vh]">
                  <img
                    src={currentImage}
                    alt={selectedProject.title}
                    className="w-full max-h-[70vh] object-contain"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg hover:scale-110"
                      >
                        <ChevronLeft className="text-slate-900" size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg hover:scale-110"
                      >
                        <ChevronRight className="text-slate-900" size={24} />
                      </button>

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              idx === currentImageIndex
                                ? 'bg-white w-8'
                                : 'bg-white/40 hover:bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleProjectClose}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl transition-colors shadow-lg"
                >
                  <X className="text-slate-900" size={24} />
                </button>

                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
                    <span className="text-sm font-semibold text-slate-700">{selectedProject.category}</span>
                  </div>
                </div>
              </div>

              {images.length > 1 && (
                <div className="border-t border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-blue-600 shadow-lg scale-105'
                            : 'border-slate-200 hover:border-blue-400 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${selectedProject.title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-8">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">{selectedProject.title}</h2>

                {projectDetails.summary && (
                  <div className="mb-8">
                    <p className="text-slate-600 text-lg leading-relaxed">
                      {projectDetails.summary}
                    </p>
                  </div>
                )}

                {projectDetails.features && projectDetails.features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="text-blue-600" size={24} />
                      {language === 'fr' ? 'Fonctionnalités clés' : 'Key Features'}
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {projectDetails.features.map((feature, idx) => (
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

                {projectDetails.technologies && projectDetails.technologies.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {language === 'fr' ? 'Technologies utilisées' : 'Technologies Used'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {projectDetails.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg font-medium text-sm border border-blue-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {projectDetails.objectifs && (
                  <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {language === 'fr' ? 'Objectifs & Impact' : 'Goals & Impact'}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {projectDetails.objectifs}
                    </p>
                  </div>
                )}

                {selectedProject.project_url && (
                  <a
                    href={selectedProject.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1"
                  >
                    {language === 'fr' ? 'Visiter le site web' : 'Visit website'}
                    <ExternalLink size={20} />
                  </a>
                )}

                {!selectedProject.project_url && (
                  <div className="bg-slate-100 rounded-xl p-4 text-slate-600">
                    {language === 'fr' ? 'Ce projet est une réalisation en galerie' : 'This project is a gallery item'}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
