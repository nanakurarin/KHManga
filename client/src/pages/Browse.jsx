import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchManga, getCoverArt } from '../services/mangaDexApi';

function Browse() {
  const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState('Latest Updates');
  
  const [mangaResults, setMangaResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch manga results from MangaDex API
  const fetchManga = async (queryVal = searchQuery, genreVal = selectedGenre, sortVal = sortBy) => {
    setLoading(true);
    setError('');
    try {
      const results = await searchManga(queryVal, {
        genre: genreVal,
        order: sortVal
      });
      setMangaResults(results);
    } catch (err) {
      setError(err.message || 'Failed to retrieve manga from MangaDex.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger to avoid API rate limits
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchManga(searchQuery, selectedGenre, sortBy);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedGenre, sortBy]);

  // Loading skeleton card matching card heights
  const SkeletonCard = () => (
    <div className="flex flex-col bg-slate-900/20 rounded-xl border border-slate-900 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-slate-950/60" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-950/60 rounded w-3/4" />
        <div className="h-3 bg-slate-950/60 rounded w-1/2" />
        <div className="flex gap-1">
          <div className="h-3.5 bg-slate-950/60 rounded w-12" />
          <div className="h-3.5 bg-slate-950/60 rounded w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Browse Manga</h2>
        <p className="text-sm text-slate-400">Search and filter through the complete MangaDex catalog</p>
      </div>

      {/* Filter / Search Bar Wrapper */}
      <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manga by title, author, or group..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition duration-200"
          />
          <div className="absolute right-4 top-3.5 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Genres Filter Box */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Filter by Genre</span>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(isSelected ? null : genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition duration-150 ${
                    isSelected 
                      ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700' 
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-sm text-slate-400">
          <span>
            {loading 
              ? 'Searching MangaDex...' 
              : `Showing ${mangaResults.length} result${mangaResults.length === 1 ? '' : 's'}`}
          </span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="Latest Updates">Latest Updates</option>
            <option value="Alphabetical">Alphabetical</option>
            <option value="Highest Rating">Highest Rating</option>
          </select>
        </div>

        {error ? (
          <div className="text-center py-16 bg-rose-950/10 border border-rose-900/50 rounded-2xl p-6">
            <p className="text-rose-400 text-sm mb-4">Error loading MangaDex results: {error}</p>
            <button 
              onClick={() => fetchManga()} 
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition duration-150"
            >
              Retry Search
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : mangaResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {mangaResults.map((manga) => {
              const coverUrl = getCoverArt(manga);
              return (
                <Link
                  key={manga.id}
                  to={`/manga/${manga.id}`}
                  className="group flex flex-col bg-slate-900/30 rounded-xl border border-slate-900 hover:border-slate-800 transition duration-200 overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    {coverUrl ? (
                      <img 
                        src={coverUrl} 
                        alt={manga.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-slate-600 select-none">No Cover Image</span>
                    )}
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-800">
                      {manga.year}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-rose-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-rose-400 border border-rose-900/40 uppercase tracking-wider font-semibold">
                      {manga.status}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-200 group-hover:text-rose-400 transition duration-150 line-clamp-2" title={manga.title}>
                        {manga.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">By {manga.author}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 pt-1">
                      {manga.genres.slice(0, 3).map((g) => (
                        <span key={g} className="text-[9px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/20 border border-slate-900/50 border-dashed rounded-2xl">
            <p className="text-slate-400 text-sm">No manga found matching your query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Browse;
