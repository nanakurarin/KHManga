import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLatestManga, getCoverArt } from '../services/mangaDexApi';
import HeroCarousel from '../components/home/HeroCarousel';

function Home() {
  const [latestManga, setLatestManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLatest = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLatestManga();
      setLatestManga(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve latest manga from MangaDex.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  // Loading skeleton card matching heights
  const SkeletonCard = () => (
    <div className="flex flex-col bg-slate-900/20 rounded-xl border border-slate-900 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-slate-950/60" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-950/60 rounded w-3/4" />
        <div className="h-3 bg-slate-950/60 rounded w-1/2" />
        <div className="h-3.5 bg-slate-950/60 rounded w-16" />
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Hero Carousel Section */}
      <section>
        <HeroCarousel mangaList={latestManga} />
      </section>

      {/* Grid List Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">Popular Updates</h3>
            <p className="text-sm text-slate-400">Handpicked popular series update schedules</p>
          </div>
          <Link to="/browse" className="text-rose-500 hover:text-rose-400 text-sm font-semibold transition duration-150">
            View All &rarr;
          </Link>
        </div>

        {error ? (
          <div className="text-center py-16 bg-rose-950/10 border border-rose-900/50 rounded-2xl p-6">
            <p className="text-rose-400 text-sm mb-4">Error loading updates: {error}</p>
            <button 
              onClick={fetchLatest} 
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition duration-150"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : latestManga.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {latestManga.slice(1, 9).map((manga) => {
              const coverUrl = getCoverArt(manga);
              return (
                <Link 
                  key={manga.id} 
                  to={`/manga/${manga.id}`} 
                  className="group flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-900 hover:border-slate-800 transition duration-200 flex-grow"
                >
                  <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden">
                    {coverUrl ? (
                      <img 
                        src={coverUrl} 
                        alt={manga.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 font-bold">
                        <span className="text-xs px-4 text-center select-none">No Cover Art</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 space-y-1 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-200 group-hover:text-rose-400 transition duration-150 line-clamp-2" title={manga.title}>
                        {manga.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">By {manga.author}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500 font-semibold uppercase">
                      <span>{manga.status}</span>
                      <span className="text-slate-400">Year: {manga.year}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-900/20 rounded-xl">
            <p className="text-slate-500 text-sm">No trending updates found.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
