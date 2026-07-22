import { ChevronUp, ChevronDown, GripVertical, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { PortfolioProject } from '../../lib/supabase';
import { useDragReorder } from '../../lib/useDragReorder';

interface WebPortfolioTabProps {
  projects: PortfolioProject[];
  onEdit: ((p: PortfolioProject) => void) | null;
  onDelete: ((id: string) => void) | null;
  onToggle: ((p: PortfolioProject) => void) | null;
  fr: boolean;
}

export function PortfolioWebTab({ projects, onEdit, onDelete, onToggle, fr }: WebPortfolioTabProps) {
  const { moveUp, moveDown } = useDragReorder(projects, 'portfolio_projects');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p, idx) => (
        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
          <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
            <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {!p.is_visible && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <span className="bg-white/90 px-3 py-1 rounded-lg text-sm font-semibold text-slate-800">{fr ? 'Masqué' : 'Hidden'}</span>
              </div>
            )}
            {p.is_featured && (
              <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">★ Featured</span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5 mr-1">
                <button onClick={() => moveUp(p.id)} disabled={idx === 0} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}>
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveDown(p.id)} disabled={idx === projects.length - 1} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === projects.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}>
                  <ChevronDown size={14} />
                </button>
              </div>
              <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
              <h3 className="font-bold text-slate-900 truncate">{p.title}</h3>
            </div>
            <span className="inline-block mt-1 bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded">{p.category}</span>
            <div className="flex gap-2 mt-3">
              {onEdit && (
                <button onClick={() => onEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition-colors">
                  <Edit2 size={14} />{fr ? 'Modifier' : 'Edit'}
                </button>
              )}
              {onToggle && (
                <button onClick={() => onToggle(p)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                  {p.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(p.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {!projects.length && <div className="col-span-full text-center py-16 text-slate-400">{fr ? 'Aucun projet web/app' : 'No web/app projects'}</div>}
    </div>
  );
}
