import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { getMangaDetails, getMangaChapters, getCoverArt } from '../services/mangaDexApi';

function MangaDetails() {
  const { id } = useParams();

  const { currentUser } = useAuth();
  const { library, addManga, updateManga, removeManga, loading: libraryLoading } = useLibrary();

  // Find library entry for this manga if it exists
  const libraryEntry = library.find((entry) => entry.mangaId === id);

  const [formStatus, setFormStatus] = useState('plan_to_read');
  const [chaptersRead, setChaptersRead] = useState(0);
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch manga details and chapters list on mount/id change
  useEffect(() => {
    const fetchMangaData = async () => {
      setLoading(true);
      setError('');
      try {
        const details = await getMangaDetails(id);
        setManga(details);
        
        const chList = await getMangaChapters(id);
        setChapters(chList);
      } catch (err) {
        setError(err.message || 'Failed to retrieve manga data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMangaData();
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
      <div className="flex flex-col md:flex-row gap-8 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 sm:p-8">
        {/* Cover Art Box */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[3/4] bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 overflow-hidden relative shadow-lg">
            {coverUrl ? (
              <img 
                src={coverUrl} 
                alt={manga.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-600 font-bold text-sm">No Cover Image</span>
            )}
          </div>
          
          {/* Action buttons */}
          {!currentUser ? (
            <div className="mt-4 p-4 bg-slate-950/20 border border-slate-900/30 border-dashed rounded-xl text-center">
              <p className="text-xs text-slate-400 mb-2 font-medium">Want to track this manga?</p>
              <Link
                to="/login"
                className="inline-block w-full bg-slate-850 hover:bg-slate-750 text-white text-xs font-bold py-2 rounded-lg transition duration-150 text-center"
              >
                Sign In to Add
              </Link>
            </div>
          ) : !libraryEntry ? (
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-slate-400 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
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
            <div className="mt-4 p-4 bg-slate-950/40 border border-slate-900/50 rounded-xl space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-500">Library Settings</h4>
              
              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-slate-400 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
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
                <label htmlFor="chaptersRead" className="block text-xs font-semibold text-slate-400 mb-1">
                  Chapters Read
                </label>
                <input
                  id="chaptersRead"
                  type="number"
                  min="0"
                  value={chaptersRead}
                  onChange={(e) => setChaptersRead(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
                />
              </div>

              <div>
                <label htmlFor="score" className="block text-xs font-semibold text-slate-400 mb-1">
                  Score
                </label>
                <select
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150"
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
                <label htmlFor="notes" className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your review or thoughts..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rose-500 transition duration-150 resize-none"
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
                  className="w-full bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-300 border border-slate-700/50 font-bold py-2 rounded-lg text-xs transition duration-150 flex items-center justify-center"
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
            <h2 className="text-3xl font-extrabold text-white">{manga.title}</h2>
            <p className="text-sm text-slate-400 mt-1">Written by <span className="font-semibold text-slate-300">{manga.author}</span> &bull; Art by <span className="font-semibold text-slate-300">{manga.artist}</span></p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase">
            <span className="px-2.5 py-1 bg-slate-800 text-rose-400 rounded-md border border-slate-700/50">
              {manga.status}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700/50">
              Year: {manga.year}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700/50">
              Content: {manga.contentRating}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300">Description</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl whitespace-pre-line">{manga.description}</p>
          </div>

          {manga.genres && manga.genres.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-slate-300">Genres</h3>
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map((genre) => (
                  <span 
                    key={genre} 
                    className="text-[11px] px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-md font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chapters list section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-200">Chapters List</h3>
        {chapters.length > 0 ? (
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-900 max-h-[500px] overflow-y-auto">
              {chapters.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-900/50 transition duration-150"
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-slate-200">
                      Chapter {chapter.number}
                    </span>
                    <p className="text-xs text-slate-400">{chapter.title}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-500 hidden sm:inline">{chapter.date}</span>
                    <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-xs font-semibold transition duration-150">
                      Read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/20 border border-slate-900/50 border-dashed rounded-xl">
            <p className="text-slate-500 text-sm">No chapters found or translations available in English.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaDetails;
