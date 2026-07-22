import React, { useState } from 'react';
import { Search, Download, FileSpreadsheet, ChevronUp, ChevronDown, Trash2, Phone, Calendar, Mail, Save } from 'lucide-react';
import { ContestSubmission } from '../../lib/supabase';
import { exportCSV, exportXLSX } from '../../lib/exportUtils';
import { Pagination, ITEMS_PER_PAGE } from './Pagination';

interface ContestTabProps {
  submissions: ContestSubmission[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  updateStatus: (id: string, status: string) => void;
  deleteItem: ((id: string) => void) | null;
  fr: boolean;
  contestDeadline: string;
  setContestDeadline: (date: string) => void;
  onSaveContestDeadline: () => void;
  canEdit: boolean;
}

export function ContestTab({
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
}: ContestTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const filtered = submissions.filter((s) =>
    !searchQuery || [s.full_name, s.email, s.whatsapp, s.company_name, s.sector, s.activity_description].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getExportData = () => submissions.map((s) => ({
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
              {paged.map((s) => (
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
                      {deleteItem && (
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(s.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      )}
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
              {!filtered.length && <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">{fr ? 'Aucun candidat trouvé' : 'No candidates found'}</td></tr>}
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
