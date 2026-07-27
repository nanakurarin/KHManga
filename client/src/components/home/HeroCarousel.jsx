import React, { useState, useEffect } from 'react';
import HeroSlide from './HeroSlide';
import CarouselControls from './CarouselControls';
import CarouselIndicators from './CarouselIndicators';

/**
 * Hero carousel containing slides, arrows, and indicators.
 * Pauses autoplay on hover and runs an infinite slide loop.
 */
function HeroCarousel({ mangaList = [] }) {
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

  if (totalSlides === 0) {
    // Return empty placeholder container of identical height to keep layouts stable
    return (
      <div className="w-full h-[620px] sm:h-[520px] md:h-[400px] lg:h-[380px] bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-center animate-pulse text-slate-600 font-bold select-none">
        Loading Featured Manga...
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
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
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
