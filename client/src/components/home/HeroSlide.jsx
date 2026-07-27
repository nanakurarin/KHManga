import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';

/**
 * Slide showing a manga's cover art, titles, genres, publication info,
 * and context actions (Read More, Add to Library).
 */
function HeroSlide({ manga, isActive }) {
  const { currentUser } = useAuth();
  const { isInLibrary, addManga } = useLibrary();
  
  const [submitting, setSubmitting] = useState(false);
  const isMangaInLibrary = isInLibrary(manga.id);

  const handleAddToLibrary = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMangaInLibrary || submitting) return;

    setSubmitting(true);
    try {
      await addManga({ mangaId: manga.id, status: 'plan_to_read' });
    } catch (err) {
      console.error('Failed to add to library:', err);
      alert(err.message || 'Failed to add manga to library.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!manga) return null;

  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
        isActive ? 'opacity-100 z-20' : 'opacity-0 z-10 pointer-events-none'
      }`}
    >
      {/* Blurred background cover image for rich premium aesthetics */}
      {manga.coverUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-105"
          style={{ backgroundImage: `url(${manga.coverUrl})` }}
        />
      )}
      
      {/* Slide Container (matches the KHManga hero panel gradients) */}
      <div className="relative h-full w-full rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900/90 to-purple-950/20 border border-slate-800 p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 overflow-hidden">
        
        {/* Left Side Metadata Info */}
        <div className="space-y-4 max-w-xl text-left z-10 w-full md:w-3/5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
              {manga.status}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/50">
              Year: {manga.year}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/50">
              Safety: {manga.contentRating}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight line-clamp-1" title={manga.title}>
            Explore <span className="bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">{manga.title}</span>
          </h2>
          
          <p className="text-xs text-slate-500 font-semibold line-clamp-1">
            By {manga.author} &bull; Art by {manga.artist}
          </p>

          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 md:line-clamp-4">
            {manga.description}
          </p>

          {manga.genres && manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {manga.genres.slice(0, 3).map((genre) => (
                <span 
                  key={genre} 
                  className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-3">
            <Link 
              to={`/manga/${manga.id}`}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/40 transition duration-200 transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              Read More &rarr;
            </Link>

            {currentUser && (
              isMangaInLibrary ? (
                <button 
                  disabled
                  className="px-5 py-2.5 bg-slate-850 text-emerald-400 rounded-xl text-xs font-bold border border-slate-800 cursor-default flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  In Library
                </button>
              ) : (
                <button 
                  onClick={handleAddToLibrary}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700/80 transition duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : '+ Add to Library'}
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Side Cover Image (Sharp Foreground floating cover) */}
        <div className="w-full md:w-56 h-48 md:h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative flex-shrink-0 z-10 flex items-center justify-center">
          {manga.coverUrl ? (
            <img 
              src={manga.coverUrl} 
              alt={manga.title} 
              className="w-full h-full object-cover transition duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span className="text-xs text-slate-600 font-bold select-none">No Cover Image</span>
          )}
        </div>

      </div>
    </div>
  );
}

export default HeroSlide;
