import { ChevronUp, ChevronDown, GripVertical, Edit2, Eye, EyeOff, Trash2, Play } from 'lucide-react';
import { VideoPortfolio } from '../../lib/supabase';
import { useDragReorder } from '../../lib/useDragReorder';

interface VideoPortfolioTabProps {
  videos: VideoPortfolio[];
  onEdit: ((v: VideoPortfolio) => void) | null;
  onDelete: ((id: string) => void) | null;
  onToggle: ((v: VideoPortfolio) => void) | null;
  fr: boolean;
}

export function PortfolioVideoTab({ videos, onEdit, onDelete, onToggle, fr }: VideoPortfolioTabProps) {
  const { moveUp, moveDown } = useDragReorder(videos, 'video_portfolio');
  const sizeLabels: Record<string, string> = { short: fr ? 'Court' : 'Short', medium: 'Medium', long: 'Long' };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {videos.map((v, idx) => (
        <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
          <div className="aspect-video relative overflow-hidden bg-slate-100">
            <img src={v.cover_image_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={20} className="text-slate-800 ml-0.5" />
              </div>
            </div>
            {!v.is_visible && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <span className="bg-white/90 px-3 py-1 rounded-lg text-sm font-semibold text-slate-800">{fr ? 'Masqué' : 'Hidden'}</span>
              </div>
            )}
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{sizeLabels[v.size_category]}</span>
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">{v.video_platform}</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5 mr-1">
                <button onClick={() => moveUp(v.id)} disabled={idx === 0} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}>
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveDown(v.id)} disabled={idx === videos.length - 1} className={`p-0.5 rounded-sm hover:bg-slate-100 ${idx === videos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'}`}>
                  <ChevronDown size={14} />
                </button>
              </div>
              <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
              <h3 className="font-bold text-slate-900 truncate">{v.title}</h3>
            </div>
            <div className="flex gap-2 mt-3">
              {onEdit && (
                <button onClick={() => onEdit(v)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-medium transition-colors">
                  <Edit2 size={14} />{fr ? 'Modifier' : 'Edit'}
                </button>
              )}
              {onToggle && (
                <button onClick={() => onToggle(v)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                  {v.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(v.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {!videos.length && <div className="col-span-full text-center py-16 text-slate-400">{fr ? 'Aucune vidéo' : 'No videos'}</div>}
    </div>
  );
}
