import { useState, useEffect, useMemo } from 'react';
import {
  X, Plus, Save, ChevronDown, ChevronUp, Bell,
  LayoutDashboard, FileText, Globe, Palette, Video,
  Mail, Trophy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, PortfolioProject, ProjectSubmission, NewsletterSubscriber, VideoPortfolio, ContestSubmission, SITE_SETTING_CONTEST_DEADLINE, DEFAULT_CONTEST_DEADLINE } from '../lib/supabase';
import { Language } from '../translations';
import { ImageUploader, MultiImageUploader } from './ImageUploader';
import { ConfirmModal } from './ConfirmModal';

import { Sidebar, Tab } from './admin/Sidebar';
import { DashboardOverview } from './admin/DashboardOverview';
import { ProjectSubmissionsTab } from './admin/ProjectSubmissionsTab';
import { ContestTab } from './admin/ContestTab';
import { NewsletterTab } from './admin/NewsletterTab';
import { PortfolioWebTab } from './admin/PortfolioWebTab';
import { PortfolioGraphicTab } from './admin/PortfolioGraphicTab';
import { PortfolioVideoTab } from './admin/PortfolioVideoTab';

interface AdminDashboardProps {
  onLogout: () => void;
  language: Language;
}

export function AdminDashboard({ onLogout, language }: AdminDashboardProps) {
  const fr = language === 'fr';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [contestSubmissions, setContestSubmissions] = useState<ContestSubmission[]>([]);
  const [webProjects, setWebProjects] = useState<PortfolioProject[]>([]);
  const [graphicProjects, setGraphicProjects] = useState<PortfolioProject[]>([]);
  const [videos, setVideos] = useState<VideoPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestDeadline, setContestDeadline] = useState(DEFAULT_CONTEST_DEADLINE);
  const [userRole, setUserRole] = useState<'super_admin' | 'editor' | 'viewer'>('editor');
  const canEdit = userRole !== 'viewer';
  const canDelete = userRole === 'super_admin';

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; name: string; type: string; time: string }[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states for web project
  const [webForm, setWebForm] = useState({
    title: '', category: '', thumbnail_url: '', project_url: '',
    description: '', summary: '', features: [] as string[], technologies: [] as string[],
    images: [] as string[], objectifs: '', order_index: 0, is_featured: false, is_visible: true
  });

  // Form states for video
  const [videoForm, setVideoForm] = useState<{
    title: string;
    cover_image_url: string;
    video_url: string;
    video_embed: string;
    video_platform: 'youtube' | 'vimeo' | 'mega' | 'other';
    size_category: 'short' | 'medium' | 'long';
    description: string;
    order_index: number;
    is_visible: boolean;
  }>({
    title: '', cover_image_url: '', video_url: '', video_embed: '',
    video_platform: 'youtube', size_category: 'medium',
    description: '', order_index: 0, is_visible: true
  });

  // Graphic gallery images
  const [graphicForm, setGraphicForm] = useState({
    title: '', thumbnail_url: '', description: '', images: [] as string[],
    order_index: 0, is_visible: true
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { }
  });

  useEffect(() => { fetchAll(); }, []);

  // Fetch current user role
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('admin_users').select('role').eq('id', session.user.id).maybeSingle()
          .then(({ data }) => { if (data?.role) setUserRole(data.role); });
      }
    });
  }, []);

  // Re-fetch data when portfolio items are reordered via drag & drop
  useEffect(() => {
    const handler = () => fetchAll();
    window.addEventListener('portfolio-reorder', handler);
    return () => window.removeEventListener('portfolio-reorder', handler);
  }, []);

  // Supabase Realtime — listen for new project submissions
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_submissions' }, (payload: any) => {
        const s = payload.new;
        setNotifications(prev => [{
          id: s.id,
          name: s.name || 'Nouveau',
          type: s.project_type || 'Projet',
          time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 20));
        // Auto-refresh data
        fetchAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, newsRes, contestRes, webRes, gfxRes, vidRes, deadlineRes] = await Promise.all([
        supabase.from('project_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
        supabase.from('contest_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('portfolio_projects').select('*').eq('portfolio_type', 'web_app').order('order_index'),
        supabase.from('portfolio_projects').select('*').eq('portfolio_type', 'graphic_design').order('order_index'),
        supabase.from('video_portfolio').select('*').order('order_index'),
        supabase.from('site_settings').select('value').eq('key', SITE_SETTING_CONTEST_DEADLINE).maybeSingle(),
      ]);
      setSubmissions(subRes.data || []);
      setSubscribers(newsRes.data || []);
      setContestSubmissions(contestRes.data || []);
      if (deadlineRes.data?.value) setContestDeadline(deadlineRes.data.value);
      else if (!deadlineRes.error) setContestDeadline(DEFAULT_CONTEST_DEADLINE);
      setWebProjects(webRes.data || []);
      setGraphicProjects(gfxRes.data || []);
      setVideos(vidRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const newSubmissionsCount = useMemo(() => submissions.filter(s => s.status === 'new').length, [submissions]);
  const newContestCount = useMemo(() => contestSubmissions.filter(s => s.status === 'new').length, [contestSubmissions]);

  const handleLogout = async () => { await supabase.auth.signOut(); onLogout(); };

  // --- CRUD helpers ---
  const saveWebProject = async () => {
    try {
      const payload = { ...webForm, portfolio_type: 'web_app' };
      if (editingItem) {
        const { error } = await supabase.from('portfolio_projects').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('portfolio_projects').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false); setEditingItem(null); fetchAll();
    } catch (e: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Erreur',
        message: e.message,
        type: 'danger',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const saveGraphicProject = async () => {
    try {
      const payload = { ...graphicForm, portfolio_type: 'graphic_design', category: 'Graphic Design' };
      if (editingItem) {
        const { error } = await supabase.from('portfolio_projects').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('portfolio_projects').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false); setEditingItem(null); fetchAll();
    } catch (e: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Erreur',
        message: e.message,
        type: 'danger',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const saveVideo = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase.from('video_portfolio').update(videoForm).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('video_portfolio').insert([videoForm]);
        if (error) throw error;
      }
      setShowModal(false); setEditingItem(null); fetchAll();
    } catch (e: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Erreur',
        message: e.message,
        type: 'danger',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const deleteItem = (table: string, id: string) => {
    setConfirmModal({
      isOpen: true,
      title: fr ? 'Confirmation' : 'Confirmation',
      message: fr ? 'Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.' : 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;
          fetchAll();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e: any) {
          setConfirmModal({
            isOpen: true,
            title: 'Erreur',
            message: e.message,
            type: 'danger',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
  };

  const deleteMultiple = (table: string, ids: string[]) => {
    setConfirmModal({
      isOpen: true,
      title: fr ? 'Confirmation' : 'Confirmation',
      message: fr ? `Voulez-vous vraiment supprimer les ${ids.length} éléments sélectionnés ? Cette action est irréversible.` : `Are you sure you want to delete the ${ids.length} selected items? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from(table).delete().in('id', ids);
          if (error) throw error;
          fetchAll();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e: any) {
          setConfirmModal({
            isOpen: true,
            title: 'Erreur',
            message: e.message,
            type: 'danger',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
  };

  const toggleVisibility = async (table: string, item: any) => {
    await supabase.from(table).update({ is_visible: !item.is_visible }).eq('id', item.id);
    fetchAll();
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    await supabase.from('project_submissions').update({ status }).eq('id', id);
    fetchAll();
  };

  const updateContestStatus = async (id: string, status: string) => {
    await supabase.from('contest_submissions').update({ status }).eq('id', id);
    fetchAll();
  };

  const saveContestDeadline = async () => {
    if (!canEdit) return;
    try {
      const { error } = await supabase.from('site_settings').upsert(
        { key: SITE_SETTING_CONTEST_DEADLINE, value: contestDeadline },
        { onConflict: 'key' }
      );
      if (error) throw error;
      toast.success(fr ? 'Date de clôture enregistrée.' : 'Closing date saved.');
      fetchAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || (fr ? 'Erreur lors de l\'enregistrement.' : 'Save failed.'));
    }
  };

  // --- Edit handlers ---
  const editWebProject = (p: PortfolioProject) => {
    setEditingItem(p);
    setWebForm({
      title: p.title, category: p.category, thumbnail_url: p.thumbnail_url,
      project_url: p.project_url || '', description: p.description || '',
      summary: p.summary || '', features: p.features || [], technologies: p.technologies || [],
      images: p.images || [], objectifs: p.objectifs || '', order_index: p.order_index,
      is_featured: p.is_featured, is_visible: p.is_visible
    });
    setShowModal(true);
  };

  const editGraphicProject = (p: PortfolioProject) => {
    setEditingItem(p);
    setGraphicForm({
      title: p.title, thumbnail_url: p.thumbnail_url, description: p.description || '',
      images: p.images || [], order_index: p.order_index, is_visible: p.is_visible
    });
    setShowModal(true);
  };

  const editVideo = (v: VideoPortfolio) => {
    setEditingItem(v);
    setVideoForm({
      title: v.title, cover_image_url: v.cover_image_url, video_url: v.video_url,
      video_embed: v.video_embed, video_platform: v.video_platform,
      size_category: v.size_category, description: v.description,
      order_index: v.order_index, is_visible: v.is_visible
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingItem(null);
    if (activeTab === 'portfolio-web') {
      setWebForm({ title: '', category: '', thumbnail_url: '', project_url: '', description: '', summary: '', features: [], technologies: [], images: [], objectifs: '', order_index: webProjects.length, is_featured: false, is_visible: true });
    } else if (activeTab === 'portfolio-graphic') {
      setGraphicForm({ title: '', thumbnail_url: '', description: '', images: [], order_index: graphicProjects.length, is_visible: true });
    } else if (activeTab === 'portfolio-video') {
      setVideoForm({ title: '', cover_image_url: '', video_url: '', video_embed: '', video_platform: 'youtube', size_category: 'medium', description: '', order_index: videos.length, is_visible: true });
    }
    setShowModal(true);
  };

  // Nav items
  const navItems = [
    { id: 'dashboard' as Tab, icon: LayoutDashboard, label: fr ? 'Tableau de bord' : 'Dashboard' },
    { id: 'forms-project' as Tab, icon: FileText, label: fr ? 'Demandes projet' : 'Project Requests', badge: newSubmissionsCount },
    { id: 'forms-contest' as Tab, icon: Trophy, label: fr ? 'Jeu Concours' : 'Contest Entries', badge: newContestCount },
    { id: 'forms-newsletter' as Tab, icon: Mail, label: 'Newsletter' },
    { id: 'portfolio-web' as Tab, icon: Globe, label: fr ? 'Portfolio Web/App' : 'Web/App Portfolio' },
    { id: 'portfolio-graphic' as Tab, icon: Palette, label: fr ? 'Portfolio Graphique' : 'Graphic Portfolio' },
    { id: 'portfolio-video' as Tab, icon: Video, label: fr ? 'Portfolio Vidéo' : 'Video Portfolio' },
  ];

  // --- Sections for expanded states ---
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ basic: true });
  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen relative p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      {/* Soft mesh background */}
      <div className="fixed inset-0 bg-[#e6ebf2] -z-20"></div>
      <div className="fixed inset-0 opacity-60 blur-[100px] pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/40 rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-300/40 rounded-full mix-blend-multiply"></div>
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-pink-200/40 rounded-full mix-blend-multiply"></div>
      </div>

      {/* Glass Container */}
      <div className="relative z-10 w-[96vw] max-w-[1600px] h-[94vh] flex bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          navItems={navItems} 
          handleLogout={handleLogout} 
          fr={fr} 
        />

        {/* Main Content */}
        <main className={`flex-1 min-w-0 flex flex-col h-full overflow-hidden`}>
          <header className="bg-transparent top-0 z-40 rounded-t-[2.5rem] flex-shrink-0">
            <div className="px-10 py-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{navItems.find(n => n.id === activeTab)?.label}</h1>
                <p className="text-slate-500 font-medium text-sm tracking-wide">{fr ? 'Administration GUELICHWEB' : 'GUELICHWEB Administration'}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button onClick={() => setShowNotifPanel(!showNotifPanel)}
                    className="relative p-3 bg-white/60 hover:bg-white border border-white shadow-sm rounded-2xl transition-all duration-300">
                    <Bell size={20} className="text-slate-700" strokeWidth={2.5} />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {showNotifPanel && (
                    <div className="absolute right-0 top-14 w-80 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white z-50 overflow-hidden">
                      <div className="px-5 py-4 bg-slate-900 flex items-center justify-between">
                        <span className="text-white font-bold text-sm tracking-wide">{fr ? 'Notifications' : 'Notifications'}</span>
                        {notifications.length > 0 && (
                          <button onClick={() => setNotifications([])} className="text-white/60 hover:text-white text-xs font-bold transition-colors">
                            {fr ? 'Tout effacer' : 'Clear all'}
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto p-2">
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className="px-4 py-3 mb-1 rounded-2xl hover:bg-slate-100/80 transition-colors cursor-pointer"
                            onClick={() => { setActiveTab('forms-project'); setShowNotifPanel(false); }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 shadow-sm" />
                              <p className="text-sm font-bold text-slate-800 truncate">{n.name}</p>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-1 ml-4.5">{n.type} · {n.time}</p>
                          </div>
                        )) : (
                          <div className="px-4 py-10 text-center font-medium text-slate-400 text-sm">
                            {fr ? 'Aucune notification' : 'No notifications'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {canEdit && ['portfolio-web', 'portfolio-graphic', 'portfolio-video'].includes(activeTab) && (
                  <button onClick={openNewModal} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:scale-105 transition-all">
                    <Plus size={18} strokeWidth={3} />
                    {fr ? 'Ajouter' : 'Add'}
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 h-0 overflow-x-hidden overflow-y-auto px-4 md:px-10 pb-10">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent" />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                {activeTab === 'dashboard' && <DashboardOverview submissions={submissions} subscribers={subscribers} contestSubmissions={contestSubmissions} webProjects={webProjects} graphicProjects={graphicProjects} videos={videos} fr={fr} />}
                {activeTab === 'forms-project' && <ProjectSubmissionsTab submissions={submissions} searchQuery={searchQuery} setSearchQuery={setSearchQuery} updateStatus={updateSubmissionStatus} deleteItem={canDelete ? (id: string) => deleteItem('project_submissions', id) : null} fr={fr} />}
                {activeTab === 'forms-contest' && (
                  <ContestTab
                    submissions={contestSubmissions}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    updateStatus={updateContestStatus}
                    deleteItem={canDelete ? (id: string) => deleteItem('contest_submissions', id) : null}
                    fr={fr}
                    contestDeadline={contestDeadline}
                    setContestDeadline={setContestDeadline}
                    onSaveContestDeadline={saveContestDeadline}
                    canEdit={canEdit}
                  />
                )}
                {activeTab === 'forms-newsletter' && <NewsletterTab subscribers={subscribers} searchQuery={searchQuery} setSearchQuery={setSearchQuery} deleteItem={canDelete ? (id: string) => deleteItem('newsletter_subscribers', id) : null} deleteMultiple={canDelete ? (ids: string[]) => deleteMultiple('newsletter_subscribers', ids) : null} fr={fr} />}
                {activeTab === 'portfolio-web' && <PortfolioWebTab projects={webProjects} onEdit={canEdit ? editWebProject : null} onDelete={canDelete ? (id: string) => deleteItem('portfolio_projects', id) : null} onToggle={canEdit ? (p: any) => toggleVisibility('portfolio_projects', p) : null} fr={fr} />}
                {activeTab === 'portfolio-graphic' && <PortfolioGraphicTab projects={graphicProjects} onEdit={canEdit ? editGraphicProject : null} onDelete={canDelete ? (id: string) => deleteItem('portfolio_projects', id) : null} onToggle={canEdit ? (p: any) => toggleVisibility('portfolio_projects', p) : null} fr={fr} />}
                {activeTab === 'portfolio-video' && <PortfolioVideoTab videos={videos} onEdit={canEdit ? editVideo : null} onDelete={canDelete ? (id: string) => deleteItem('video_portfolio', id) : null} onToggle={canEdit ? (v: any) => toggleVisibility('video_portfolio', v) : null} fr={fr} />}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? (fr ? 'Modifier' : 'Edit') : (fr ? 'Nouveau' : 'New')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="text-white" size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {activeTab === 'portfolio-web' && (
                <WebProjectForm form={webForm} setForm={setWebForm} expanded={expandedSections} toggle={toggleSection} fr={fr} onSave={saveWebProject} onCancel={() => setShowModal(false)} />
              )}
              {activeTab === 'portfolio-graphic' && (
                <GraphicProjectForm form={graphicForm} setForm={setGraphicForm} fr={fr} onSave={saveGraphicProject} onCancel={() => setShowModal(false)} />
              )}
              {activeTab === 'portfolio-video' && (
                <VideoProjectForm form={videoForm} setForm={setVideoForm} fr={fr} onSave={saveVideo} onCancel={() => setShowModal(false)} />
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        language={language}
      />
    </div>
  );
}

// =======================================================================
// FORM COMPONENTS
// =======================================================================

function SectionBlock({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        {expanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      {expanded && <div className="p-4 bg-white space-y-4">{children}</div>}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', required = false, rows }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}{required && ' *'}</label>
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
      )}
    </div>
  );
}

function TagsInput({ items, onChange, placeholder, addLabel }: { items: string[]; onChange: (i: string[]) => void; placeholder: string; addLabel: string }) {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim()) { onChange([...items, val.trim()]); setVal(''); } };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium">
            {item}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="hover:text-red-500"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={add} type="button" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{addLabel}</button>
      </div>
    </div>
  );
}

function FormActions({ onSave, onCancel, fr }: { onSave: () => void; onCancel: () => void; fr: boolean }) {
  return (
    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-slate-100 -mx-6 px-6 py-4">
      <button onClick={onSave} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all text-sm">
        <Save size={18} />{fr ? 'Enregistrer' : 'Save'}
      </button>
      <button onClick={onCancel} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm">{fr ? 'Annuler' : 'Cancel'}</button>
    </div>
  );
}

// --- Web Project Form ---
function WebProjectForm({ form, setForm, expanded, toggle, fr, onSave, onCancel }: any) {
  return (
    <>
      <SectionBlock title={fr ? 'Informations de base' : 'Basic Info'} expanded={expanded.basic !== false} onToggle={() => toggle('basic')}>
        <InputField label={fr ? 'Titre' : 'Title'} value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} required />
        <InputField label={fr ? 'Catégorie' : 'Category'} value={form.category} onChange={(v: string) => setForm({ ...form, category: v })} placeholder="Ex: Web Design, E-commerce..." />
        <InputField label={fr ? 'URL du projet' : 'Project URL'} value={form.project_url} onChange={(v: string) => setForm({ ...form, project_url: v })} type="url" placeholder="https://..." />
        <InputField label={fr ? 'Ordre' : 'Order'} value={form.order_index} onChange={(v: string) => setForm({ ...form, order_index: parseInt(v) || 0 })} type="number" />
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-700">Visible</span>
          </label>
        </div>
      </SectionBlock>

      <SectionBlock title={fr ? 'Images (couverture + secondaires)' : 'Images (cover + secondary)'} expanded={expanded.images !== false} onToggle={() => toggle('images')}>
        <p className="text-xs text-slate-500 mb-2">{fr ? 'Première image = couverture. Max 3 images.' : 'First image = cover. Max 3 images.'}</p>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(idx => (
            <ImageUploader
              key={idx}
              value={form.images[idx] || ''}
              onChange={(url) => {
                const imgs = [...form.images];
                if (url) { imgs[idx] = url; } else { imgs.splice(idx, 1); }
                setForm({ ...form, images: imgs, thumbnail_url: imgs[0] || form.thumbnail_url });
              }}
              folder="web-projects"
              label={idx === 0 ? (fr ? 'Couverture' : 'Cover') : `Image ${idx + 1}`}
              className="aspect-[4/3]"
            />
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title={fr ? 'Détails' : 'Details'} expanded={!!expanded.details} onToggle={() => toggle('details')}>
        <InputField label={fr ? 'Description courte' : 'Short Description'} value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} rows={2} />
        <InputField label={fr ? 'Résumé détaillé' : 'Detailed Summary'} value={form.summary} onChange={(v: string) => setForm({ ...form, summary: v })} rows={4} />
        <InputField label={fr ? 'Objectifs' : 'Objectives'} value={form.objectifs} onChange={(v: string) => setForm({ ...form, objectifs: v })} rows={3} />
      </SectionBlock>

      <SectionBlock title={fr ? 'Fonctionnalités' : 'Features'} expanded={!!expanded.features} onToggle={() => toggle('features')}>
        <TagsInput items={form.features} onChange={(f) => setForm({ ...form, features: f })} placeholder={fr ? 'Ex: Design responsive...' : 'Ex: Responsive design...'} addLabel="+" />
      </SectionBlock>

      <SectionBlock title="Technologies" expanded={!!expanded.tech} onToggle={() => toggle('tech')}>
        <TagsInput items={form.technologies} onChange={(t) => setForm({ ...form, technologies: t })} placeholder="Ex: React, Node.js..." addLabel="+" />
      </SectionBlock>

      <FormActions onSave={() => { if (form.images[0]) setForm((f: any) => ({ ...f, thumbnail_url: f.images[0] })); onSave(); }} onCancel={onCancel} fr={fr} />
    </>
  );
}

// --- Graphic Project Form ---
function GraphicProjectForm({ form, setForm, fr, onSave, onCancel }: any) {
  return (
    <>
      <InputField label={fr ? 'Titre de la collection' : 'Collection Title'} value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} required />
      <InputField label="Description" value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} rows={2} />
      <InputField label={fr ? 'Ordre' : 'Order'} value={form.order_index} onChange={(v: string) => setForm({ ...form, order_index: parseInt(v) || 0 })} type="number" />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
        <span className="text-sm text-slate-700">Visible</span>
      </label>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{fr ? 'Couverture' : 'Cover Image'}</label>
        <ImageUploader value={form.thumbnail_url} onChange={(url) => setForm({ ...form, thumbnail_url: url })} folder="graphic-design" label={fr ? 'Couverture' : 'Cover'} className="aspect-video w-full max-w-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{fr ? 'Galerie d\'images' : 'Image Gallery'}</label>
        <MultiImageUploader images={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} folder="graphic-design" />
      </div>

      <FormActions onSave={onSave} onCancel={onCancel} fr={fr} />
    </>
  );
}

// --- Video Project Form ---
function VideoProjectForm({ form, setForm, fr, onSave, onCancel }: any) {
  return (
    <>
      <InputField label={fr ? 'Titre' : 'Title'} value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} required />
      <InputField label="Description" value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} rows={2} />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{fr ? 'Image de couverture' : 'Cover Image'}</label>
        <ImageUploader value={form.cover_image_url} onChange={(url) => setForm({ ...form, cover_image_url: url })} folder="videos" label={fr ? 'Couverture vidéo' : 'Video Cover'} className="aspect-video w-full max-w-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{fr ? 'Plateforme' : 'Platform'}</label>
          <select value={form.video_platform} onChange={e => setForm({ ...form, video_platform: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="mega">Mega.nz</option>
            <option value="other">{fr ? 'Autre' : 'Other'}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{fr ? 'Taille' : 'Size'}</label>
          <select value={form.size_category} onChange={e => setForm({ ...form, size_category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="short">{fr ? 'Court (< 1min)' : 'Short (< 1min)'}</option>
            <option value="medium">Medium (1-5 min)</option>
            <option value="long">Long (5+ min)</option>
          </select>
        </div>
      </div>

      <InputField label={fr ? 'URL de la vidéo' : 'Video URL'} value={form.video_url} onChange={(v: string) => setForm({ ...form, video_url: v })} type="url" placeholder="https://youtube.com/watch?v=..." />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{fr ? 'Code d\'intégration HTML (optionnel)' : 'HTML Embed Code (optional)'}</label>
        <textarea value={form.video_embed} onChange={e => setForm({ ...form, video_embed: e.target.value })} rows={4}
          placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe>'
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs" />
      </div>

      <InputField label={fr ? 'Ordre' : 'Order'} value={form.order_index} onChange={(v: string) => setForm({ ...form, order_index: parseInt(v) || 0 })} type="number" />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
        <span className="text-sm text-slate-700">Visible</span>
      </label>

      <FormActions onSave={onSave} onCancel={onCancel} fr={fr} />
    </>
  );
}
