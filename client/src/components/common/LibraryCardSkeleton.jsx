import React from 'react';

/**
 * LibraryCardSkeleton Component
 * Matches the layout of library entries in Library.jsx during data fetching.
 */
function LibraryCardSkeleton({ count = 6 }) {
  const cards = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {cards.map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-xl p-4 flex gap-4 shadow-sm animate-pulse select-none"
        >
          {/* Cover thumbnail skeleton */}
          <div className="w-20 h-28 bg-slate-200 dark:bg-slate-950 rounded flex-shrink-0 border border-slate-200/50 dark:border-slate-800" />

          {/* Info skeleton */}
          <div className="flex flex-col justify-between py-1 flex-grow space-y-3">
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800/70 rounded w-1/2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded w-20 mt-1" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-800/60 rounded w-28" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800/60 rounded w-20" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-800/50 rounded w-24" />

              <div className="flex items-center justify-between pt-2">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800/60 rounded w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LibraryCardSkeleton;
