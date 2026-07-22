import { useMemo } from 'react';
import {
  FileText, Trophy, Mail, Globe, Palette, TrendingUp, FolderOpen
} from 'lucide-react';
import { ProjectSubmission, ContestSubmission } from '../../lib/supabase';

interface DashboardOverviewProps {
  submissions: ProjectSubmission[];
  subscribers: any[];
  contestSubmissions: ContestSubmission[];
  webProjects: any[];
  graphicProjects: any[];
  videos: any[];
  fr: boolean;
}

export function DashboardOverview({
  submissions,
  subscribers,
  contestSubmissions = [],
  webProjects,
  graphicProjects,
  videos,
  fr
}: DashboardOverviewProps) {
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
            {(s.newCount ?? 0) > 0 && <span className="inline-block mt-3 text-[10px] uppercase tracking-wider bg-slate-900 text-white font-black px-2 py-0.5 rounded-full">{s.newCount} {fr ? 'nouveau' : 'new'}</span>}
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
