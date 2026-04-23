import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Plus, Edit2, Trash2, Eye, EyeOff, Save, LogOut,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Search, Download, FileSpreadsheet, GripVertical, Bell,
  LayoutDashboard, FileText, Globe, Palette, Video,
  Mail, Phone, Calendar, MoreVertical, Trophy,
  TrendingUp, FolderOpen, Play
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { supabase, PortfolioProject, ProjectSubmission, NewsletterSubscriber, VideoPortfolio, ContestSubmission, SITE_SETTING_CONTEST_DEADLINE, DEFAULT_CONTEST_DEADLINE } from '../lib/supabase';
import { Language } from '../translations';
import { ImageUploader, MultiImageUploader } from './ImageUploader';
import { ConfirmModal } from './ConfirmModal';

interface AdminDashboardProps {
  onLogout: () => void;
  language: Language;
}

type Tab = 'dashboard' | 'forms-project' | 'forms-newsletter' | 'forms-contest' | 'portfolio-web' | 'portfolio-graphic' | 'portfolio-video';

// CSV export utility
function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// XLSX export utility
function exportXLSX(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const ws = XLSX.utils.json_to_sheet(data);
  // Auto-size columns
  const colWidths = Object.keys(data[0]).map(key => {
    const maxLen = Math.max(key.length, ...data.map(row => String(row[key] ?? '').length));
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
  const [videoForm, setVideoForm] = useState({
    title: '', cover_image_url: '', video_url: '', video_embed: '',
    video_platform: 'youtube' as const, size_category: 'medium' as const,
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
        <aside className={`${sidebarOpen ? 'w-64' : 'w-24'} flex-shrink-0 flex flex-col transition-all duration-300 border-r border-white/30 z-50 bg-white/10`}>
          <div className="p-6 flex items-center gap-3 mt-4">
            {sidebarOpen ? (
              <span className="font-extrabold text-2xl text-slate-800 tracking-tight ml-2">GUELICHWEB</span>
            ) : (
              <div className="w-10 h-10 bg-slate-800 rounded-xl mx-auto flex items-center justify-center"><span className="text-white font-bold">GW</span></div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-2 bg-white/50 hover:bg-white border border-white shadow-sm rounded-xl transition-all">
              <MoreVertical size={18} className="text-slate-600" />
            </button>
          </div>
          
          <nav className="flex-1 py-6 space-y-3 px-4 overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 font-bold ${activeTab === item.id ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 border border-white/80 scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
              >
                <item.icon size={20} className={activeTab === item.id ? "text-slate-900 drop-shadow-sm" : "text-slate-400"} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                {sidebarOpen && <span className="truncate text-sm tracking-wide">{item.label}</span>}
                {sidebarOpen && item.badge ? (
                  <span className="ml-auto bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
          
          <div className="p-4 mt-auto mb-4 border-t border-white/20">
            <button onClick={handleLogout} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] text-slate-500 hover:text-slate-800 hover:bg-white/40 border border-transparent hover:border-white/50 transition-all font-bold`}>
              <LogOut size={20} strokeWidth={2.5} />
              {sidebarOpen && <span className="text-sm tracking-wide">{fr ? 'Déconnexion' : 'Logout'}</span>}
            </button>
          </div>
        </aside>

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
                {activeTab === 'dashboard' && <DashboardTab submissions={submissions} subscribers={subscribers} contestSubmissions={contestSubmissions} webProjects={webProjects} graphicProjects={graphicProjects} videos={videos} fr={fr} />}
                {activeTab === 'forms-project' && <SubmissionsTab submissions={submissions} searchQuery={searchQuery} setSearchQuery={setSearchQuery} updateStatus={updateSubmissionStatus} deleteItem={canDelete ? (id: string) => deleteItem('project_submissions', id) : null} fr={fr} />}
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
                {activeTab === 'portfolio-web' && <WebPortfolioTab projects={webProjects} onEdit={canEdit ? editWebProject : null} onDelete={canDelete ? (id: string) => deleteItem('portfolio_projects', id) : null} onToggle={canEdit ? (p: any) => toggleVisibility('portfolio_projects', p) : null} fr={fr} />}
                {activeTab === 'portfolio-graphic' && <GraphicPortfolioTab projects={graphicProjects} onEdit={canEdit ? editGraphicProject : null} onDelete={canDelete ? (id: string) => deleteItem('portfolio_projects', id) : null} onToggle={canEdit ? (p: any) => toggleVisibility('portfolio_projects', p) : null} fr={fr} />}
                {activeTab === 'portfolio-video' && <VideoPortfolioTab videos={videos} onEdit={canEdit ? editVideo : null} onDelete={canDelete ? (id: string) => deleteItem('video_portfolio', id) : null} onToggle={canEdit ? (v: any) => toggleVisibility('video_portfolio', v) : null} fr={fr} />}
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

// --- Contest Tab ---
function ContestTab({
  submissions,
  searchQuery,
  setSearchQuery,
  updateStatus,
  deleteItem,
  fr,
  contestDeadline,
  setContestDeadline,
  onSaveContestDeadline,
  canEdit,
}: any) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const filtered = submissions.filter((s: ContestSubmission) =>
    !searchQuery || [s.full_name, s.email, s.whatsapp, s.company_name, s.sector, s.activity_description].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getExportData = () => submissions.map((s: ContestSubmission) => ({
    Nom: s.full_name,
    Email: s.email,
    WhatsApp: s.whatsapp,
    Entreprise: s.company_name,
    Secteur: s.sector,
    'A déjà des clients': s.has_clients,
    'Présence réseaux': s.has_social_media,
    Description: s.activity_description,
    'Pourquoi gagner': s.why_win,
    Statut: s.status,
    Date: s.created_at
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-amber-200/60 shadow-sm p-5 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-800/80 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calendar size={14} className="text-amber-600" />
            {fr ? 'Date affichée sur la page Concours' : 'Date shown on Contest page'}
          </p>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {fr ? 'Clôture des inscriptions' : 'Registration closing date'}
          </label>
          <input
            type="date"
            value={contestDeadline}
            onChange={e => setContestDeadline(e.target.value)}
            disabled={!canEdit}
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-2">
            {fr ? 'Choisis une date passée ou future ; elle apparaît sur /contest pour les visiteurs.' : 'Pick a past or future date; visitors see it on /contest.'}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => onSaveContestDeadline()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/25 hover:opacity-95 transition-opacity shrink-0"
          >
            <Save size={18} />
            {fr ? 'Enregistrer la date' : 'Save date'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} placeholder={fr ? 'Rechercher un candidat...' : 'Search candidates...'} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <button onClick={() => exportCSV(getExportData(), 'concours_guelichweb')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-medium transition-colors">
          <Download size={16} /> CSV
        </button>
        <button onClick={() => exportXLSX(getExportData(), 'concours_guelichweb')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors">
          <FileSpreadsheet size={16} /> XLSX
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-4 py-3 text-left font-semibold w-8"></th>
                <th className="px-4 py-3 text-left font-semibold">{fr ? 'Statut' : 'Status'}</th>
                <th className="px-4 py-3 text-left font-semibold">{fr ? 'Nom complet' : 'Full Name'}</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">WhatsApp</th>
                <th className="px-4 py-3 text-left font-semibold">{fr ? 'Secteur' : 'Sector'}</th>
                <th className="px-4 py-3 text-left font-semibold">{fr ? 'Entreprise' : 'Business'}</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s: ContestSubmission) => (
                <React.Fragment key={s.id}>
                  <tr onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      {expandedId === s.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={s.status} 
                        onChange={e => { e.stopPropagation(); updateStatus(s.id, e.target.value); }} 
                        onClick={e => e.stopPropagation()}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${
                          s.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                          s.status === 'contacted' ? 'bg-amber-100 text-amber-700' : 
                          s.status === 'selected' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <option value="new">{fr ? 'Nouveau' : 'New'}</option>
                        <option value="contacted">{fr ? 'Contacté' : 'Contacted'}</option>
                        <option value="selected">{fr ? 'Sélectionné' : 'Selected'}</option>
                        <option value="rejected">{fr ? 'Refusé' : 'Rejected'}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{s.full_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-500">{s.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{s.whatsapp}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{s.sector}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600 font-medium truncate max-w-[120px] block">
                        {s.company_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); deleteItem(s.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={9} className="px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{fr ? 'Détails de l\'entreprise' : 'Business Details'}</p>
                              <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <p className="text-sm text-slate-600"><span className="font-bold">{fr ? 'Nom :' : 'Name:'}</span> {s.company_name}</p>
                                <p className="text-sm text-slate-600"><span className="font-bold">{fr ? 'Secteur :' : 'Sector:'}</span> {s.sector}</p>
                                <p className="text-sm text-slate-600"><span className="font-bold">{fr ? 'Déjà des clients :' : 'Already has clients:'}</span> {s.has_clients}</p>
                                <p className="text-sm text-slate-600"><span className="font-bold">{fr ? 'Réseaux sociaux :' : 'Social media:'}</span> {s.has_social_media}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{fr ? 'Description de l\'activité' : 'Business Description'}</p>
                              <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{s.activity_description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{fr ? 'Motivation (Pourquoi gagner ?)' : 'Motivation (Why win?)'}</p>
                              <div className="bg-white rounded-xl p-4 border border-slate-200 bg-amber-50/30">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap italic font-medium">"{s.why_win}"</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                                <a 
                                  href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                  <Phone size={16} /> WhatsApp
                                </a>
                                <a 
                                  href={`mailto:${s.email}`} 
                                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors"
                                >
                                  <Mail size={16} /> Email
                                </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!filtered.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">{fr ? 'Aucun candidat trouvé' : 'No candidates found'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination total={filtered.length} page={page} setPage={setPage} fr={fr} />
        </div>
      </div>
    </div>
  );
}

// =======================================================================
// SUB-COMPONENTS
// =======================================================================

// --- Dashboard Tab ---
function DashboardTab({ submissions, subscribers, contestSubmissions = [], webProjects, graphicProjects, videos, fr }: any) {
  const stats = [
    { label: fr ? 'Demandes projet' : 'Project Requests', value: submissions.length, icon: FileText, color: 'from-blue-500 to-blue-600', newCount: submissions.filter((s: any) => s.status === 'new').length },
    { label: fr ? 'Jeu Concours' : 'Business Contest', value: contestSubmissions.length, icon: Trophy, color: 'from-purple-600 to-indigo-600', newCount: contestSubmissions.filter((s: any) => s.status === 'new').length },
    { label: 'Newsletter', value: subscribers.length, icon: Mail, color: 'from-emerald-500 to-emerald-600' },
    { label: fr ? 'Projets Web/App' : 'Web/App Projects', value: webProjects.length, icon: Globe, color: 'from-blue-400 to-blue-600' },
    { label: fr ? 'Designs Graphique/Vidéo' : 'Design / Video', value: graphicProjects.length + videos.length, icon: Palette, color: 'from-amber-500 to-amber-600' },
  ];

  // --- 30-day bar chart data ---
  const barData = useMemo(() => {
    const now = new Date();
    const days: { label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = submissions.filter((s: ProjectSubmission) => s.created_at?.slice(0, 10) === key).length;
      days.push({ label: d.getDate().toString(), count });
    }
    return days;
  }, [submissions]);
  const barMax = Math.max(1, ...barData.map(d => d.count));

  // --- Donut chart data ---
  const donutData = useMemo(() => {
    const types: Record<string, number> = {};
    submissions.forEach((s: ProjectSubmission) => {
      const t = s.project_type || (fr ? 'Autre' : 'Other');
      types[t] = (types[t] || 0) + 1;
    });
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];
    return Object.entries(types).map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  }, [submissions, fr]);
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-2xl rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:shadow-lg hover:border-white transition-all duration-300 hover:-translate-y-1">
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} mb-3 shadow-sm`}>
              <s.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</p>
            <p className="text-sm font-bold text-slate-500 mt-0.5">{s.label}</p>
            {s.newCount > 0 && <span className="inline-block mt-3 text-[10px] uppercase tracking-wider bg-slate-900 text-white font-black px-2 py-0.5 rounded-full">{s.newCount} {fr ? 'nouveau' : 'new'}</span>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — 30 day trends */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <TrendingUp size={18} className="text-blue-600" strokeWidth={2.5} />
            </div>
            {fr ? 'Demandes — 30 derniers jours' : 'Requests — Last 30 days'}
          </h3>
          <svg viewBox="0 0 600 180" className="w-full" preserveAspectRatio="xMidYMid meet">
            {barData.map((d, i) => {
              const barH = (d.count / barMax) * 140;
              const x = i * 20;
              return (
                <g key={i}>
                  <rect x={x + 2} y={150 - barH} width={16} height={barH} rx={4}
                    fill={d.count > 0 ? 'url(#barGrad)' : 'rgba(255,255,255,0.4)'} className="transition-all duration-300 hover:opacity-80" />
                  {i % 5 === 0 && (
                    <text x={x + 10} y={170} textAnchor="middle" className="fill-slate-500 font-bold" fontSize="9">{d.label}</text>
                  )}
                  {d.count > 0 && (
                    <text x={x + 10} y={146 - barH} textAnchor="middle" className="fill-slate-800 font-black" fontSize="9">{d.count}</text>
                  )}
                </g>
              );
            })}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Donut Chart — Project type distribution */}
        <div className="bg-white/50 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FolderOpen size={18} className="text-purple-600" strokeWidth={2.5} />
            </div>
            {fr ? 'Types de projets' : 'Project Types'}
          </h3>
          {donutTotal > 0 ? (
            <div className="flex flex-col items-center gap-6">
              <svg viewBox="0 0 120 120" className="w-32 h-32 drop-shadow-md">
                {(() => {
                  let cumAngle = -90;
                  return donutData.map((d, i) => {
                    const angle = (d.value / donutTotal) * 360;
                    const startAngle = cumAngle;
                    cumAngle += angle;
                    const largeArc = angle > 180 ? 1 : 0;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = ((startAngle + angle) * Math.PI) / 180;
                    const x1 = 60 + 50 * Math.cos(startRad), y1 = 60 + 50 * Math.sin(startRad);
                    const x2 = 60 + 50 * Math.cos(endRad), y2 = 60 + 50 * Math.sin(endRad);
                    const ix1 = 60 + 30 * Math.cos(endRad), iy1 = 60 + 30 * Math.sin(endRad);
                    const ix2 = 60 + 30 * Math.cos(startRad), iy2 = 60 + 30 * Math.sin(startRad);
                    const path = `M ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A 30 30 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
                    return <path key={i} d={path} fill={d.color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
                  });
                })()}
                <text x="60" y="58" textAnchor="middle" className="fill-slate-900 font-black" fontSize="18">{donutTotal}</text>
                <text x="60" y="72" textAnchor="middle" className="fill-slate-500 font-bold" fontSize="8">{fr ? 'demandes' : 'requests'}</text>
              </svg>
              <div className="w-full space-y-2">
                {donutData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-1.5 rounded-lg hover:bg-white/40 transition-colors">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: d.color }} />
                    <span className="flex-1 text-slate-600 font-semibold truncate">{d.label}</span>
                    <span className="font-extrabold text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">{fr ? 'Aucune donnée' : 'No data'}</p>
          )}
        </div>
      </div>

      {/* Row: Recent Activity Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Latest Requests */}
        <div className="bg-white/50 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FileText size={18} className="text-blue-600" strokeWidth={2.5} />
            </div>
            {fr ? 'Dernières demandes projets' : 'Latest Project Requests'}
          </h3>
          <div className="space-y-2">
            {submissions.slice(0, 5).map((s: ProjectSubmission) => (
              <div key={s.id} className="flex items-center gap-4 py-3 border-b border-white/30 last:border-0 hover:bg-white/60 transition-colors px-3 rounded-2xl cursor-pointer">
                <div className={`w-3 h-3 rounded-full shadow-sm flex-shrink-0 ${s.status === 'new' ? 'bg-blue-500' : s.status === 'read' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{s.name}</p>
                  <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{s.project_type} — {s.email}</p>
                </div>
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap bg-white/50 px-2 py-1 rounded-lg">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {!submissions.length && <p className="text-slate-400 text-center py-4 font-medium">{fr ? 'Aucune demande' : 'No requests'}</p>}
          </div>
        </div>

        {/* Latest Contest Activity */}
        <div className="bg-white/50 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Trophy size={18} className="text-amber-500" strokeWidth={2.5} />
            </div>
            {fr ? 'Derniers participants au Concours' : 'Latest Contest Participants'}
          </h3>
          <div className="space-y-1">
            {contestSubmissions.slice(0, 5).map((s: ContestSubmission) => (
              <div key={s.id} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'new' ? 'bg-blue-500' : s.status === 'contacted' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{s.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{s.company_name} — {s.sector}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {!contestSubmissions.length && <p className="text-slate-400 text-center py-4">{fr ? 'Aucun participant' : 'No participants'}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Pagination Component ---
const ITEMS_PER_PAGE = 10;

function Pagination({ total, page, setPage, fr }: { total: number; page: number; setPage: (p: number) => void; fr: boolean }) {
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="text-sm text-slate-500">
        {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} {fr ? 'sur' : 'of'} {total}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// --- Drag & Drop helper ---
function useDragReorder<T extends { id: string; order_index: number }>(items: T[], table: string) {
  const [dragId, setDragId] = useState<string | null>(null);
  const onDragStart = (e: React.DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const fromIdx = items.findIndex(i => i.id === dragId);
    const toIdx = items.findIndex(i => i.id === targetId);
    if (fromIdx === -1 || toIdx === -1) { setDragId(null); return; }
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updates = reordered.map((item, idx) => supabase.from(table).update({ order_index: idx }).eq('id', item.id));
    await Promise.all(updates);
    setDragId(null);
    window.dispatchEvent(new Event('portfolio-reorder'));
  };

  const moveUp = async (id: string) => {
    const fromIdx = items.findIndex(i => i.id === id);
    if (fromIdx <= 0) return;
    const toIdx = fromIdx - 1;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updates = reordered.map((item, idx) => supabase.from(table).update({ order_index: idx }).eq('id', item.id));
    await Promise.all(updates);
    window.dispatchEvent(new Event('portfolio-reorder'));
  };

  const moveDown = async (id: string) => {
    const fromIdx = items.findIndex(i => i.id === id);
    if (fromIdx === -1 || fromIdx === items.length - 1) return;
    const toIdx = fromIdx + 1;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updates = reordered.map((item, idx) => supabase.from(table).update({ order_index: idx }).eq('id', item.id));
    await Promise.all(updates);
    window.dispatchEvent(new Event('portfolio-reorder'));
  };

  return { dragId, onDragStart, onDragOver, onDrop, moveUp, moveDown };
}

// --- Submissions Tab ---
function SubmissionsTab({ submissions, searchQuery, setSearchQuery, updateStatus, deleteItem, fr }: any) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const filtered = submissions.filter((s: ProjectSubmission) =>
    !searchQuery || [s.name, s.email, s.project_type, s.description].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getExportData = () => submissions.map((s: ProjectSubmission) => ({
    Nom: s.name, Email: s.email, Téléphone: s.phone, Type: s.project_type,
    Budget: s.budget, Description: s.description, Statut: s.status, Date: s.created_at
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} placeholder={fr ? 'Rechercher...' : 'Search...'} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <button onClick={() => exportCSV(getExportData(), 'demandes_projet')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-medium transition-colors">
          <Download size={16} /> CSV
        </button>
        <button onClick={() => exportXLSX(getExportData(), 'demandes_projet')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors">
          <FileSpreadsheet size={16} /> XLSX
        </button>
      </div>
      <div className="bg-white/50 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-600">
              <th className="px-4 py-3 text-left font-semibold w-8"></th>
              <th className="px-4 py-3 text-left font-semibold">{fr ? 'Statut' : 'Status'}</th>
              <th className="px-4 py-3 text-left font-semibold">{fr ? 'Nom' : 'Name'}</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">{fr ? 'Type' : 'Type'}</th>
              <th className="px-4 py-3 text-left font-semibold">Budget</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr></thead>
            <tbody>
              {paged.map((s: ProjectSubmission) => (
                <>
                  <tr key={s.id} onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      {expandedId === s.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <select value={s.status} onChange={e => { e.stopPropagation(); updateStatus(s.id, e.target.value); }} onClick={e => e.stopPropagation()}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${s.status === 'new' ? 'bg-blue-100 text-blue-700' : s.status === 'read' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                        <option value="new">{fr ? 'Nouveau' : 'New'}</option>
                        <option value="read">{fr ? 'Lu' : 'Read'}</option>
                        <option value="archived">{fr ? 'Archivé' : 'Archived'}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.email}</td>
                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{s.project_type}</span></td>
                    <td className="px-4 py-3 text-slate-600">{s.budget}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); deleteItem(s.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-detail`} className="bg-blue-50/50">
                      <td colSpan={8} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {s.phone && (
                            <div className="flex items-center gap-3">
                              <Phone size={16} className="text-blue-600" />
                              <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{fr ? 'Téléphone' : 'Phone'}</p>
                                <p className="text-slate-900 font-medium">{s.phone}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-blue-600" />
                            <div>
                              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date</p>
                              <p className="text-slate-900 font-medium">{new Date(s.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        {s.description && (
                          <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{fr ? 'Description du projet' : 'Project Description'}</p>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{s.description}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!filtered.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">{fr ? 'Aucune demande' : 'No submissions'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination total={filtered.length} page={page} setPage={setPage} fr={fr} />
        </div>
      </div>
    </div>
  );
}

// --- Newsletter Tab ---
function NewsletterTab({ subscribers, searchQuery, setSearchQuery, fr, deleteItem, deleteMultiple }: any) {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const filtered = subscribers.filter((s: NewsletterSubscriber) =>
    !searchQuery || [s.name, s.email].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getExportData = () => subscribers.map((s: NewsletterSubscriber) => ({
    Nom: s.name, Email: s.email, Coupon: s.coupon_code, 'Coupon utilisé': s.coupon_used ? 'Oui' : 'Non',
    'Expire le': s.coupon_expires_at, 'Inscrit le': s.subscribed_at
  }));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? paged.map((s: NewsletterSubscriber) => s.id) : []);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} placeholder={fr ? 'Rechercher...' : 'Search...'} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        
        {deleteMultiple && selectedIds.length > 0 && (
          <button onClick={() => { deleteMultiple(selectedIds); setSelectedIds([]); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-100/50 text-red-600 border border-red-500/20 hover:bg-red-100 rounded-xl text-sm font-bold transition-all shadow-sm">
            <Trash2 size={16} /> {fr ? `Supprimer (${selectedIds.length})` : `Delete (${selectedIds.length})`}
          </button>
        )}

        <button onClick={() => exportCSV(getExportData(), 'newsletter_inscrits')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-medium transition-colors">
          <Download size={16} /> CSV
        </button>
        <button onClick={() => exportXLSX(getExportData(), 'newsletter_inscrits')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors">
          <FileSpreadsheet size={16} /> XLSX
        </button>
      </div>
      <div className="bg-white/50 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-white/40 text-slate-600 border-b border-white/40">
              <th className="px-4 py-4 text-left w-12">
                <input type="checkbox" className="rounded-md border-slate-300 w-4 h-4 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  checked={paged.length > 0 && selectedIds.length === paged.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-4 text-left font-bold">{fr ? 'Nom' : 'Name'}</th>
              <th className="px-4 py-4 text-left font-bold">Email</th>
              <th className="px-4 py-4 text-left font-bold">Coupon</th>
              <th className="px-4 py-4 text-left font-bold">{fr ? 'Utilisé' : 'Used'}</th>
              <th className="px-4 py-4 text-left font-bold">{fr ? 'Expire' : 'Expires'}</th>
              <th className="px-4 py-4 text-left font-bold">{fr ? 'Inscrit le' : 'Subscribed'}</th>
              {deleteItem && <th className="px-4 py-4 text-left font-bold">Actions</th>}
            </tr></thead>
            <tbody>
              {paged.map((s: NewsletterSubscriber) => (
                <tr key={s.id} className="border-b border-white/30 hover:bg-white/50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded-md border-slate-300 w-4 h-4 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      checked={selectedIds.includes(s.id)}
                      onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{s.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{s.email}</td>
                  <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-mono font-bold shadow-sm">{s.coupon_code}</span></td>
                  <td className="px-4 py-3">{s.coupon_used ? <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-lg">✓</span> : <span className="text-slate-400 font-bold px-2 py-0.5">✗</span>}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-medium">{new Date(s.coupon_expires_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-medium">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                  {deleteItem && (
                    <td className="px-4 py-3">
                      <button onClick={() => deleteItem(s.id)} className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors" title={fr ? 'Supprimer' : 'Delete'}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={deleteItem ? 8 : 7} className="px-4 py-12 text-center font-medium text-slate-500">{fr ? 'Aucun inscrit' : 'No subscribers'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-white/40">
          <Pagination total={filtered.length} page={page} setPage={setPage} fr={fr} />
        </div>
      </div>
    </div>
  );
}

// --- Web Portfolio Tab ---
function WebPortfolioTab({ projects, onEdit, onDelete, onToggle, fr }: any) {
  const { moveUp, moveDown } = useDragReorder(projects, 'portfolio_projects');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p: PortfolioProject, idx: number) => (
        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
          <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
            <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {!p.is_visible && <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><span className="bg-white/90 px-3 py-1 rounded-lg text-sm font-semibold text-slate-800">{fr ? 'Masqué' : 'Hidden'}</span></div>}
            {p.is_featured && <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">★ Featured</span>}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5 mr-1">
                <button onClick={() => moveUp(p.id)} disabled={idx === 0} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}><ChevronUp size={14} /></button>
                <button onClick={() => moveDown(p.id)} disabled={idx === projects.length - 1} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === projects.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}><ChevronDown size={14} /></button>
              </div>
              <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
              <h3 className="font-bold text-slate-900 truncate">{p.title}</h3>
            </div>
            <span className="inline-block mt-1 bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded">{p.category}</span>
            <div className="flex gap-2 mt-3">
              {onEdit && <button onClick={() => onEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition-colors"><Edit2 size={14} />{fr ? 'Modifier' : 'Edit'}</button>}
              {onToggle && <button onClick={() => onToggle(p)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">{p.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>}
              {onDelete && <button onClick={() => onDelete(p.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"><Trash2 size={14} /></button>}
            </div>
          </div>
        </div>
      ))}
      {!projects.length && <div className="col-span-full text-center py-16 text-slate-400">{fr ? 'Aucun projet web/app' : 'No web/app projects'}</div>}
    </div>
  );
}

// --- Graphic Portfolio Tab ---
function GraphicPortfolioTab({ projects, onEdit, onDelete, onToggle, fr }: any) {
  const { moveUp, moveDown } = useDragReorder(projects, 'portfolio_projects');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p: PortfolioProject, idx: number) => (
        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
          <div className="aspect-square relative overflow-hidden bg-slate-100">
            <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {!p.is_visible && <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><span className="bg-white/90 px-3 py-1 rounded-lg text-sm font-semibold text-slate-800">{fr ? 'Masqué' : 'Hidden'}</span></div>}
            {(p.images?.length || 0) > 0 && <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{p.images?.length} imgs</span>}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5 mr-1">
                <button onClick={() => moveUp(p.id)} disabled={idx === 0} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}><ChevronUp size={14} /></button>
                <button onClick={() => moveDown(p.id)} disabled={idx === projects.length - 1} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === projects.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}><ChevronDown size={14} /></button>
              </div>
              <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
              <h3 className="font-bold text-slate-900 truncate">{p.title}</h3>
            </div>
            {p.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
            <div className="flex gap-2 mt-3">
              {onEdit && <button onClick={() => onEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl text-sm font-medium transition-colors"><Edit2 size={14} />{fr ? 'Modifier' : 'Edit'}</button>}
              {onToggle && <button onClick={() => onToggle(p)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">{p.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>}
              {onDelete && <button onClick={() => onDelete(p.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"><Trash2 size={14} /></button>}
            </div>
          </div>
        </div>
      ))}
      {!projects.length && <div className="col-span-full text-center py-16 text-slate-400">{fr ? 'Aucun design graphique' : 'No graphic designs'}</div>}
    </div>
  );
}

// --- Video Portfolio Tab ---
function VideoPortfolioTab({ videos, onEdit, onDelete, onToggle, fr }: any) {
  const { moveUp, moveDown } = useDragReorder(videos, 'video_portfolio');
  const sizeLabels: Record<string, string> = { short: fr ? 'Court' : 'Short', medium: 'Medium', long: 'Long' };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {videos.map((v: VideoPortfolio, idx: number) => (
        <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
          <div className="aspect-video relative overflow-hidden bg-slate-100">
            <img src={v.cover_image_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Play size={20} className="text-slate-800 ml-0.5" /></div>
            </div>
            {!v.is_visible && <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><span className="bg-white/90 px-3 py-1 rounded-lg text-sm font-semibold text-slate-800">{fr ? 'Masqué' : 'Hidden'}</span></div>}
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{sizeLabels[v.size_category]}</span>
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">{v.video_platform}</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5 mr-1">
                <button onClick={() => moveUp(v.id)} disabled={idx === 0} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}><ChevronUp size={14} /></button>
                <button onClick={() => moveDown(v.id)} disabled={idx === videos.length - 1} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === videos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}><ChevronDown size={14} /></button>
              </div>
              <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
              <h3 className="font-bold text-slate-900 truncate">{v.title}</h3>
            </div>
            <div className="flex gap-2 mt-3">
              {onEdit && <button onClick={() => onEdit(v)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-medium transition-colors"><Edit2 size={14} />{fr ? 'Modifier' : 'Edit'}</button>}
              {onToggle && <button onClick={() => onToggle(v)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">{v.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>}
              {onDelete && <button onClick={() => onDelete(v.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"><Trash2 size={14} /></button>}
            </div>
          </div>
        </div>
      ))}
      {!videos.length && <div className="col-span-full text-center py-16 text-slate-400">{fr ? 'Aucune vidéo' : 'No videos'}</div>}
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
