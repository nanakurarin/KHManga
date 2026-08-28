import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMangaList, getCoverArt, getMangaChapterCount } from '../../services/mangaDexApi';
import { getReadingHistory } from '../../utils/readingHistory';

/**
 * Format relative timestamp into a readable elapsed time string.
 */
function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Continue Reading Card sub-component.
 * Displays cover, title, author, last chapter read, read elapsed time, total chapter count, and Resume Reading button.
 */
function ContinueReadingCard({ item, navigate }) {
  const coverUrl = getCoverArt(item.manga);
  const relativeTime = formatRelativeTime(item.timestamp);
  const [chapterCount, setChapterCount] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      const count = await getMangaChapterCount(item.mangaId);
      if (isMounted && count !== null && count > 0) {
        setChapterCount(count);
      }
    };
    fetchCount();
    return () => {
      isMounted = false;
    };
  }, [item.mangaId]);

  return (
    <Link
      to={`/manga/${item.mangaId}`}
      className="group flex flex-col bg-white dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800 transition duration-200 overflow-hidden h-full flex-grow shadow-sm"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Skeleton placeholder while loading cover */}
        {coverUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 animate-pulse" />
        )}

        {coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt={item.manga.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 cursor-pointer ${
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-2 text-center select-none">
            <svg className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-slate-500 dark:text-slate-600 font-bold">No Cover Art</span>
          </div>
        )}

        {/* Top-Right Chapter Badge */}
        {chapterCount !== null && chapterCount > 0 && (
          <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-slate-300 border border-slate-800 font-bold flex items-center gap-1 z-10">
            <span>📖</span>
            <span>{chapterCount} Ch.</span>
          </div>
        )}
        
        {/* Status Tag */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-slate-300 border border-slate-800 uppercase tracking-wider font-semibold z-10">
          {item.manga.status}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-850 dark:text-slate-200 group-hover:text-rose-500 transition duration-150 line-clamp-2 text-xs md:text-sm" title={item.manga.title}>
            {item.manga.title}
          </h4>
          <p className="text-[10px] md:text-xs text-slate-455 dark:text-slate-555 line-clamp-1">By {item.manga.author}</p>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] md:text-xs bg-slate-100 dark:bg-slate-950/40 text-slate-655 dark:text-slate-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-900/60 flex items-center justify-between gap-1 select-none">
            <span className="font-semibold truncate max-w-[70%]">Ch. {item.lastChapterNumber || '?'}</span>
            <span className="text-[9px] text-slate-455 dark:text-slate-550 shrink-0">{relativeTime}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/read/${item.lastChapterId}`);
            }}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resume Reading
          </button>
        </div>
      </div>
    </Link>
  );
}

function ContinueReading() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const history = getReadingHistory();
        
        // 1. Process localStorage history map: get the latest read chapter for each manga
        const list = Object.entries(history)
          .map(([mangaId, chapters]) => {
            if (!chapters || chapters.length === 0) return null;
            // The most recently read chapter is at index 0
            const latest = chapters[0];
            return {
              mangaId,
              lastChapterId: latest.chapterId,
              lastChapterNumber: latest.chapterNumber,
              timestamp: latest.timestamp,
            };
          })
          .filter(Boolean);

        // Sort by timestamp DESC (most recently read first)
        list.sort((a, b) => b.timestamp - a.timestamp);

        // Limit to at most 10 items
        const top10 = list.slice(0, 10);

        if (top10.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        // 2. Fetch metadata from MangaDex for all top 10 manga in one request
        const mangaIds = top10.map((item) => item.mangaId);
        const mangaDetailsList = await getMangaList(mangaIds);

        // 3. Match metadata back to progress entries
        const matched = top10
          .map((progress) => {
            const details = mangaDetailsList.find((m) => m.id === progress.mangaId);
            if (!details) return null; // skip if metadata is missing/failed to fetch
            return {
              ...progress,
              manga: details,
            };
          })
          .filter(Boolean);

        setItems(matched);
      } catch (err) {
        console.error('Failed to load continue reading history:', err);
        setError('Failed to load reading progress.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-900 pb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Continue Reading
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col bg-white dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-900 overflow-hidden h-full flex-grow shadow-sm animate-pulse select-none">
              {/* Cover skeleton */}
              <div className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-950/80 flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-2 left-2 h-4 w-14 bg-slate-300 dark:bg-slate-800/90 rounded" />
                <div className="absolute top-2 right-2 h-4 w-12 bg-slate-300 dark:bg-slate-800/90 rounded" />
              </div>

              {/* Info skeleton */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800/70 rounded w-1/2" />
                </div>

                <div className="space-y-2">
                  <div className="h-6 bg-slate-100 dark:bg-slate-950/40 rounded w-full border border-slate-200/50 dark:border-slate-900/40" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // If there is no reading history, show the friendly message
  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-900 pb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Continue Reading
          </h3>
        </div>
        <div className="text-center py-12 bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900/50 border-dashed rounded-2xl">
          <p className="text-slate-500 text-xs font-semibold">Start reading a manga to see it here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-900 pb-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
          Continue Reading
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {items.map((item) => (
          <ContinueReadingCard key={item.mangaId} item={item} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

export default ContinueReading;
