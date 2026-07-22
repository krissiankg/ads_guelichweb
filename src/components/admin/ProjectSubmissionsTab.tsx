import React, { useState } from 'react';
import { Search, Download, FileSpreadsheet, ChevronUp, ChevronDown, Trash2, Phone, Calendar } from 'lucide-react';
import { ProjectSubmission } from '../../lib/supabase';
import { exportCSV, exportXLSX } from '../../lib/exportUtils';
import { Pagination, ITEMS_PER_PAGE } from './Pagination';

interface ProjectSubmissionsTabProps {
  submissions: ProjectSubmission[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  updateStatus: (id: string, status: string) => void;
  deleteItem: ((id: string) => void) | null;
  fr: boolean;
}

export function ProjectSubmissionsTab({
  submissions,
  searchQuery,
  setSearchQuery,
  updateStatus,
  deleteItem,
  fr
}: ProjectSubmissionsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const filtered = submissions.filter((s) =>
    !searchQuery || [s.name, s.email, s.project_type, s.description].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getExportData = () => submissions.map((s) => ({
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
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-4 py-3 text-left font-semibold w-8"></th>
                <th className="px-4 py-3 text-left font-semibold">{fr ? 'Statut' : 'Status'}</th>
                <th className="px-4 py-3 text-left font-semibold">{fr ? 'Nom' : 'Name'}</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">{fr ? 'Type' : 'Type'}</th>
                <th className="px-4 py-3 text-left font-semibold">Budget</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => (
                <React.Fragment key={s.id}>
                  <tr onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      {expandedId === s.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <select value={s.status} onChange={e => { e.stopPropagation(); updateStatus(s.id, e.target.value); }} onClick={e => e.stopPropagation()}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${s.status === 'new' ? 'bg-blue-100 text-blue-700' : s.status === 'read' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
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
                      {deleteItem && (
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(s.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      )}
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr className="bg-blue-50/50">
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
                </React.Fragment>
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
