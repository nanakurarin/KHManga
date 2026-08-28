import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { getMangaDetails, getMangaChapters, getCoverArt } from '../services/mangaDexApi';
import { isChapterRead, getMangaReadingHistory, saveChapterRead, removeChapterRead } from '../utils/readingHistory';
import { Eye, EyeOff } from 'lucide-react';
import CoverViewer from '../components/CoverViewer';
import ChapterSkeleton from '../components/manga/ChapterSkeleton';

function MangaDetails() {
  const { id } = useParams();

  const { currentUser } = useAuth();
  const { library, addManga, updateManga, removeManga, loading: libraryLoading } = useLibrary();

  // Find library entry for this manga if it exists
  const libraryEntry = library.find((entry) => entry.mangaId === id);

  // Get local reading progress state for this manga
  const [mangaHistory, setMangaHistory] = useState(() => getMangaReadingHistory(id));

  // Sync state if manga ID changes
  useEffect(() => {
    setMangaHistory(getMangaReadingHistory(id));
    setImageFit('cover'); // Reset cover image fit state on manga transitions
    setImageAspect('3/4'); // Reset aspect ratio state on manga transitions
    setCoverLoaded(false);
    setCoverError(false);
  }, [id]);

  const [imageFit, setImageFit] = useState('cover');
  const [imageAspect, setImageAspect] = useState('3/4');
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageAspect(`${naturalWidth}/${naturalHeight}`);
    if (naturalWidth > naturalHeight) {
      setImageFit('contain');
    } else {
      setImageFit('cover');
    }
  };

  const handleToggleRead = (e, chapterId, chapterNumber) => {
    e.preventDefault();
    e.stopPropagation();

    const isRead = isChapterRead(id, chapterId);
    if (isRead) {
      removeChapterRead(id, chapterId);
    } else {
      saveChapterRead(id, chapterId, chapterNumber);
    }

    // Instantly update state to trigger a re-render
    setMangaHistory(getMangaReadingHistory(id));
  };

  const [formStatus, setFormStatus] = useState('plan_to_read');
  const [chaptersRead, setChaptersRead] = useState(0);
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch manga details and chapters list on mount/id change
  useEffect(() => {
    let isMounted = true;
    const fetchMangaData = async () => {
      setLoading(true);
      setChaptersLoading(true);
      setError('');
      try {
        const details = await getMangaDetails(id);
        if (!isMounted) return;
        setManga(details);
        setLoading(false);

        try {
          const chList = await getMangaChapters(id);
          if (isMounted) {
            setChapters(chList);
          }
        } catch (chErr) {
          console.error('Failed to load chapters list:', chErr);
        } finally {
          if (isMounted) {
            setChaptersLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to retrieve manga data.');
          setLoading(false);
          setChaptersLoading(false);
        }
      }
    };

    fetchMangaData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Sync component state with database library entry when it loads
  useEffect(() => {
    if (libraryEntry) {
      setFormStatus(libraryEntry.status || 'plan_to_read');
      setChaptersRead(libraryEntry.chaptersRead || 0);
      setScore(libraryEntry.score !== null && libraryEntry.score !== undefined ? String(libraryEntry.score) : '');
      setNotes(libraryEntry.notes || '');
    } else {
      setFormStatus('plan_to_read');
      setChaptersRead(0);
      setScore('');
      setNotes('');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [libraryEntry]);

  const handleAdd = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await addManga({
        mangaId: id,
        status: formStatus,
        chaptersRead,
        score: score ? parseInt(score, 10) : null,
        notes: notes || null,
      });
      setSuccessMsg('Added to library!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add to library.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateManga(id, {
        status: formStatus,
        chaptersRead: parseInt(chaptersRead, 10) || 0,
        score: score ? parseInt(score, 10) : null,
        notes: notes || null,
      });
      setSuccessMsg('Changes saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to remove this manga from your library?')) {
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await removeManga(id);
      setSuccessMsg('Removed from library.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove from library.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        <p className="text-slate-400 text-sm font-medium">Loading manga details from MangaDex...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-rose-950/10 border border-rose-900/50 rounded-2xl p-8 max-w-lg mx-auto">
        <p className="text-rose-400 font-medium mb-4">Error loading MangaDex details: {error}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/browse" className="text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white px-5 py-2.5 rounded-lg transition duration-150">
            &larr; Back to Browse
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition duration-150"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!manga) return null;

  const coverUrl = getCoverArt(manga);

  return (
    <div className="space-y-8">
      {/* Return button */}
      <div>
        <Link to="/browse" className="inline-flex items-center text-slate-400 hover:text-rose-500 text-sm transition duration-150">
          &larr; Back to Browse
        </Link>
      </div>

      {/* Main Details Panel */}
      <div className="flex flex-col md:flex-row gap-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Cover Art Box */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div 
            className="relative w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
            style={{ aspectRatio: imageAspect }}
          >
            {coverUrl && !coverLoaded && !coverError && (
              <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 animate-pulse z-10" />
            )}

            {coverUrl && !coverError ? (
              <CoverViewer imageUrl={coverUrl} title={manga.title}>
                <img
                  src={coverUrl}
                  alt={manga.title}
                  className={`w-full h-full cursor-pointer transition-opacity duration-300 ${
                    imageFit === 'contain' ? 'object-contain' : 'object-cover'
                  } ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={(e) => {
                    handleImageLoad(e);
                    setCoverLoaded(true);
                  }}
                  onError={() => {
                    setCoverError(true);
                    setCoverLoaded(true);
                  }}
                />
              </CoverViewer>
            ) : (
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-lg">
                <span className="text-slate-600 font-bold text-sm">No Cover Image</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!currentUser ? (
            <div className="mt-4 p-4 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/30 border-dashed rounded-xl text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Want to track this manga?</p>
              <Link
                to="/login"
                className="inline-block w-full bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-white border border-slate-200 dark:border-transparent text-xs font-bold py-2 rounded-lg transition duration-150 text-center"
              >
                Sign In to Add
              </Link>
            </div>
          ) : !libraryEntry ? (
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
                >
                  <option value="plan_to_read">Plan to Read</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                  <option value="re_reading">Rereading</option>
                </select>
              </div>

              <button
                onClick={handleAdd}
                disabled={isSubmitting || libraryLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800/50 disabled:text-slate-400 text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition duration-150 flex items-center justify-center"
              >
                {isSubmitting ? 'Adding...' : 'Add to Library'}
              </button>

              {errorMsg && (
                <div className="text-xs bg-rose-950/30 border border-rose-900/50 text-rose-400 p-2.5 rounded-lg mt-2">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="text-xs bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-2.5 rounded-lg mt-2">
                  {successMsg}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900/50 rounded-xl space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-500">Library Settings</h4>

              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
                >
                  <option value="plan_to_read">Plan to Read</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                  <option value="re_reading">Rereading</option>
                </select>
              </div>

              <div>
                <label htmlFor="chaptersRead" className="block text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Chapters Read
                </label>
                <input
                  id="chaptersRead"
                  type="number"
                  min="0"
                  value={chaptersRead}
                  onChange={(e) => setChaptersRead(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
                />
              </div>

              <div>
                <label htmlFor="score" className="block text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Score
                </label>
                <select
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
                >
                  <option value="">No Score</option>
                  <option value="10">(10) Masterpiece</option>
                  <option value="9">(9) Great</option>
                  <option value="8">(8) Very Good</option>
                  <option value="7">(7) Good</option>
                  <option value="6">(6) Fine</option>
                  <option value="5">(5) Average</option>
                  <option value="4">(4) Bad</option>
                  <option value="3">(3) Very Bad</option>
                  <option value="2">(2) Horrible</option>
                  <option value="1">(1) Appalling</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your review or thoughts..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150 resize-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting || libraryLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 disabled:text-slate-400 text-white font-bold py-2 rounded-lg text-xs shadow-md transition duration-150 flex items-center justify-center"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  onClick={handleRemove}
                  disabled={isSubmitting || libraryLoading}
                  className="w-full bg-white hover:bg-rose-50 dark:bg-slate-800 hover:dark:bg-rose-600/20 hover:text-rose-600 hover:dark:text-rose-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 font-bold py-2 rounded-lg text-xs transition duration-150 flex items-center justify-center"
                >
                  {isSubmitting ? 'Removing...' : 'Remove from Library'}
                </button>
              </div>

              {errorMsg && (
                <div className="text-xs bg-rose-950/30 border border-rose-900/50 text-rose-400 p-2.5 rounded-lg mt-2">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="text-xs bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-2.5 rounded-lg mt-2">
                  {successMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text Metadata */}
        <div className="flex-grow space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{manga.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Written by <span className="font-semibold text-slate-700 dark:text-slate-300">{manga.author}</span> &bull; Art by <span className="font-semibold text-slate-700 dark:text-slate-300">{manga.artist}</span></p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase">
            <span className="px-2.5 py-1 bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-md border border-rose-100 dark:border-slate-700/50">
              {manga.status}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700/50">
              Year: {manga.year}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700/50">
              Content: {manga.contentRating}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl whitespace-pre-line">{manga.description}</p>
          </div>

          {manga.genres && manga.genres.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-slate-755 dark:text-slate-300">Genres</h3>
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 rounded-md font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button: Start/Resume Reading */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/40">
            {chapters.length === 0 ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full sm:w-auto px-8 py-3 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 font-bold rounded-xl text-sm border border-slate-200 dark:border-slate-800 cursor-not-allowed flex items-center justify-center gap-2 select-none"
                >
                  No Chapters Available
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This manga currently has no translations or chapters listed.</p>
              </div>
            ) : mangaHistory.length > 0 ? (
              (() => {
                const lastReadEntry = mangaHistory[0];
                const lastReadCh = chapters.find((ch) => ch.id === lastReadEntry.chapterId);
                const targetChapterId = lastReadCh ? lastReadCh.id : chapters[0].id;
                const displayChapterNum = lastReadCh ? lastReadCh.number : (lastReadEntry.chapterNumber || 'Unknown');
                return (
                  <Link
                    to={`/read/${targetChapterId}`}
                    className="inline-flex w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition duration-150 shadow-md shadow-rose-950/20 text-center items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Resume Reading &bull; Chapter {displayChapterNum}
                  </Link>
                );
              })()
            ) : (
              <Link
                to={`/read/${chapters[0].id}`}
                className="inline-flex w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition duration-150 shadow-md shadow-rose-950/20 text-center items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Reading
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chapters list section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Chapters List</h3>
          {!chaptersLoading && chapters.length > 0 && (
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 select-none">
              {chapters.length} Chapters
            </span>
          )}
        </div>
        {chaptersLoading ? (
          <ChapterSkeleton count={6} />
        ) : chapters.length > 0 ? (
          <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-[500px] overflow-y-auto">
              {chapters.map((chapter) => {
                const lastReadEntry = mangaHistory[0];
                const isLastRead = lastReadEntry && chapter.id === lastReadEntry.chapterId;
                const isRead = isChapterRead(id, chapter.id);

                return (
                  <div
                    key={chapter.id}
                    className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition duration-150 ${
                      isLastRead 
                        ? 'bg-rose-50/20 dark:bg-rose-950/10 border-l-4 border-l-rose-500 dark:border-l-rose-600' 
                        : isRead 
                          ? 'opacity-70' 
                          : ''
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Manual Read/Unread Toggle Button */}
                        <button
                          onClick={(e) => handleToggleRead(e, chapter.id, chapter.number)}
                          className="focus:outline-none transition-all duration-150 hover:scale-110 active:scale-95"
                          title={isRead ? "Mark as Unread" : "Mark as Read"}
                        >
                          {isRead ? (
                            <EyeOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400" />
                          )}
                        </button>
                        <span className={`text-sm font-bold ${isLastRead ? 'text-rose-600 dark:text-rose-400' : isRead ? 'text-slate-455 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                          Chapter {chapter.number}
                        </span>
                        {isLastRead && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 text-[9px] font-bold border border-rose-100 dark:border-rose-900/40 select-none uppercase tracking-wider">
                            Last Read
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${isLastRead ? 'text-rose-500/80 dark:text-rose-400/80' : isRead ? 'text-slate-400 dark:text-slate-600' : 'text-slate-550 dark:text-slate-400'}`}>
                        {chapter.title}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-slate-500 hidden sm:inline">{chapter.date}</span>
                      <Link
                        to={`/read/${chapter.id}`}
                        className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold transition duration-150"
                      >
                        Read
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900/50 border-dashed rounded-xl">
            <p className="text-slate-500 text-sm">No chapters found or translations available in English.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaDetails;
