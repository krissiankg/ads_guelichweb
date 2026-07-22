import { MoreVertical, LogOut } from 'lucide-react';

export type Tab = 'dashboard' | 'forms-project' | 'forms-newsletter' | 'forms-contest' | 'portfolio-web' | 'portfolio-graphic' | 'portfolio-video';

interface NavItem {
  id: Tab;
  icon: any;
  label: string;
  badge?: number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  navItems: NavItem[];
  handleLogout: () => void;
  fr: boolean;
}

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  navItems,
  handleLogout,
  fr
}: SidebarProps) {
  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-24'} flex-shrink-0 flex flex-col transition-all duration-300 border-r border-white/30 z-50 bg-white/10`}>
      <div className="p-6 flex items-center gap-3 mt-4">
        {sidebarOpen ? (
          <span className="font-extrabold text-2xl text-slate-800 tracking-tight ml-2">GUELICHWEB</span>
        ) : (
          <div className="w-10 h-10 bg-slate-800 rounded-xl mx-auto flex items-center justify-center">
            <span className="text-white font-bold">GW</span>
          </div>
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
        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] text-slate-500 hover:text-slate-800 hover:bg-white/40 border border-transparent hover:border-white/50 transition-all font-bold">
          <LogOut size={20} strokeWidth={2.5} />
          {sidebarOpen && <span className="text-sm tracking-wide">{fr ? 'Déconnexion' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
  );
}
