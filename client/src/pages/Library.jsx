import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { getMangaList } from '../services/mangaDexApi';
import Pagination from '../components/common/Pagination';
import LibraryCardSkeleton from '../components/common/LibraryCardSkeleton';

const statusLabels = {
  'plan_to_read': 'Plan to Read',
  'reading': 'Reading',
  'completed': 'Completed',
  'on_hold': 'On Hold',
  'dropped': 'Dropped',
  're_reading': 'Re-reading'
};

const tabToStatusMap = {
  'Reading': 'reading',
  'Plan to Read': 'plan_to_read',
  'Completed': 'completed',
  'On Hold': 'on_hold',
  'Dropped': 'dropped',
  'Re-reading': 're_reading'
};

/**
 * Sub-component for individual library item with image loading state.
 */
function LibraryCardItem({ item, mangaDetails, onRemove }) {
  const details = mangaDetails[item.mangaId];
  const title = details?.title || `Manga (ID: ${item.mangaId})`;
  const coverUrl = details?.coverUrl;
  const author = details?.author;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-xl p-4 flex gap-4 hover:border-slate-300 dark:hover:border-slate-800 transition duration-150 relative group shadow-sm">
      {/* Cover art thumbnail */}
      <div className="w-20 h-28 bg-slate-100 dark:bg-slate-950 rounded flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden relative select-none">
        {coverUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 animate-pulse" />
        )}

        {coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center select-none bg-slate-100 dark:bg-slate-950">
            <span className="text-[9px] text-slate-550 dark:text-slate-500 font-bold">No Cover</span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between py-1 flex-grow">
        <div>
          <h4 className="font-bold text-slate-850 dark:text-slate-200 line-clamp-1" title={title}>
            {title}
          </h4>
          {author && <p className="text-[11px] text-slate-450 dark:text-slate-550 line-clamp-1">By {author}</p>}
          <span className="text-[10px] bg-rose-50 dark:bg-slate-800 text-rose-650 dark:text-rose-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider inline-block border border-rose-100 dark:border-transparent mt-1">
            {statusLabels[item.status] || item.status}
          </span>
        </div>

        <div className="space-y-1 mt-1">
          <p className="text-xs text-slate-550 dark:text-slate-400">Chapters read: {item.chaptersRead}</p>
          <p className="text-xs text-slate-550 dark:text-slate-400">
            Score: {item.score !== null && item.score !== undefined ? `★ ${item.score}/10` : 'No score'}
          </p>
          <p className="text-[10px] text-slate-450 dark:text-slate-500">
            Updated: {new Date(item.updatedAt).toLocaleDateString()}
          </p>
          <div className="flex items-center justify-between pt-2">
            <Link
              to={`/manga/${item.mangaId}`}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold inline-block"
            >
              Continue &rarr;
            </Link>
            <button
              onClick={() => onRemove(item.mangaId)}
              className="text-xs text-slate-450 dark:text-slate-550 hover:text-rose-600 transition duration-150"
              title="Remove from library"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Library() {
  const tabs = ['All', 'Reading', 'Plan to Read', 'Completed', 'On Hold', 'Dropped', 'Re-reading'];
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Recently Updated');

  const sortOptions = [
    'Recently Updated',
    'Recently Added',
    'Oldest Added',
    'Last Read',
    'Title (A → Z)',
    'Title (Z → A)',
    'Highest Score',
    'Lowest Score',
    'Most Chapters Read',
    'Least Chapters Read'
  ];

  const { library, loading, error, loadLibrary, removeManga } = useLibrary();
  const [mangaDetails, setMangaDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch MangaDex cover and metadata for items inside user's library in batch
  useEffect(() => {
    const fetchLibraryMangaDetails = async () => {
      if (!library || library.length === 0) {
        setMangaDetails({});
        return;
      }
      setLoadingDetails(true);
      try {
        const ids = library.map(item => item.mangaId);
        const detailsList = await getMangaList(ids);
        const map = {};
        detailsList.forEach(manga => {
          map[manga.id] = manga;
        });
        setMangaDetails(map);
      } catch (err) {
        console.error('Failed to load library details from MangaDex:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchLibraryMangaDetails();
  }, [library]);

  const handleRemove = async (mangaId) => {
    if (window.confirm('Are you sure you want to remove this manga from your library?')) {
      try {
        await removeManga(mangaId);
      } catch (err) {
        alert(err.message || 'Failed to remove manga.');
      }
    }
  };

  const filteredManga = (activeTab === 'All'
    ? library
    : library.filter(item => item.status === tabToStatusMap[activeTab])
  ).filter(item => {
    if (!searchQuery.trim()) return true;
    const details = mangaDetails[item.mangaId];
    if (!details) {
      const fallbackTitle = `Manga (ID: ${item.mangaId})`;
      return fallbackTitle.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = details.title?.toLowerCase().includes(query);
    const altTitlesMatch = details.altTitles?.some(altTitle =>
      altTitle?.toLowerCase().includes(query)
    );
    return titleMatch || altTitlesMatch;
  });

  const sortedManga = [...filteredManga].sort((a, b) => {
    switch (sortBy) {
      case 'Recently Added':
        return new Date(b.createdAt) - new Date(a.createdAt) || a.mangaId.localeCompare(b.mangaId);
      case 'Oldest Added':
        return new Date(a.createdAt) - new Date(b.createdAt) || a.mangaId.localeCompare(b.mangaId);
      case 'Recently Updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt) || a.mangaId.localeCompare(b.mangaId);
      case 'Last Read': {
        const hasProgressA = a.chaptersRead > 0;
        const hasProgressB = b.chaptersRead > 0;
        if (hasProgressA && !hasProgressB) return -1;
        if (!hasProgressA && hasProgressB) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt) || a.mangaId.localeCompare(b.mangaId);
      }
      case 'Title (A → Z)': {
        const titleA = (mangaDetails[a.mangaId]?.title || `Manga (ID: ${a.mangaId})`).toLowerCase();
        const titleB = (mangaDetails[b.mangaId]?.title || `Manga (ID: ${b.mangaId})`).toLowerCase();
        return titleA.localeCompare(titleB) || a.mangaId.localeCompare(b.mangaId);
      }
      case 'Title (Z → A)': {
        const titleA = (mangaDetails[a.mangaId]?.title || `Manga (ID: ${a.mangaId})`).toLowerCase();
        const titleB = (mangaDetails[b.mangaId]?.title || `Manga (ID: ${b.mangaId})`).toLowerCase();
        return titleB.localeCompare(titleA) || a.mangaId.localeCompare(b.mangaId);
      }
      case 'Highest Score': {
        const hasScoreA = a.score !== null && a.score !== undefined;
        const hasScoreB = b.score !== null && b.score !== undefined;
        if (hasScoreA && !hasScoreB) return -1;
        if (!hasScoreA && hasScoreB) return 1;
        if (hasScoreA && hasScoreB) {
          if (b.score !== a.score) return b.score - a.score;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt) || a.mangaId.localeCompare(b.mangaId);
      }
      case 'Lowest Score': {
        const hasScoreA = a.score !== null && a.score !== undefined;
        const hasScoreB = b.score !== null && b.score !== undefined;
        if (hasScoreA && !hasScoreB) return -1;
        if (!hasScoreA && hasScoreB) return 1;
        if (hasScoreA && hasScoreB) {
          if (a.score !== b.score) return a.score - b.score;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt) || a.mangaId.localeCompare(b.mangaId);
      }
      case 'Most Chapters Read':
        return b.chaptersRead - a.chaptersRead || new Date(b.updatedAt) - new Date(a.updatedAt) || a.mangaId.localeCompare(b.mangaId);
      case 'Least Chapters Read':
        return a.chaptersRead - b.chaptersRead || new Date(b.updatedAt) - new Date(a.updatedAt) || a.mangaId.localeCompare(b.mangaId);
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt) || a.mangaId.localeCompare(b.mangaId);
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredManga.length / ITEMS_PER_PAGE) || 1;

  // Reset page to 1 when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Adjust page if it exceeds totalPages (e.g. after item removal)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredManga.length, totalPages, currentPage]);

  const paginatedManga = sortedManga.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const showLoading = loading || loadingDetails;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white">My Library</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Keep track of your reading progress and bookmarks</p>
        </div>
        <button
          onClick={loadLibrary}
          disabled={showLoading}
          className="inline-flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-white border border-slate-200 dark:border-transparent text-xs font-bold px-4 py-2 rounded-lg transition duration-150 shadow-sm"
        >
          {showLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-900 overflow-x-auto pb-px">
        {/* Simple inline scroll style */}
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`whitespace-nowrap pb-4 px-6 text-sm font-semibold border-b-2 transition duration-200 ${activeTab === tab
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="text-center py-16 bg-rose-950/10 border border-rose-900/50 rounded-2xl p-6">
          <p className="text-rose-400 text-sm mb-4">Error loading library: {error}</p>
          <button
            onClick={loadLibrary}
            className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition duration-150"
          >
            Retry Loading
          </button>
        </div>
      ) : showLoading ? (
        <LibraryCardSkeleton count={6} />
      ) : (
        <div className="space-y-6">
          {/* Search & Sort Controls */}
          {library.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search your library..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 pr-10 text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition duration-200"
                />
                <div className="absolute right-4 top-3.5 text-slate-400 dark:text-slate-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="w-full sm:w-auto flex-shrink-0 relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-4 pr-10 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition duration-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {filteredManga.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedManga.map((item) => (
                  <LibraryCardItem
                    key={item.mangaId}
                    item={item}
                    mangaDetails={mangaDetails}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          ) : searchQuery.trim() !== '' ? (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900/50 border-dashed rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No manga found.</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900/50 border-dashed rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No bookmarks found for "{activeTab}" category.</p>
              <Link
                to="/browse"
                className="mt-4 inline-block text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-white border border-slate-200 dark:border-transparent px-4 py-2 rounded-lg transition duration-150"
              >
                Browse Manga
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Library;
