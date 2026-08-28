import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchManga } from '../../services/mangaDexApi';
import SearchDropdown from './SearchDropdown';

/**
 * SearchBar - Handles autocomplete input, debouncing, and keyboard actions.
 */
function SearchBar({ placeholder = "Search manga...", onSearchNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Debounced fetch of autocomplete results
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { mangaList } = await searchManga(query, { limit: 5 });
        setResults(mangaList.slice(0, 5));
        setIsOpen(true);
      } catch (err) {
        console.error('Autocomplete search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectManga = (manga) => {
    navigate(`/manga/${manga.id}`);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSearchNavigate) onSearchNavigate();
  };

  const handleViewAll = () => {
    if (query.trim()) {
      navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/browse');
    }
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSearchNavigate) onSearchNavigate();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen && query.trim().length >= 2) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    const totalItems = results.length + 1; // +1 is the "View all results" option

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex === -1) {
        handleViewAll();
      } else if (activeIndex === results.length) {
        handleViewAll();
      } else if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelectManga(results[activeIndex]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleViewAll();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-xl pl-4 pr-10 py-2 md:py-1.5 text-sm md:text-xs text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition duration-150"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-slate-500 hover:text-rose-500 transition duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {isOpen && (
        <SearchDropdown
          results={results}
          loading={loading}
          query={query}
          activeIndex={activeIndex}
          onSelect={handleSelectManga}
          onViewAll={handleViewAll}
        />
      )}
    </div>
  );
}

export default SearchBar;
