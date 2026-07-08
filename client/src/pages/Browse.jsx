import React from 'react';
import { Link } from 'react-router-dom';

function Browse() {
  const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'];
  const mockMangaResults = Array.from({ length: 8 }, (_, i) => ({
    id: `manga-${i + 1}`,
    title: `Manga Title ${i + 1}`,
    genres: ['Action', 'Adventure', 'Fantasy'].slice(0, 1 + (i % 2)),
    rating: (8.5 + (i * 0.1)).toFixed(1),
  }));

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
            {genres.map((genre) => (
              <button
                key={genre}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white transition duration-150"
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-sm text-slate-400">
          <span>Showing {mockMangaResults.length} placeholder results</span>
          <select className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-rose-500">
            <option>Latest Updates</option>
            <option>Alphabetical</option>
            <option>Highest Rating</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {mockMangaResults.map((manga) => (
            <Link
              key={manga.id}
              to={`/manga/${manga.id}`}
              className="group flex flex-col bg-slate-900/30 rounded-xl border border-slate-900 hover:border-slate-800 transition duration-200 overflow-hidden"
            >
              <div className="aspect-[3/4] bg-slate-950 flex items-center justify-center relative">
                <span className="text-xs text-slate-600 select-none">No Cover Image</span>
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-rose-400 border border-slate-800">
                  {manga.rating} ★
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-slate-200 group-hover:text-rose-400 transition duration-150 line-clamp-1">
                  {manga.title}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {manga.genres.map((g) => (
                    <span key={g} className="text-[9px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Browse;
