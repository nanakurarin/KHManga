const HISTORY_KEY = 'khmanga_reading_history';

/**
 * Get the entire reading history map from localStorage.
 * 
 * @returns {Object} Keyed by mangaId, value is an array of read chapters
 */
export const getReadingHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to parse reading history from localStorage:', error);
    return {};
  }
};

/**
 * Get read chapters array for a specific manga.
 * 
 * @param {string} mangaId - Manga UUID
 * @returns {Array<Object>} List of read chapters
 */
export const getMangaReadingHistory = (mangaId) => {
  if (!mangaId) return [];
  const history = getReadingHistory();
  return history[mangaId] || [];
};

/**
 * Save progress for a read chapter.
 * Automatically inserts/updates the entry with the current timestamp.
 * Prevents duplicate chapter entries.
 * 
 * @param {string} mangaId - Manga UUID
 * @param {string} chapterId - Chapter UUID
 * @param {string|null} chapterNumber - Chapter display number (e.g. "5")
 */
export const saveChapterRead = (mangaId, chapterId, chapterNumber = null) => {
  if (!mangaId || !chapterId) return;

  const history = getReadingHistory();
  const mangaHistory = history[mangaId] || [];

  // Filter out any existing duplicate chapter entry to update it
  const updatedMangaHistory = mangaHistory.filter(
    (item) => item.chapterId !== chapterId
  );

  // Append/Prepend the new/updated entry with fresh timestamp
  const newEntry = {
    chapterId,
    chapterNumber: chapterNumber ? String(chapterNumber) : null,
    timestamp: Date.now(),
  };

  // Prepend to show most recently read first
  updatedMangaHistory.unshift(newEntry);

  // Save back to history map
  history[mangaId] = updatedMangaHistory;
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to write reading history to localStorage:', error);
  }
};

/**
 * Check if a specific chapter has been read.
 * 
 * @param {string} mangaId - Manga UUID
 * @param {string} chapterId - Chapter UUID
 * @returns {boolean} True if read, false otherwise
 */
export const isChapterRead = (mangaId, chapterId) => {
  if (!mangaId || !chapterId) return false;
  const mangaHistory = getMangaReadingHistory(mangaId);
  return mangaHistory.some((item) => item.chapterId === chapterId);
};

/**
 * Remove a chapter from the reading history (marking it as unread).
 * 
 * @param {string} mangaId - Manga UUID
 * @param {string} chapterId - Chapter UUID
 */
export const removeChapterRead = (mangaId, chapterId) => {
  if (!mangaId || !chapterId) return;

  const history = getReadingHistory();
  const mangaHistory = history[mangaId] || [];

  const updatedMangaHistory = mangaHistory.filter(
    (item) => item.chapterId !== chapterId
  );

  history[mangaId] = updatedMangaHistory;

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to write reading history to localStorage:', error);
  }
};
