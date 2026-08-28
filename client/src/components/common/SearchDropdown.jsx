import React from 'react';
import { getCoverArt } from '../../services/mangaDexApi';

/**
 * SearchDropdown - Renders autocomplete search preview items.
 */
function SearchDropdown({ results, loading, query, activeIndex, onSelect, onViewAll }) {
  return (
    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left transition-colors duration-200">
      {loading ? (
        <div className="flex items-center justify-center py-6 space-x-2 text-slate-450 dark:text-slate-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
          <span className="text-xs font-medium">Searching MangaDex...</span>
        </div>
      ) : (
        <>
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((manga, index) => {
                const coverUrl = getCoverArt(manga);
                const isActive = index === activeIndex;

                return (
                  <div
                    key={manga.id}
                    onClick={() => onSelect(manga)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-slate-100 dark:border-slate-900/50 transition duration-150 ${
                      isActive 
                        ? 'bg-slate-100 dark:bg-slate-900 text-rose-500 font-semibold' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-rose-500'
                    }`}
                  >
                    {/* Cover Thumbnail */}
                    <div className="w-8 h-11 bg-slate-100 dark:bg-slate-950 rounded flex-shrink-0 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative select-none">
                      {coverUrl ? (
                        <img 
                          src={coverUrl} 
                          alt={manga.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-[8px] text-slate-500 font-bold">Cover</span>
                      )}
                    </div>

                    {/* Metadata fields */}
                    <div className="flex-grow min-w-0">
                      <h5 className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{manga.title}</h5>
                      <span className="text-[10px] text-slate-500 capitalize">{manga.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              No results found for "{query}"
            </div>
          )}

          {/* View All results row */}
          <div
            onClick={onViewAll}
            className={`border-t border-slate-100 dark:border-slate-900 px-4 py-2.5 text-center text-xs font-bold cursor-pointer transition duration-150 ${
              activeIndex === results.length
                ? 'bg-slate-100 dark:bg-slate-900 text-rose-500'
                : 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-rose-500'
            }`}
          >
            View all results for "{query}"
          </div>
        </>
      )}
    </div>
  );
}

export default SearchDropdown;
