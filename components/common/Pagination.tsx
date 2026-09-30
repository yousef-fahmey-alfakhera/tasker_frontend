'use client';

import React from 'react';
import { useTranslation } from '@/context/I18nContext';
import { PaginationMeta } from '@/types/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  pagination: PaginationMeta | null;
  page: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
  onPerPageChange: (newPerPage: number) => void;
  totalFallback?: number;
}

export default function Pagination({
  pagination,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  totalFallback = 0,
}: Props) {
  const { t, isRtl } = useTranslation();

  const total = pagination?.total ?? totalFallback;
  const lastPage = pagination?.last_page ?? Math.max(1, Math.ceil(total / perPage));
  const currentPage = pagination?.current_page ?? page;

  // Calculate slice from/to
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(total, currentPage * perPage);

  if (total <= 0 && lastPage <= 1) {
    return null;
  }

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < lastPage - 2) pages.push('...');
      if (!pages.includes(lastPage)) pages.push(lastPage);
    }
    return pages;
  };

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-900/80 border-t border-slate-800/80 backdrop-blur-md text-xs text-slate-400 select-none">
      {/* Left side: Showing X-Y of Z & Per-page selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span>
          {t('showing_tasks', {
            from: String(from),
            to: String(to),
            total: String(total),
          })}
        </span>

        <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-800">
          <span className="text-[11px] text-slate-500 hidden md:inline">{t('per_page')}:</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
          title={t('prev_page')}
        >
          <PrevIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline px-1">{t('prev_page')}</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((pNum, idx) => {
            if (pNum === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1 text-slate-600 font-mono">
                  ...
                </span>
              );
            }
            const isCurrent = pNum === currentPage;
            return (
              <button
                key={`page-${pNum}`}
                type="button"
                onClick={() => onPageChange(Number(pNum))}
                className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                    : 'bg-slate-950/70 border border-slate-800/80 hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                {pNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
          title={t('next_page')}
        >
          <span className="hidden md:inline px-1">{t('next_page')}</span>
          <NextIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
