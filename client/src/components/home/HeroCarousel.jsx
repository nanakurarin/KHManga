import React, { useState, useEffect } from 'react';
import HeroSlide from './HeroSlide';
import CarouselControls from './CarouselControls';
import CarouselIndicators from './CarouselIndicators';

/**
 * Hero carousel containing slides, arrows, and indicators.
 * Pauses autoplay on hover and runs an infinite slide loop.
 */
function HeroCarousel({ mangaList = [], loading, error }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = mangaList.length;

  const handleNext = () => {
    setActiveIndex((prev) => (totalSlides > 0 ? (prev + 1) % totalSlides : 0));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (totalSlides > 0 ? (prev - 1 + totalSlides) % totalSlides : 0));
  };

  const handleGoTo = (index) => {
    if (index >= 0 && index < totalSlides) {
      setActiveIndex(index);
    }
  };

  // Manage auto-slide timer with cleanups on dependencies changes
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, totalSlides, activeIndex]);

  if (loading) {
    return (
      <div className="relative w-full h-[620px] sm:h-[520px] md:h-[400px] lg:h-[380px] rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900/90 dark:to-purple-950/20 border border-slate-200 dark:border-slate-800 p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 overflow-hidden animate-pulse select-none shadow-sm">
        {/* Left Side Metadata Info Skeleton */}
        <div className="space-y-4 max-w-xl text-left z-10 w-full md:w-3/5">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>

          <div className="space-y-2">
            <div className="h-8 sm:h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 sm:w-2/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800/70 rounded w-1/2" />
          </div>

          <div className="space-y-2 max-w-lg">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800/60 rounded w-full" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800/60 rounded w-5/6" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800/60 rounded w-4/6" />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex flex-wrap gap-3 pt-3">
            <div className="h-10 w-32 bg-slate-300 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800/70 rounded-xl" />
          </div>
        </div>

        {/* Right Side Cover Skeleton */}
        <div className="w-full md:w-56 h-48 md:h-72 rounded-xl bg-slate-200 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex-shrink-0 z-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[620px] sm:h-[520px] md:h-[400px] lg:h-[380px] bg-rose-950/10 border border-rose-905/30 rounded-2xl flex flex-col items-center justify-center text-rose-400 font-semibold p-6 text-center">
        <p className="mb-2">Failed to load recently updated RomCom titles.</p>
        <p className="text-xs text-rose-500/80">{error}</p>
      </div>
    );
  }

  if (totalSlides === 0) {
    return (
      <div className="w-full h-[620px] sm:h-[520px] md:h-[400px] lg:h-[380px] bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-center text-slate-500 font-bold select-none">
        No Recently Updated RomCom Titles Found.
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[620px] sm:h-[520px] md:h-[400px] lg:h-[380px] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {mangaList.map((manga, idx) => (
          <HeroSlide 
            key={manga.id || idx} 
            manga={manga} 
            isActive={idx === activeIndex} 
          />
        ))}
      </div>

      {/* Manual Arrow Controls (only show on hover for cleaner desktop views) */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-in-out hidden md:block">
        <CarouselControls 
          onPrev={handlePrev} 
          onNext={handleNext} 
        />
      </div>
      
      {/* Fallback arrow control display on mobile devices where hovering doesn't apply */}
      <div className="block md:hidden">
        <CarouselControls 
          onPrev={handlePrev} 
          onNext={handleNext} 
        />
      </div>

      {/* Interactive indicator dots */}
      <CarouselIndicators 
        total={totalSlides} 
        activeIndex={activeIndex} 
        onChange={handleGoTo} 
      />
    </div>
  );
}

export default HeroCarousel;
