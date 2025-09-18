"use client";
import React from 'react';

interface CMSStarRatingProps {
  rating?: number | string | null;
  size?: 'sm' | 'md';
  showText?: boolean;
}

// Simple visual star rating for CMS PDP plans (0-5). Non-numeric values show as NR.
export const CMSStarRating: React.FC<CMSStarRatingProps> = ({ rating, size='sm', showText=true }) => {
  const numeric = typeof rating === 'number' ? rating : (typeof rating === 'string' ? parseFloat(rating) : NaN);
  const valid = !isNaN(numeric) && numeric >= 0 && numeric <= 5;
  const stars = valid ? Math.round(numeric * 10) / 10 : null;
  const starCount = 5;
  return (
    <div className="flex items-center gap-1" aria-label={valid ? `${stars} out of 5 stars` : 'Not rated'}>
      <div className="flex">
        {Array.from({length: starCount}).map((_,i)=>{
          const filled = valid && numeric >= i + 0.5; // half threshold simple
          return <span key={i} className={`inline-block ${size==='sm'?'text-[13px]':'text-base'} leading-none ${filled ? 'text-yellow-400' : 'text-slate-500/40'}`}>★</span>;
        })}
      </div>
      {showText && (
        <span className="text-[11px] font-medium tracking-wide text-slate-400">
          {valid ? `${stars}` : 'NR'}
        </span>
      )}
    </div>
  );
};

export default CMSStarRating;
