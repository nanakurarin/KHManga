import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  addToLibrary,
  getLibrary,
  updateLibrary,
  removeFromLibrary,
} from '../services/libraryApi';

// Create the Context
const LibraryContext = createContext();

/**
 * Custom hook to easily access library context values.
 */
export function useLibrary() {
  return useContext(LibraryContext);
}

/**
 * Provider component that manages the user's manga library state.
 */
export function LibraryProvider({ children }) {
  const { currentUser } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load the library list from the backend for the current user.
   */
  const loadLibrary = async () => {
    if (!currentUser) {
      setLibrary([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const responseData = await getLibrary(currentUser.uid);
      // Backend returns structure like { success: true, count: X, library: [...] }
      setLibrary(responseData.library || []);
    } catch (err) {
      console.error('Error loading library context:', err);
      setError(err.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  // Synchronize library data automatically when the user signs in or out
  useEffect(() => {
    if (currentUser) {
      loadLibrary();
    } else {
      setLibrary([]);
      setError(null);
    }
  }, [currentUser]);

  /**
   * Add a manga to the library.
   * 
   * @param {Object} mangaData - mangaId, status, chaptersRead, score, notes, startDate, finishDate
   */
  const addManga = async (mangaData) => {
    if (!currentUser) {
      throw new Error('You must be logged in to modify your library.');
    }
    setLoading(true);
    setError(null);
    try {
      const responseData = await addToLibrary({
        firebaseUid: currentUser.uid,
        ...mangaData,
      });
      
      // Backend returns { success: true, libraryEntry: ... }
      const newEntry = responseData.libraryEntry;
      setLibrary((prev) => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update library details for a manga.
   * 
   * @param {string} mangaId
   * @param {Object} updateData
   */
  const updateManga = async (mangaId, updateData) => {
    if (!currentUser) {
      throw new Error('You must be logged in to modify your library.');
    }
    setLoading(true);
    setError(null);
    try {
      const responseData = await updateLibrary(currentUser.uid, mangaId, updateData);
      const updatedEntry = responseData.libraryEntry;
      
      setLibrary((prev) =>
        prev.map((entry) => (entry.mangaId === mangaId ? updatedEntry : entry))
      );
      return updatedEntry;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove a manga from the library.
   * 
   * @param {string} mangaId
   */
  const removeManga = async (mangaId) => {
    if (!currentUser) {
      throw new Error('You must be logged in to modify your library.');
    }
    setLoading(true);
    setError(null);
    try {
      await removeFromLibrary(currentUser.uid, mangaId);
      setLibrary((prev) => prev.filter((entry) => entry.mangaId !== mangaId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if a manga is in the library.
   * 
   * @param {string} mangaId
   * @returns {boolean}
   */
  const isInLibrary = (mangaId) => {
    return library.some((entry) => entry.mangaId === mangaId);
  };

  const value = {
    library,
    loading,
    error,
    loadLibrary,
    addManga,
    updateManga,
    removeManga,
    isInLibrary,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}
