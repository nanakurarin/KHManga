import React from 'react';

/**
 * MangaCardSkeleton Component
 * Matches the exact dimensions and layout of MangaCard to prevent layout shifts during data fetching.
 */
function MangaCardSkeleton({ showTags = false, showChapter = false, showRating = false, count = 1 }) {
  const cards = Array.from({ length: count });

  const renderSingleSkeleton = (index) => (
    <div
      key={index}
      className="flex flex-col bg-white dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-900 overflow-hidden h-full flex-grow shadow-sm animate-pulse select-none"
    >
      {/* Cover Image Placeholder */}
      <div className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-950/80 flex items-center justify-center overflow-hidden">
        {/* Status Tag skeleton */}
        <div className="absolute bottom-2 left-2 h-4 w-14 bg-slate-300 dark:bg-slate-800/90 rounded" />

        {/* Top-Right Badges Skeleton */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <div className="h-4 w-12 bg-slate-300 dark:bg-slate-800/90 rounded" />
          {showRating && (
            <div className="h-4 w-10 bg-slate-300 dark:bg-slate-800/90 rounded" />
          )}
        </div>
      </div>

      {/* Card Info Placeholder */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800/70 rounded w-1/2" />
        </div>

        {/* Chapter pill skeleton */}
        {showChapter && (
          <div className="h-5 bg-slate-100 dark:bg-slate-950/40 rounded w-24 border border-slate-200/50 dark:border-slate-900/40" />
        )}

        {/* Genre tags skeleton */}
        {showTags && (
          <div className="h-3 bg-slate-200 dark:bg-slate-800/60 rounded w-3/4 pt-1" />
        )}
      </div>
    </div>
  );

  if (count === 1) {
    return renderSingleSkeleton(0);
  }

  return (
    <>
      {cards.map((_, i) => renderSingleSkeleton(i))}
    </>
  );
}

export default MangaCardSkeleton;
