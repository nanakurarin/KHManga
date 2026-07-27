import React from 'react';

/**
 * Clickable dot indicators displaying the active slide and total slides count.
 */
function CarouselIndicators({ total, activeIndex, onChange }) {
  if (total <= 1) return null;

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2">
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className={`h-2 transition-all duration-300 ${
              isActive 
                ? 'bg-rose-600 w-6 rounded-full' 
                : 'bg-slate-600 hover:bg-slate-400 w-2 rounded-full'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        );
      })}
    </div>
  );
}

export default CarouselIndicators;
