import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Eye, EyeOff, Save, LogOut, Image as ImageIcon, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, PortfolioProject } from '../lib/supabase';
import { getTranslation, Language } from '../translations';

interface AdminDashboardProps {
  onLogout: () => void;
  language: Language;
}

interface FormData {
  title: string;
  category: string;
  thumbnail_url: string;
  project_url: string;
  description: string;
  summary: string;
  features: string[];
  technologies: string[];
  images: string[];
  objectifs: string;
  order_index: number;
  is_featured: boolean;
  is_visible: boolean;
}

export function AdminDashboard({ onLogout, language }: AdminDashboardProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    details: false,
    features: false,
    technologies: false,
    images: false,
  });
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: 'Link',
    thumbnail_url: '',
    project_url: '',
    description: '',
    summary: '',
    features: [],
    technologies: [],
    images: [],
    objectifs: '',
    order_index: 0,
    is_featured: false,
    is_visible: true,
  });
  const t = getTranslation(language);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('portfolio_projects')
          .update(formData)
          .eq('id', editingProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('portfolio_projects')
          .insert([formData]);

        if (error) throw error;
      }

      await fetchProjects();
      setEditingProject(null);
      setIsAddingNew(false);
      resetForm();
    } catch (error: any) {
      alert('Error saving project: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce projet ?' : 'Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProjects();
    } catch (error: any) {
      alert('Error deleting project: ' + error.message);
    }
  };

  const handleToggleVisibility = async (project: PortfolioProject) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ is_visible: !project.is_visible })
        .eq('id', project.id);

      if (error) throw error;
      await fetchProjects();
    } catch (error: any) {
      alert('Error updating visibility: ' + error.message);
    }
  };

  const handleEdit = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      category: project.category,
      thumbnail_url: project.thumbnail_url,
      project_url: project.project_url || '',
      description: project.description || '',
      summary: project.summary || '',
      features: project.features || [],
      technologies: project.technologies || [],
      images: project.images || [],
      objectifs: project.objectifs || '',
      order_index: project.order_index,
      is_featured: project.is_featured,
      is_visible: project.is_visible,
    });
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Link',
      thumbnail_url: '',
      project_url: '',
      description: '',
      summary: '',
      features: [],
      technologies: [],
      images: [],
      objectifs: '',
      order_index: projects.length,
      is_featured: false,
      is_visible: true,
    });
    setExpandedSections({
      basic: true,
      details: false,
      features: false,
      technologies: false,
      images: false,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {language === 'fr' ? 'Gestion du Portfolio' : 'Portfolio Management'}
            </h1>
            <p className="text-slate-600 text-sm">
              {language === 'fr' ? 'Gérez vos projets et réalisations' : 'Manage your projects and work'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-medium"
          >
            <LogOut size={20} />
            {language === 'fr' ? 'Déconnexion' : 'Logout'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1"
          >
            <Plus size={20} />
            {language === 'fr' ? 'Ajouter un projet' : 'Add project'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  {!project.is_visible && (
                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <span className="text-slate-900 font-semibold">
                          {language === 'fr' ? 'Masqué' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{project.title}</h3>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                    >
                      <Edit2 size={16} />
                      {language === 'fr' ? 'Modifier' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(project)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title={project.is_visible ? 'Hide' : 'Show'}
                    >
                      {project.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(editingProject || isAddingNew) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingProject
                  ? (language === 'fr' ? 'Modifier le projet' : 'Edit project')
                  : (language === 'fr' ? 'Nouveau projet' : 'New project')}
              </h3>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsAddingNew(false);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Section
                title={language === 'fr' ? 'Informations de base' : 'Basic Information'}
                isExpanded={expandedSections.basic}
                onToggle={() => setExpandedSections(prev => ({ ...prev, basic: !prev.basic }))}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'Titre' : 'Title'} *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'Catégorie' : 'Category'} *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder={language === 'fr' ? 'Ex: Web Design, Illustration, etc.' : 'Ex: Web Design, Illustration, etc.'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'URL de l\'image miniature' : 'Thumbnail Image URL'} *
                    </label>
                    <div className="flex gap-2">
                      <ImageIcon className="text-slate-400 flex-shrink-0 mt-3" size={20} />
                      <input
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="https://..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'URL du projet' : 'Project URL'}
                    </label>
                    <div className="flex gap-2">
                      <ExternalLink className="text-slate-400 flex-shrink-0 mt-3" size={20} />
                      <input
                        type="url"
                        value={formData.project_url}
                        onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'Ordre d\'affichage' : 'Display Order'}
                    </label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {language === 'fr' ? 'Projet mis en avant' : 'Featured'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_visible}
                        onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {language === 'fr' ? 'Visible' : 'Visible'}
                      </span>
                    </label>
                  </div>
                </div>
              </Section>

              <Section
                title={language === 'fr' ? 'Détails du projet' : 'Project Details'}
                isExpanded={expandedSections.details}
                onToggle={() => setExpandedSections(prev => ({ ...prev, details: !prev.details }))}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'Description courte' : 'Short Description'}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder={language === 'fr' ? 'Description visible sur la carte du projet' : 'Description visible on project card'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'Résumé détaillé' : 'Detailed Summary'}
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder={language === 'fr' ? 'Résumé complet du projet visible dans le modal' : 'Full project summary visible in modal'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === 'fr' ? 'Objectifs' : 'Objectives'}
                    </label>
                    <textarea
                      value={formData.objectifs}
                      onChange={(e) => setFormData({ ...formData, objectifs: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder={language === 'fr' ? 'Objectifs du projet' : 'Project objectives'}
                    />
                  </div>
                </div>
              </Section>

              <Section
                title={language === 'fr' ? 'Fonctionnalités' : 'Features'}
                isExpanded={expandedSections.features}
                onToggle={() => setExpandedSections(prev => ({ ...prev, features: !prev.features }))}
              >
                <ArrayManager
                  items={formData.features}
                  onChange={(features) => setFormData({ ...formData, features })}
                  placeholder={language === 'fr' ? 'Ex: Design responsive, Interface intuitive...' : 'Ex: Responsive design, Intuitive interface...'}
                  addLabel={language === 'fr' ? 'Ajouter une fonctionnalité' : 'Add feature'}
                  language={language}
                />
              </Section>

              <Section
                title={language === 'fr' ? 'Technologies' : 'Technologies'}
                isExpanded={expandedSections.technologies}
                onToggle={() => setExpandedSections(prev => ({ ...prev, technologies: !prev.technologies }))}
              >
                <ArrayManager
                  items={formData.technologies}
                  onChange={(technologies) => setFormData({ ...formData, technologies })}
                  placeholder={language === 'fr' ? 'Ex: React, TypeScript, Tailwind CSS...' : 'Ex: React, TypeScript, Tailwind CSS...'}
                  addLabel={language === 'fr' ? 'Ajouter une technologie' : 'Add technology'}
                  language={language}
                />
              </Section>

              <Section
                title={language === 'fr' ? 'Images additionnelles' : 'Additional Images'}
                isExpanded={expandedSections.images}
                onToggle={() => setExpandedSections(prev => ({ ...prev, images: !prev.images }))}
              >
                <ArrayManager
                  items={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                  placeholder={language === 'fr' ? 'URL de l\'image (https://...)' : 'Image URL (https://...)'}
                  addLabel={language === 'fr' ? 'Ajouter une image' : 'Add image'}
                  language={language}
                  type="url"
                />
              </Section>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-slate-200 -mx-6 px-6 py-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                >
                  <Save size={20} />
                  {language === 'fr' ? 'Enregistrer' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsAddingNew(false);
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <h4 className="font-bold text-slate-900">{title}</h4>
        {isExpanded ? <ChevronUp size={20} className="text-slate-600" /> : <ChevronDown size={20} className="text-slate-600" />}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

interface ArrayManagerProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  language: Language;
  type?: 'text' | 'url';
}

function ArrayManager({ items, onChange, placeholder, addLabel, language, type = 'text' }: ArrayManagerProps) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <span className="text-slate-500 text-sm font-medium mt-3 flex-shrink-0">{index + 1}.</span>
          {type === 'url' ? (
            <div className="flex-1 relative">
              <input
                type="url"
                value={item}
                onChange={(e) => handleUpdate(index, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              {item && (
                <img
                  src={item}
                  alt=""
                  className="mt-2 rounded-lg max-h-32 object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>
          ) : (
            <input
              type="text"
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          )}
          <button
            onClick={() => handleRemove(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title={language === 'fr' ? 'Supprimer' : 'Remove'}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <input
          type={type}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
