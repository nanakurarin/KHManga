import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChapterDetails, getChapterPages, getMangaChapters } from '../services/mangaDexApi';
import { saveChapterRead } from '../utils/readingHistory';

const STORAGE_KEY = 'khmanga-reader-settings';

const DEFAULT_SETTINGS = {
  readingMode: 'ltr',
  imageSizing: 'fit-height',
  imageSpacing: 'small',
  pageMargin: 'none',
  showHeader: true,
  pageTransition: 'none',
  imageCorner: 'rounded',
};

const marginClasses = {
  none: 'max-w-full px-0',
  small: 'max-w-[1000px] px-2 sm:px-4',
  medium: 'max-w-3xl px-4 sm:px-6',
  large: 'max-w-xl px-6 sm:px-8',
};

const spacingClasses = {
  none: 'space-y-0',
  small: 'space-y-2',
  medium: 'space-y-6',
  large: 'space-y-12',
};

const imageSizingClasses = {
  'fit-width': 'w-full h-auto object-contain',
  'fit-height': 'w-auto max-w-full object-contain mx-auto',
  'original': 'w-auto h-auto max-w-none',
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load reader settings:', err);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Reader Component
 * Vertical scrolling reader page displaying manga chapter pages sequentially.
 */
function Reader() {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  // Chapter details & page list states
  const [chapter, setChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Full chapters list of the manga for navigation
  const [chapters, setChapters] = useState([]);

  // Reader Settings States
  const [settings, setSettings] = useState(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [startAtLastPage, setStartAtLastPage] = useState(false);
  const [hoveredPageIdx, setHoveredPageIdx] = useState(null);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // Calculate navigation target bounds (moved up to avoid TDZ ReferenceError in hooks/handlers)
  const currentIndex = chapters.findIndex((ch) => ch.id === chapterId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < chapters.length - 1;

  const previousChapterId = hasPrevious ? chapters[currentIndex - 1].id : null;
  const nextChapterId = hasNext ? chapters[currentIndex + 1].id : null;

  // Available viewport height for Fit Height mode (MangaDex behavior)
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight);

  const calculateAvailableHeight = () => {
    const windowH = window.innerHeight;
    let paddingH = 0;
    let safetyH = 0;
    if (settings.readingMode === 'vertical') {
      paddingH = 32;
      safetyH = 8;
    } else {
      paddingH = settings.imageSizing === 'fit-height' ? 0 : 64; // py-0 vs py-8
      safetyH = settings.imageSizing === 'fit-height' ? 0 : 8;
    }
    setAvailableHeight(windowH - paddingH - safetyH);
  };

  useEffect(() => {
    calculateAvailableHeight();

    window.addEventListener('resize', calculateAvailableHeight);
    const timer = setTimeout(calculateAvailableHeight, 100);

    return () => {
      window.removeEventListener('resize', calculateAvailableHeight);
      clearTimeout(timer);
    };
  }, [settings, pages]);

  // Restored standard scroll flow in all modes to support scroll-past header triggers

  // Default to fit height when we open a manga chapter (whenever chapterId changes)
  useEffect(() => {
    setSettings((prev) => ({ ...prev, imageSizing: 'fit-height' }));
    setIsInitialScrollDone(false);
  }, [chapterId]);

  // Track active page index in vertical scroll mode based on viewport proximity
  useEffect(() => {
    if (settings.readingMode !== 'vertical' || pages.length === 0) return;

    const handleScroll = () => {
      const pageElements = document.querySelectorAll('[data-page-index]');
      let activeIndex = 0;
      let minDistance = Infinity;

      pageElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Distance from center of element to center of viewport
        const distance = Math.abs((rect.top + rect.bottom) / 2 - window.innerHeight / 2);
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = parseInt(el.getAttribute('data-page-index'), 10);
        }
      });

      setCurrentPageIndex(activeIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [settings.readingMode, pages.length]);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save reader settings:', err);
      }
      return updated;
    });
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (err) {
      console.error('Failed to reset reader settings:', err);
    }
  };

  // Toggle browser fullscreen mode on double click
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen mode:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle direct page selection from segmented progress bar
  const handlePageSegmentClick = (idx) => {
    setCurrentPageIndex(idx);
    if (settings.readingMode === 'vertical') {
      const el = document.querySelector(`[data-page-index="${idx}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 65;
      window.scrollTo({ top: headerHeight, behavior: 'instant' });
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 65;
      window.scrollTo({ top: headerHeight, behavior: 'instant' });
    } else {
      if (hasNext && nextChapterId) {
        navigate(`/read/${nextChapterId}`);
        setCurrentPageIndex(0);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 65;
      window.scrollTo({ top: headerHeight, behavior: 'instant' });
    } else {
      if (hasPrevious && previousChapterId) {
        setStartAtLastPage(true);
        navigate(`/read/${previousChapterId}`);
      }
    }
  };

  // Adjust page index when pages are loaded or changed
  useEffect(() => {
    if (pages && pages.length > 0) {
      if (startAtLastPage) {
        setCurrentPageIndex(pages.length - 1);
        setStartAtLastPage(false);
        // Scroll to the bottom of the document
        setTimeout(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
          setIsInitialScrollDone(true);
        }, 100);
      } else {
        setCurrentPageIndex(0);
        // Scroll to the bottom of the header (to hide it on load) for all reading modes
        setTimeout(() => {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 65;
          window.scrollTo(0, headerHeight);
          setIsInitialScrollDone(true);
        }, 100);
      }
    } else {
      setCurrentPageIndex(0);
    }
  }, [pages]);

  // Handle scroll offset adjustments when entering or exiting fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen) {
        // Exited fullscreen: scroll past the header so it remains hidden in standard view
        setIsInitialScrollDone(false);
        setTimeout(() => {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 65;
          window.scrollTo(0, headerHeight);
          setIsInitialScrollDone(true);
        }, 150);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Preload all pages in the background after the first page starts loading
  useEffect(() => {
    if (!pages || pages.length <= 1) return;

    let active = true;
    const preloadPages = async () => {
      // Start preloading remaining pages one by one sequentially
      for (let i = 1; i < pages.length; i++) {
        if (!active) break;
        const url = pages[i];
        try {
          await new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve; // Always resolve to continue preloading subsequent pages
          });
        } catch (e) {
          console.error('Failed to preload page index:', i, e);
        }
      }
    };

    // Delay preloading by 500ms to give network priority to the first page's load
    const delayTimer = setTimeout(() => {
      preloadPages();
    }, 500);

    return () => {
      active = false;
      clearTimeout(delayTimer);
    };
  }, [pages]);

  // Handle keypress controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setSettingsOpen(false);
      }

      if (settings.readingMode === 'ltr') {
        if (e.key === 'ArrowRight') {
          handleNextPage();
        } else if (e.key === 'ArrowLeft') {
          handlePrevPage();
        }
      } else if (settings.readingMode === 'rtl') {
        if (e.key === 'ArrowLeft') {
          handleNextPage();
        } else if (e.key === 'ArrowRight') {
          handlePrevPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings.readingMode, currentPageIndex, pages.length, nextChapterId, previousChapterId]);

  // Automatically save chapter reading progress in localStorage once loaded
  useEffect(() => {
    if (!loading && !error && chapter && chapter.mangaId) {
      saveChapterRead(chapter.mangaId, chapterId, chapter.chapter || null);
    }
  }, [loading, error, chapter, chapterId]);

  // Fetch the manga's chapters list to support previous/next navigation
  useEffect(() => {
    if (!chapter || !chapter.mangaId) return;

    const fetchChaptersList = async () => {
      try {
        const list = await getMangaChapters(chapter.mangaId);
        setChapters(list);
      } catch (err) {
        console.error('Failed to retrieve chapters list for navigation:', err);
      }
    };

    fetchChaptersList();
  }, [chapter?.mangaId]);

  // Navigation targets are calculated above

  // Fetch data on mount / chapterId change
  useEffect(() => {
    let isMounted = true;

    const fetchChapterData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch details (manga information & chapter info) and pages concurrently
        const [detailsResult, pagesResult] = await Promise.all([
          getChapterDetails(chapterId),
          getChapterPages(chapterId)
        ]);

        if (isMounted) {
          setChapter(detailsResult);
          setPages(pagesResult);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching reader data:', err);
          setError(err.message || 'Failed to retrieve chapter pages.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChapterData();

    return () => {
      isMounted = false;
    };
  }, [chapterId]);

  // Loading indicator / skeleton page loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 py-24 space-y-4">
        {/* Header loading skeleton */}
        <div className="w-full max-w-3xl space-y-3 animate-pulse pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-6 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>

        {/* Page loading skeletons */}
        <div className="w-full max-w-3xl space-y-6 pt-6">
          <div className="w-full aspect-[2/3] bg-slate-200 dark:bg-slate-900 rounded-xl flex items-center justify-center animate-pulse">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
          <div className="w-full aspect-[2/3] bg-slate-200 dark:bg-slate-900 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error layout
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 py-24">
        <div className="text-center py-12 px-8 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850/80 rounded-2xl shadow-xl max-w-lg w-full space-y-6">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-455">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Reader Loading Error</h3>
            <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">
              We encountered an issue downloading this chapter's pages: <br />
              <span className="font-semibold text-rose-600 dark:text-rose-450">{error}</span>
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 font-bold rounded-xl text-xs transition duration-150 border border-slate-200 dark:border-slate-700"
            >
              &larr; Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-rose-650 hover:bg-rose-750 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-950/20 transition duration-150"
            >
              Retry Load
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Page classes are defined at the module level

  const mangaTitle = chapter?.mangaTitle || 'Manga';
  const chapterDisplay = chapter?.chapter ? `Chapter ${chapter.chapter}` : '';
  const titleDisplay = chapter?.title ? chapter.title : '';

  const fitHeightStyle = {
    height: `${availableHeight}px`,
    maxHeight: `${availableHeight}px`,
    width: 'auto',
    maxWidth: '100%',
    objectFit: 'contain',
  };

  const transitionClass =
    settings.pageTransition === 'fade'
      ? 'animate-reader-fade'
      : settings.pageTransition === 'slide'
        ? 'animate-reader-slide'
        : '';

  // Determine navigation states (disabled if on first/last page and there is no prev/next chapter)
  const isPrevDisabled = currentPageIndex === 0 && !hasPrevious;
  const isNextDisabled = currentPageIndex === pages.length - 1 && !hasNext;

  const isLeftDisabled = settings.readingMode === 'ltr' ? isPrevDisabled : isNextDisabled;
  const isRightDisabled = settings.readingMode === 'ltr' ? isNextDisabled : isPrevDisabled;

  const handleLeftClick = settings.readingMode === 'ltr' ? handlePrevPage : handleNextPage;
  const handleRightClick = settings.readingMode === 'ltr' ? handleNextPage : handlePrevPage;

  const leftCursorClass = isLeftDisabled ? 'cursor-reader-prev-disabled' : 'cursor-reader-prev';
  const rightCursorClass = isRightDisabled ? 'cursor-reader-next-disabled' : 'cursor-reader-next';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center pt-0">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes readerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes readerSlideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-reader-fade {
          animation: readerFadeIn 0.2s ease-out forwards;
        }
        .animate-reader-slide {
          animation: readerSlideIn 0.2s ease-out forwards;
        }
        .cursor-reader-prev {
          cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='rgba(15, 23, 42, 0.6)' stroke='rgba(255, 255, 255, 0.2)' stroke-width='1'/%3E%3Cpath d='M19 10 L13 16 L19 22' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 16 16, w-resize;
        }
        .cursor-reader-next {
          cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='rgba(15, 23, 42, 0.6)' stroke='rgba(255, 255, 255, 0.2)' stroke-width='1'/%3E%3Cpath d='M13 10 L19 16 L13 22' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 16 16, e-resize;
        }
        .cursor-reader-prev-disabled {
          cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='rgba(15, 23, 42, 0.2)' stroke='rgba(255, 255, 255, 0.1)' stroke-width='1'/%3E%3Cpath d='M19 10 L13 16 L19 22' fill='none' stroke='white' stroke-opacity='0.25' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 16 16, not-allowed;
        }
        .cursor-reader-next-disabled {
          cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='rgba(15, 23, 42, 0.2)' stroke='rgba(255, 255, 255, 0.1)' stroke-width='1'/%3E%3Cpath d='M13 10 L19 16 L13 22' fill='none' stroke='white' stroke-opacity='0.25' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 16 16, not-allowed;
        }
      `}</style>

      {/* 1. READER HEADER */}
      {settings.showHeader && !isFullscreen && (
        <header className={`w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-900 shadow-sm px-4 py-3 sm:px-6 z-30 transition-opacity duration-150 ${
          isInitialScrollDone ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* Back Action & Navigation */}
            <div className="flex items-center space-x-3">
              <Link
                to={chapter?.mangaId ? `/manga/${chapter.mangaId}` : '/browse'}
                className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-150 flex items-center gap-1 text-xs font-bold uppercase tracking-wider select-none"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Manga
              </Link>

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-850 dark:text-slate-200 line-clamp-1">{mangaTitle}</h1>
                <p className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                  {chapterDisplay} {titleDisplay && ` - ${titleDisplay}`}
                </p>
              </div>
            </div>

            {/* Mobile Display details */}
            <div className="sm:hidden border-t border-slate-100 dark:border-slate-855 pt-2.5">
              <h1 className="text-xs font-bold text-slate-850 dark:text-slate-200">{mangaTitle}</h1>
              <p className="text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                {chapterDisplay} {titleDisplay && ` - ${titleDisplay}`}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center space-x-3 sm:space-x-4 animate-none">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 select-none">
                Page {currentPageIndex + 1} / {pages.length}
              </span>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
              {hasPrevious ? (
                <Link
                  to={`/read/${previousChapterId}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition duration-150 flex items-center gap-1 select-none"
                >
                  &larr; Prev
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-855/30 rounded-lg text-xs font-bold cursor-not-allowed flex items-center gap-1 select-none"
                >
                  &larr; Prev
                </button>
              )}

              {hasNext ? (
                <Link
                  to={`/read/${nextChapterId}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition duration-150 flex items-center gap-1 select-none"
                >
                  Next &rarr;
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-855/30 rounded-lg text-xs font-bold cursor-not-allowed flex items-center gap-1 select-none"
                >
                  Next &rarr;
                </button>
              )}
            </div>

          </div>
        </header>
      )}

      {/* Immersive Floating Exit button (when header is hidden) */}
      {!settings.showHeader && (
        <Link
          to={chapter?.mangaId ? `/manga/${chapter.mangaId}` : '/browse'}
          className="fixed top-6 left-6 z-40 bg-white/90 dark:bg-slate-900/90 text-slate-650 dark:text-slate-355 hover:text-rose-650 dark:hover:text-rose-455 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 transition duration-150 backdrop-blur-sm"
          title="Back to Manga Details"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      )}

      {/* 2. PAGES LAYOUT */}
      {settings.readingMode === 'vertical' ? (
        <main className={`w-full ${marginClasses[settings.pageMargin]} flex flex-col items-center ${spacingClasses[settings.imageSpacing]} py-4`}>
          {pages.map((url, index) => (
            <div
              key={index}
              data-page-index={index}
              style={settings.imageSizing === 'fit-height' ? { height: `${availableHeight}px` } : undefined}
              className={`w-full flex justify-center items-center bg-slate-100/50 dark:bg-slate-900/10 ${settings.imageCorner === 'rounded' ? 'rounded-xl' : 'rounded-none'} overflow-hidden shadow-sm hover:shadow-md transition duration-200 relative select-none border border-slate-200/20 dark:border-slate-850/10`}
              onDoubleClick={handleToggleFullscreen}
            >
              {/* Page tracking number badge */}
              <div className="absolute top-3 right-3 bg-slate-900/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full select-none z-10 uppercase tracking-wider backdrop-blur-sm">
                Page {index + 1} / {pages.length}
              </div>

              <div className={`w-full ${settings.imageSizing === 'original' ? 'overflow-auto' : 'overflow-hidden'} flex justify-center items-center h-full`}>
                <img
                  src={url}
                  alt={`Page ${index + 1}`}
                  style={settings.imageSizing === 'fit-height' ? fitHeightStyle : undefined}
                  className={`${imageSizingClasses[settings.imageSizing]} ${settings.imageCorner === 'rounded' ? 'rounded-xl' : 'rounded-none'} select-none`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onLoad={calculateAvailableHeight}
                />
              </div>
            </div>
          ))}
        </main>
      ) : (
        <main className={`w-full ${marginClasses[settings.pageMargin]} flex flex-col items-center ${settings.imageSizing === 'fit-height' ? 'py-0' : 'py-8'} flex-grow justify-center`}>
          <div
            key={currentPageIndex}
            className={`w-full flex justify-center relative select-none group ${transitionClass}`}
          >
            {/* Left Navigation Zone (Comfortable 30% width of the entire screen/container) */}
            <div
              onClick={isLeftDisabled ? undefined : handleLeftClick}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-0 w-[30%] h-full z-20 ${leftCursorClass}`}
              title={isLeftDisabled ? "No previous content" : (settings.readingMode === 'ltr' ? "Previous Page" : "Next Page")}
            />

            {/* Right Navigation Zone (Comfortable 30% width of the entire screen/container) */}
            <div
              onClick={isRightDisabled ? undefined : handleRightClick}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`absolute right-0 top-0 w-[30%] h-full z-20 ${rightCursorClass}`}
              title={isRightDisabled ? "No next content" : (settings.readingMode === 'ltr' ? "Next Page" : "Previous Page")}
            />

            <div
              style={settings.imageSizing === 'fit-height' ? { height: `${availableHeight}px` } : undefined}
              className={`w-full flex justify-center items-center bg-slate-100/50 dark:bg-slate-900/10 ${settings.imageCorner === 'rounded' ? 'rounded-xl' : 'rounded-none'} overflow-hidden shadow-sm border border-slate-200/20 dark:border-slate-850/10`}
            >
              <div className={`w-full ${settings.imageSizing === 'original' ? 'overflow-auto' : 'overflow-hidden'} flex justify-center items-center h-full`}>
                {/* Wrap the image in inline-flex relative wrapper for fullscreen double click */}
                <div
                  className="relative inline-flex justify-center items-center"
                  onDoubleClick={handleToggleFullscreen}
                >
                  <img
                    src={pages[currentPageIndex]}
                    alt={`Page ${currentPageIndex + 1}`}
                    style={settings.imageSizing === 'fit-height' ? fitHeightStyle : undefined}
                    className={`${imageSizingClasses[settings.imageSizing]} ${settings.imageCorner === 'rounded' ? 'rounded-xl' : 'rounded-none'} select-none`}
                    onLoad={calculateAvailableHeight}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Page navigation controls bar removed in favor of top header display & bottom segmented progress bar */}
        </main>
      )}

      {/* 3. BOTTOM UTILITIES & FUTURE COMPATIBILITY ANCHOR */}
      {settings.readingMode === 'vertical' && <div className="pb-24 w-full" />}

      {/* Floating Settings Gear Trigger (persistent under overlay) */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 p-3.5 rounded-full shadow-lg border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition duration-150 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90"
        title="Reader Settings"
      >
        <svg className="w-5 h-5 animate-[spin_10s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* 4. SETTINGS DRAWER */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <div
            onClick={() => setSettingsOpen(false)}
            className="absolute inset-0 bg-slate-950/60 transition-opacity duration-300 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between animate-[slideInRight_0.25s_ease-out_forwards]">
              <div className="space-y-6">

                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-rose-500 animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm uppercase tracking-wider">Reader Settings</h3>
                  </div>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Drawer Options */}
                <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">

                  {/* Reading Mode */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">Reading Mode</label>
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      {[
                        { label: 'Vertical', value: 'vertical' },
                        { label: 'LTR Paging', value: 'ltr' },
                        { label: 'RTL Paging', value: 'rtl' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSetting('readingMode', opt.value)}
                          className={`flex-1 py-1.5 rounded-md font-bold text-xs transition duration-150 ${settings.readingMode === opt.value
                            ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Sizing */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">Image Sizing</label>
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      {[
                        { label: 'Fit Width', value: 'fit-width' },
                        { label: 'Fit Height', value: 'fit-height' },
                        { label: 'Original', value: 'original' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSetting('imageSizing', opt.value)}
                          className={`flex-1 py-1.5 rounded-md font-bold text-xs transition duration-150 ${settings.imageSizing === opt.value
                            ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Page Margins */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">Page Margins (Width)</label>
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      {[
                        { label: 'None', value: 'none' },
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSetting('pageMargin', opt.value)}
                          className={`flex-1 py-1.5 rounded-md font-bold text-xs transition duration-150 ${settings.pageMargin === opt.value
                            ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Spacing (Vertical Only) */}
                  <div className={`space-y-2 transition duration-200 ${settings.readingMode !== 'vertical' ? 'opacity-40 pointer-events-none' : ''}`}>
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">Image Spacing</label>
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      {[
                        { label: 'None', value: 'none' },
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSetting('imageSpacing', opt.value)}
                          className={`flex-1 py-1.5 rounded-md font-bold text-xs transition duration-150 ${settings.imageSpacing === opt.value
                            ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                            }`}
                          disabled={settings.readingMode !== 'vertical'}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Page Transition (Paging Only) */}
                  <div className={`space-y-2 transition duration-200 ${settings.readingMode === 'vertical' ? 'opacity-40 pointer-events-none' : ''}`}>
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">Page Transition</label>
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      {[
                        { label: 'None', value: 'none' },
                        { label: 'Fade', value: 'fade' },
                        { label: 'Slide', value: 'slide' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSetting('pageTransition', opt.value)}
                          className={`flex-1 py-1.5 rounded-md font-bold text-xs transition duration-150 ${settings.pageTransition === opt.value
                            ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-455 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                            }`}
                          disabled={settings.readingMode === 'vertical'}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Corners Setting */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest">Image Corners</label>
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      {[
                        { label: 'Rounded', value: 'rounded' },
                        { label: 'Sharp', value: 'sharp' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSetting('imageCorner', opt.value)}
                          className={`flex-1 py-1.5 rounded-md font-bold text-xs transition duration-150 ${settings.imageCorner === opt.value
                            ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show/Hide Header */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-955/60 p-3.5 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Reader Header</span>
                      <span className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5">Toggle navigation bar visibility</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showHeader}
                        onChange={(e) => updateSetting('showHeader', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {/* Reset to Default Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleResetSettings}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                      </svg>
                      Reset to Default
                    </button>
                  </div>

                </div>
              </div>

              {/* Drawer Footer / Shortcut help */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
                <span className="text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest block mb-2">Keyboard Shortcuts</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <kbd className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-200 font-mono">Esc</kbd>
                    <span>Close Settings</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <kbd className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-200 font-mono">← / →</kbd>
                    <span>Turn Page</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Segmented Page Progress Bar */}
      {pages.length > 0 && (
        <div
          onMouseEnter={() => setIsBarHovered(true)}
          onMouseLeave={() => setIsBarHovered(false)}
          className="fixed bottom-0 left-0 right-0 z-30 bg-transparent py-0 px-0 h-4 select-none flex items-center"
        >
          {/* Segments container */}
          <div className={`flex items-center gap-[2px] flex-grow transition-all duration-300 ${
            isBarHovered ? 'mx-4 h-5' : 'mx-0 h-4'
          } relative`}>
            {pages.map((_, idx) => {
              const isRead = idx <= currentPageIndex;
              const isHovered = hoveredPageIdx === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredPageIdx(idx)}
                  onMouseLeave={() => setHoveredPageIdx(null)}
                  onClick={() => handlePageSegmentClick(idx)}
                  className={`flex-grow cursor-pointer transition-all duration-300 relative ${
                    isBarHovered ? 'h-2 rounded-sm' : 'h-[6px] rounded-none'
                  } ${isRead
                    ? 'bg-rose-600/60 dark:bg-rose-500/50 hover:bg-rose-500/80 dark:hover:bg-rose-400/70'
                    : 'bg-slate-400/35 dark:bg-slate-800/45 hover:bg-slate-500/55 dark:hover:bg-slate-700/65'
                  } ${isBarHovered && idx === currentPageIndex ? 'ring-1 ring-rose-500/40 dark:ring-rose-550/30' : ''}`}
                >
                  {/* Tooltip circle on hover */}
                  {isBarHovered && isHovered && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-slate-900/90 dark:bg-slate-800/95 text-white text-[10px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-slate-700/50 animate-[readerFadeIn_0.15s_ease-out_forwards]">
                      {idx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reader;
