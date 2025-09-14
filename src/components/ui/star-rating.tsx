/**
 * Star Rating Display Components
 * Handles half-star and AM Best rating display with proper visual feedback
 */

import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { amBestToStars, getAmBestRatingText } from '@/utils/amBestRating';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  ambest_rating?: string | null;
}

/**
 * Star Rating Component that supports half stars
 */
export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 'md', 
  showText = true,
  ambest_rating 
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        // Full star
        stars.push(
          <FaStar 
            key={i} 
            className={`${sizeClasses[size]} text-yellow-400`}
          />
        );
      } else if (rating >= i - 0.5) {
        // Half star
        stars.push(
          <FaStarHalfAlt 
            key={i} 
            className={`${sizeClasses[size]} text-yellow-400`}
          />
        );
      } else {
        // Empty star
        stars.push(
          <FaRegStar 
            key={i} 
            className={`${sizeClasses[size]} text-gray-300`}
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showText && (
        <span className="text-xs text-gray-600 ml-1">
          {ambest_rating 
            ? getAmBestRatingText(ambest_rating)
            : rating > 0 
              ? `${rating}/5`
              : 'No Rating'
          }
        </span>
      )}
    </div>
  );
};

interface AmBestStarRatingProps {
  amBestRating: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * AM Best Star Rating Component - converts AM Best rating to stars
 */
export const AmBestStarRating: React.FC<AmBestStarRatingProps> = ({ 
  amBestRating, 
  size = 'md',
  showText = true 
}) => {
  const starRating = amBestToStars(amBestRating);
  
  return (
    <StarRating 
      rating={starRating}
      size={size}
      showText={showText}
      ambest_rating={amBestRating}
    />
  );
};