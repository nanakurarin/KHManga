import React from 'react';

/**
 * Reusable Pagination Component
 * 
 * Props:
 * - currentPage: number
 * - totalPages: number
 * - onPageChange: (page: number) => void
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const renderPageNumbers = () => {
    if (!totalPages || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold border transition duration-150 flex items-center justify-center ${
            currentPage === i
              ? 'bg-rose-600 border-rose-600 text-white font-bold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-750'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="hidden sm:flex items-center gap-1.5 mx-2">
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-750 flex items-center justify-center"
            >
              1
            </button>
            {startPage > 2 && <span className="text-xs text-slate-600 px-1 font-bold">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-xs text-slate-600 px-1 font-bold">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-750 flex items-center justify-center"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between sm:justify-center gap-2 pt-6 border-t border-slate-900 w-full">
      <button
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition duration-150 shadow-sm disabled:cursor-not-allowed"
      >
        &larr; Previous
      </button>

      {renderPageNumbers() || (
        <span className="text-xs text-slate-400 font-semibold sm:mx-4">
          Page {currentPage} of {totalPages}
        </span>
      )}

      <button
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition duration-150 shadow-sm disabled:cursor-not-allowed"
      >
        Next &rarr;
      </button>
    </div>
  );
}

export default Pagination;
