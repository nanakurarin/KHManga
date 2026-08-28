import React from 'react';

/**
 * Previous and Next chevron buttons overlaying the carousel slide boundaries.
 */
function CarouselControls({ onPrev, onNext }) {
  return (
    <>
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center text-slate-800 dark:text-white opacity-70 hover:opacity-100 transition duration-200 ease-in-out hover:scale-110 pointer-events-auto focus:outline-none"
        aria-label="Previous slide"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center text-slate-800 dark:text-white opacity-70 hover:opacity-100 transition duration-200 ease-in-out hover:scale-110 pointer-events-auto focus:outline-none"
        aria-label="Next slide"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  );
}

export default CarouselControls;
