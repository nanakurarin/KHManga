import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchManga } from '../services/mangaDexApi';
import Pagination from '../components/common/Pagination';
import MangaCard from '../components/manga/MangaCard';

function Browse() {
  const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'];
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';

  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState(() => {
    if (sortParam === 'recently_added') return 'Recently Added';
    if (sortParam === 'highest rating') return 'Highest Rating';
    return 'Latest Updates';
  });
  
  const [mangaResults, setMangaResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const ITEMS_PER_PAGE = 20;

  // Sync state if URL query param changes (e.g. from Navbar)
  useEffect(() => {
    setSearchQuery(searchParamQuery);
    if (sortParam === 'recently_added') {
      setSortBy('Recently Added');
    } else if (sortParam === 'highest rating') {
      setSortBy('Highest Rating');
    } else if (!sortParam) {
      if (sortBy === 'Recently Added' || sortBy === 'Highest Rating') {
        setSortBy('Latest Updates');
      }
    }
  }, [searchParamQuery, sortParam]);

  // Reset page when search input, genre, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, sortBy]);

  // Fetch manga results from MangaDex API
  const fetchManga = async (queryVal = searchQuery, genreVal = selectedGenre, sortVal = sortBy, pageVal = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const offset = (pageVal - 1) * ITEMS_PER_PAGE;
      const { mangaList, total } = await searchManga(queryVal, {
        genre: genreVal,
        order: sortVal,
        limit: ITEMS_PER_PAGE,
        offset
      });
      setMangaResults(mangaList);
      setTotalResults(total);
    } catch (err) {
      setError(err.message || 'Failed to retrieve manga from MangaDex.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger to avoid API rate limits
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = searchQuery.trim();
      const isSearchDiff = currentSearch !== searchParamQuery;
      
      const isSortRecentlyAdded = sortBy === 'Recently Added';
      const isSortHighestRating = sortBy === 'Highest Rating';
      const isSortDiff = 
        (isSortRecentlyAdded && sortParam !== 'recently_added') || 
        (isSortHighestRating && sortParam !== 'highest rating') || 
        (!isSortRecentlyAdded && !isSortHighestRating && sortParam !== '');

      if (isSearchDiff || isSortDiff) {
        const nextParams = {};
        if (currentSearch) {
          nextParams.search = currentSearch;
        }
        if (isSortRecentlyAdded) {
          nextParams.sort = 'recently_added';
        } else if (isSortHighestRating) {
          nextParams.sort = 'highest rating';
        }
        setSearchParams(nextParams);
      }
      
      fetchManga(searchQuery, selectedGenre, sortBy, currentPage);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedGenre, sortBy, currentPage, searchParamQuery, sortParam]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton card matching card heights
  const SkeletonCard = () => (
    <div className="flex flex-col bg-slate-200/40 dark:bg-slate-900/20 rounded-xl border border-slate-200 dark:border-slate-900 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-950/60" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-950/60 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-950/60 rounded w-1/2" />
        <div className="flex gap-1">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-950/60 rounded w-12" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-950/60 rounded w-12" />
        </div>
      </div>
    </div>
  );

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Browse Manga {sortBy === 'Recently Added' && <span className="text-rose-600 text-lg font-bold ml-2">&gt; Recently Added</span>}
        </h2>
        <p className="text-sm text-slate-550 dark:text-slate-400">Search and filter through the complete MangaDex catalog</p>
      </div>

      {/* Filter / Search Bar Wrapper */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-900 rounded-xl p-6 space-y-4 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manga by title, author, or group..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition duration-200"
          />
          <div className="absolute right-4 top-3.5 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Genres Filter Box */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Filter by Genre</span>
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
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
          <span>
            {loading 
              ? 'Searching MangaDex...' 
              : totalResults > 0 
                ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} of ${totalResults} results`
                : 'No results found'}
          </span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="Recently Added">Recently Added</option>
            <option value="Latest Updates">Latest Updates</option>
            <option value="Highest Rating">Highest Rating</option>
            <option value="Alphabetical">Alphabetical</option>
          </select>
        </div>

        {error ? (
          <div className="text-center py-16 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6">
            <p className="text-rose-400 text-sm mb-4">Error loading MangaDex results: {error}</p>
            <button 
              onClick={() => fetchManga()} 
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition duration-150"
            >
              Retry Search
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : mangaResults.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {mangaResults.map((manga) => (
                <MangaCard key={manga.id} manga={manga} showTags={true} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900/50 border-dashed rounded-2xl">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No manga found matching your query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Browse;
