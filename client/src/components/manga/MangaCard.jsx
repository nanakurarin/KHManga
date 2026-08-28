import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCoverArt, getMangaChapterCount } from '../../services/mangaDexApi';

/**
 * Reusable MangaCard component.
 * Supports different layout variations via props (e.g. showTags, showChapter, showRating, priority).
 */
function MangaCard({ manga, showTags = false, showChapter = false, showRating = false, priority = false }) {
  const coverUrl = getCoverArt(manga);

  // Deterministic mock rating using title char codes to avoid client/server hydration mismatch
  const mockRating = (4.4 + (manga.title.charCodeAt(0) % 6) * 0.1).toFixed(1);

  const isChapterUuid = manga.latestUploadedChapter && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(manga.latestUploadedChapter);
  const showChapterLabel = showChapter && manga.latestUploadedChapter && !isChapterUuid;

  const [chapterCount, setChapterCount] = useState(null);
  const [imageFit, setImageFit] = useState('cover');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth > naturalHeight) {
      setImageFit('contain');
    } else {
      setImageFit('cover');
    }
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      const count = await getMangaChapterCount(manga.id);
      if (isMounted && count !== null && count > 0) {
        setChapterCount(count);
      }
    };
    fetchCount();
    return () => {
      isMounted = false;
    };
  }, [manga.id]);

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group flex flex-col bg-white dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800 transition duration-200 overflow-hidden h-full flex-grow shadow-sm"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Skeleton loader shown while cover image is downloading */}
        {coverUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 animate-pulse" />
        )}

        {coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt={manga.title}
            className={`w-full h-full group-hover:scale-105 transition-all duration-300 cursor-pointer ${
              imageFit === 'contain' ? 'object-contain' : 'object-cover'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-2 text-center select-none">
            <svg className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-slate-500 dark:text-slate-600 font-bold">No Cover Art</span>
          </div>
        )}
        
        {/* Status Tag overlay */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-slate-300 border border-slate-800 uppercase tracking-wider font-semibold z-10">
          {manga.status}
        </div>

        {/* Top-Right Badges Container */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {/* Chapter Count Badge */}
          {chapterCount !== null && chapterCount > 0 && (
            <div className="bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-slate-300 border border-slate-800 font-bold flex items-center gap-1">
              <span>📖</span>
              <span>{chapterCount} Ch.</span>
            </div>
          )}

          {/* Rating overlay */}
          {showRating && (
            <div className="bg-rose-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-rose-400 border border-rose-900/40 font-bold flex items-center gap-1">
              <span>★</span>
              <span>{mockRating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-850 dark:text-slate-200 group-hover:text-rose-500 transition duration-150 line-clamp-2 text-xs md:text-sm" title={manga.title}>
            {manga.title}
          </h4>
          <p className="text-[10px] md:text-xs text-slate-450 dark:text-slate-550 line-clamp-1">By {manga.author}</p>
        </div>

        {/* Conditionally display chapter */}
        {showChapterLabel && (
          <div className="text-[10px] md:text-xs bg-slate-100 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-900/60 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Chapter {manga.latestUploadedChapter}</span>
          </div>
        )}

        {/* Conditionally display genre tags */}
        {showTags && manga.genres && manga.genres.length > 0 && (
          <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium truncate pt-1" title={manga.genres.slice(0, 3).join(' • ')}>
            {manga.genres.slice(0, 3).join(' • ')}
          </p>
        )}
      </div>
    </Link>
  );
}

export default MangaCard;
