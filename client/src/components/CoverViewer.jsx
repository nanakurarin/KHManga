import React, { useState, useEffect, useRef } from 'react';

/**
 * CoverViewer component provides a hover overlay that allows users
 * to view the full resolution cover image in a fullscreen modal.
 */
function CoverViewer({ imageUrl, title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const closeButtonRef = useRef(null);

  // Strip thumbnail suffixes (.512.jpg or .256.jpg) to get full-resolution cover image
  const fullResolutionUrl = imageUrl ? imageUrl.replace(/\.(512|256)\.jpg$/, '') : '';

  const openModal = () => {
    setIsOpen(true);
    // Let the component mount first, then trigger the animation classes
    setTimeout(() => {
      setIsAnimating(true);
    }, 10);
  };

  const closeModal = () => {
    setIsAnimating(false);
    // Wait for the transition animation to finish before unmounting the modal
    setTimeout(() => {
      setIsOpen(false);
    }, 200); // matches transition duration (duration-200)
  };

  // Prevent body scrolling when the modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape keypress to close the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle focus movement when modal opens
  useEffect(() => {
    if (isOpen) {
      // Focus close button on mount
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close modal when clicking outside the image
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Click handler that distinguishes normal left click from modifier/new-tab clicks
  const handleCoverClick = (e) => {
    // Check if the click is a middle click, right click, or if modifier keys are pressed
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      // Let the browser handle opening the link natively
      return;
    }
    // Prevent default anchor redirection for normal left clicks
    e.preventDefault();
    openModal();
  };

  return (
    <>
      <a
        href={fullResolutionUrl}
        onClick={handleCoverClick}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 block cursor-pointer group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-lg"
      >
        {/* Scale Container for the cover image children */}
        <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
          {children}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          {/* Centered Zoom Icon */}
          <svg
            className="w-8 h-8 text-white/90 drop-shadow-md"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </div>
      </a>

      {/* Fullscreen Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Full cover view for ${title}`}
          onClick={handleBackdropClick}
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={closeModal}
            aria-label="Close full cover view"
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-2 rounded-full transition duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full Resolution Image Container */}
          <div
            className={`relative transition-all duration-200 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
          >
            <img
              src={fullResolutionUrl}
              alt={title}
              className="max-w-[90vw] max-h-[90vh] object-contain w-auto h-auto rounded-md shadow-2xl border border-slate-900"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CoverViewer;
