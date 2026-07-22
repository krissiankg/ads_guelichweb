import React, { useState } from 'react';
import { Search, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { NewsletterSubscriber } from '../../lib/supabase';
import { exportCSV, exportXLSX } from '../../lib/exportUtils';
import { Pagination, ITEMS_PER_PAGE } from './Pagination';

interface NewsletterTabProps {
  subscribers: NewsletterSubscriber[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fr: boolean;
  deleteItem: ((id: string) => void) | null;
  deleteMultiple: ((ids: string[]) => void) | null;
}

export function NewsletterTab({
  subscribers,
  searchQuery,
  setSearchQuery,
  fr,
  deleteItem,
  deleteMultiple
}: NewsletterTabProps) {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const filtered = subscribers.filter((s) =>
    !searchQuery || [s.name, s.email].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getExportData = () => subscribers.map((s) => ({
    Nom: s.name, Email: s.email, Coupon: s.coupon_code, 'Coupon utilisé': s.coupon_used ? 'Oui' : 'Non',
    'Expire le': s.coupon_expires_at, 'Inscrit le': s.subscribed_at
  }));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? paged.map((s) => s.id) : []);
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
            <thead>
              <tr className="bg-white/40 text-slate-600 border-b border-white/40">
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
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => (
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
