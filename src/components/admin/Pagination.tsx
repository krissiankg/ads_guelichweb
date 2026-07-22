import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ITEMS_PER_PAGE = 10;

interface PaginationProps {
  total: number;
  page: number;
  setPage: (p: number) => void;
  fr: boolean;
}

export function Pagination({ total, page, setPage, fr }: PaginationProps) {
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="text-sm text-slate-500">
        {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} {fr ? 'sur' : 'of'} {total}
      </span>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setPage(Math.max(1, page - 1))} 
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button 
            key={p} 
            onClick={() => setPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {p}
          </button>
        ))}
        <button 
          onClick={() => setPage(Math.min(totalPages, page + 1))} 
          disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
