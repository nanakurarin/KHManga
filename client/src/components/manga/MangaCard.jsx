import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCoverArt, getMangaChapterCount } from '../../services/mangaDexApi';

/**
 * Reusable MangaCard component.
 * Supports different layout variations via props (e.g. showTags, showChapter, showRating).
 */
function MangaCard({ manga, showTags = false, showChapter = false, showRating = false }) {
  const coverUrl = getCoverArt(manga);

  // Deterministic mock rating using title char codes to avoid client/server hydration mismatch
  const mockRating = (4.4 + (manga.title.charCodeAt(0) % 6) * 0.1).toFixed(1);

  const isChapterUuid = manga.latestUploadedChapter && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(manga.latestUploadedChapter);
  const showChapterLabel = showChapter && manga.latestUploadedChapter && !isChapterUuid;

  const [chapterCount, setChapterCount] = useState(null);
  const [imageFit, setImageFit] = useState('cover');

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth > naturalHeight) {
      setImageFit('contain');
    } else {
      setImageFit('cover');
    }
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
      <div className="relative aspect-[3/4] bg-slate-950 flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={manga.title}
            className={`w-full h-full group-hover:scale-105 transition duration-300 cursor-pointer ${
              imageFit === 'contain' ? 'object-contain' : 'object-cover'
            }`}
            loading="lazy"
            onLoad={handleImageLoad}
          />
        ) : (
          <span className="text-[10px] text-slate-600 font-bold select-none">No Cover Art</span>
        )}
        
        {/* Status Tag overlay */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-slate-300 border border-slate-800 uppercase tracking-wider font-semibold">
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
