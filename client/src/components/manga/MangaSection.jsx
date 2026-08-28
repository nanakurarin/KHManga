import React from 'react';
import { Link } from 'react-router-dom';
import MangaCard from './MangaCard';
import MangaCardSkeleton from './MangaCardSkeleton';

/**
 * Reusable MangaSection component to show a grid of manga.
 */
function MangaSection({ 
  title, 
  manga = [], 
  loading = false, 
  error = '', 
  viewMorePath = '/browse', 
  cardProps = {} 
}) {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-900 pb-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
          {title}
        </h3>
        <Link 
          to={viewMorePath} 
          className="text-rose-500 hover:text-rose-600 text-xs font-semibold transition duration-150 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800"
        >
          View More &rarr;
        </Link>
      </div>

      {/* States handler */}
      {error ? (
        <div className="text-center py-12 bg-rose-950/10 border border-rose-900/50 rounded-2xl p-6">
          <p className="text-rose-400 text-xs font-semibold mb-2">Failed to load {title}</p>
          <p className="text-[10px] text-rose-500/80">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          <MangaCardSkeleton count={10} {...cardProps} />
        </div>
      ) : manga.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {manga.slice(0, 10).map((item, idx) => (
            <MangaCard key={item.id} manga={item} priority={idx < 5} {...cardProps} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900/50 border-dashed rounded-2xl">
          <p className="text-slate-500 text-xs font-medium">No manga found for this section.</p>
        </div>
      )}
    </section>
  );
}

export default MangaSection;

