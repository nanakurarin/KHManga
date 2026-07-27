import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { getMangaList } from '../services/mangaDexApi';

const statusLabels = {
  'plan_to_read': 'Plan to Read',
  'reading': 'Reading',
  'completed': 'Completed',
  'on_hold': 'On Hold',
  'dropped': 'Dropped',
  're_reading': 'Re-reading',
  'none': 'None'
};

const tabToStatusMap = {
  'Reading': 'reading',
  'Plan to Read': 'plan_to_read',
  'Completed': 'completed',
  'On Hold': 'on_hold',
  'Dropped': 'dropped',
  'Re-reading': 're_reading',
  'None': 'none'
};

function Library() {
  const tabs = ['All', 'Reading', 'Plan to Read', 'Completed', 'On Hold', 'Dropped', 'Re-reading', 'None'];
  const [activeTab, setActiveTab] = useState('All');
  
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

  const filteredManga = activeTab === 'All' 
    ? library 
    : library.filter(item => item.status === tabToStatusMap[activeTab]);

  const showLoading = loading || loadingDetails;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">My Library</h2>
          <p className="text-sm text-slate-400">Keep track of your reading progress and bookmarks</p>
        </div>
        <button
          onClick={loadLibrary}
          disabled={showLoading}
          className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition duration-150 shadow-sm"
        >
          {showLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 overflow-x-auto pb-px">
        {/* Simple inline scroll style */}
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-4 px-6 text-sm font-semibold border-b-2 transition duration-200 ${
              activeTab === tab 
                ? 'border-rose-500 text-rose-500' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
          <p className="text-slate-400 text-sm font-medium">Loading library entries...</p>
        </div>
      ) : filteredManga.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredManga.map((item) => {
            const details = mangaDetails[item.mangaId];
            const title = details?.title || `Manga (ID: ${item.mangaId})`;
            const coverUrl = details?.coverUrl;
            const author = details?.author;

            return (
              <div 
                key={item.mangaId} 
                className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex gap-4 hover:border-slate-800 transition duration-150 relative group"
              >
                {/* Cover art thumbnail */}
                <div className="w-20 h-28 bg-slate-950 rounded flex-shrink-0 flex items-center justify-center border border-slate-800 overflow-hidden relative select-none">
                  {coverUrl ? (
                    <img 
                      src={coverUrl} 
                      alt={title} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold">Cover</span>
                  )}
                </div>
                
                <div className="flex flex-col justify-between py-1 flex-grow">
                  <div>
                    <h4 className="font-bold text-slate-200 line-clamp-1" title={title}>
                      {title}
                    </h4>
                    {author && <p className="text-[11px] text-slate-500 line-clamp-1">By {author}</p>}
                    <span className="text-[10px] bg-slate-800 text-rose-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider inline-block mt-1">
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mt-1">
                    <p className="text-xs text-slate-400">Chapters read: {item.chaptersRead}</p>
                    <p className="text-xs text-slate-400">
                      Score: {item.score !== null && item.score !== undefined ? `★ ${item.score}/10` : 'No score'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <Link 
                        to={`/manga/${item.mangaId}`} 
                        className="text-xs text-rose-500 hover:text-rose-400 font-bold inline-block"
                      >
                        Continue &rarr;
                      </Link>
                      <button
                        onClick={() => handleRemove(item.mangaId)}
                        className="text-xs text-slate-500 hover:text-rose-500 transition duration-150"
                        title="Remove from library"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-900/50 border-dashed rounded-2xl">
          <p className="text-slate-400 text-sm">No bookmarks found for "{activeTab}" category.</p>
          <Link 
            to="/browse" 
            className="mt-4 inline-block text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition duration-150"
          >
            Browse Manga
          </Link>
        </div>
      )}
    </div>
  );
}

export default Library;
