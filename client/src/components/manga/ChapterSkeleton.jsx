import React from 'react';

/**
 * ChapterSkeleton Component
 * Matches the layout of chapter rows in MangaDetails.jsx while chapter list is loading.
 */
function ChapterSkeleton({ count = 5 }) {
  const rows = Array.from({ length: count });

  return (
    <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-slate-100 dark:divide-slate-900">
        {rows.map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 animate-pulse select-none"
          >
            {/* Left info */}
            <div className="space-y-2 flex-grow pr-4">
              <div className="flex items-center gap-2.5">
                {/* Eye icon skeleton */}
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                {/* Chapter number skeleton */}
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
              </div>
              {/* Chapter title skeleton */}
              <div className="h-3 bg-slate-200 dark:bg-slate-800/70 rounded w-48 ml-6.5" />
            </div>

            {/* Right action */}
            <div className="flex items-center space-x-4 shrink-0">
              {/* Date skeleton */}
              <div className="h-3 bg-slate-200 dark:bg-slate-800/60 rounded w-16 hidden sm:block" />
              {/* Read button skeleton */}
              <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterSkeleton;
