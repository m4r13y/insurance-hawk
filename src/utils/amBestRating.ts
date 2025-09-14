/**
 * AM Best Rating Utility Functions
 * Centralized conversion functions for AM Best ratings to star ratings and color coding
 */

/**
 * Convert AM Best rating to star rating based on the specified scale:
 * 5 stars: A++
 * 4.5 stars: A+, A
 * 4 stars: A-, B++, B+
 * 3.5 stars: B, B-
 * 3 stars: C++, C+
 * 2 stars: C, C-
 * 1 star: D
 */
export const amBestToStars = (amBestRating: string | null | undefined): number => {
  if (!amBestRating || 
      amBestRating.toLowerCase().trim() === 'n/a' || 
      amBestRating.toLowerCase().trim() === 'null' ||
      amBestRating.trim() === '') {
    return 0;        // No rating available
  }
  
  const rating = amBestRating.toUpperCase().trim();
  
  switch (rating) {
    case 'A++': 
      return 5;        // 5 stars: A++
    case 'A+':
    case 'A': 
      return 4.5;      // 4.5 stars: A+, A
    case 'A-':
    case 'B++':
    case 'B+': 
      return 4;        // 4 stars: A-, B++, B+
    case 'B':
    case 'B-': 
      return 3.5;      // 3.5 stars: B, B-
    case 'C++':
    case 'C+': 
      return 3;        // 3 stars: C++, C+
    case 'C':
    case 'C-': 
      return 2;        // 2 stars: C, C-
    case 'D': 
      return 1;        // 1 star: D
    case 'E':
    case 'F': 
      return 0.5;      // Below 1 star for very poor ratings
    default: 
      return 0;        // Unknown rating
  }
};

/**
 * Get color class for AM Best rating display
 */
export const getAmBestRatingColor = (rating: string | null | undefined): string => {
  if (!rating || 
      rating.toLowerCase().trim() === 'n/a' || 
      rating.toLowerCase().trim() === 'null' ||
      rating.trim() === '') {
    return 'text-gray-500';
  }
  
  switch (rating.toLowerCase()) {
    case 'a++':                    // 5 stars
      return 'text-emerald-600';
    case 'a+':
    case 'a':                      // 4.5 stars  
      return 'text-green-600';
    case 'a-':
    case 'b++':
    case 'b+':                     // 4 stars
      return 'text-green-500';
    case 'b':
    case 'b-':                     // 3.5 stars
      return 'text-yellow-600';
    case 'c++':
    case 'c+':                     // 3 stars
      return 'text-orange-600';
    case 'c':
    case 'c-':                     // 2 stars
      return 'text-orange-700';
    case 'd':                      // 1 star
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

/**
 * Get background color class for AM Best rating badges
 */
export const getAmBestRatingBgColor = (rating: string | null | undefined): string => {
  if (!rating || 
      rating.toLowerCase().trim() === 'n/a' || 
      rating.toLowerCase().trim() === 'null' ||
      rating.trim() === '') {
    return 'bg-gray-100 text-gray-600';
  }
  
  switch (rating.toLowerCase()) {
    case 'a++':                    // 5 stars
      return 'bg-emerald-100 text-emerald-800';
    case 'a+':
    case 'a':                      // 4.5 stars  
      return 'bg-green-100 text-green-800';
    case 'a-':
    case 'b++':
    case 'b+':                     // 4 stars
      return 'bg-green-50 text-green-700';
    case 'b':
    case 'b-':                     // 3.5 stars
      return 'bg-yellow-100 text-yellow-800';
    case 'c++':
    case 'c+':                     // 3 stars
      return 'bg-orange-100 text-orange-800';
    case 'c':
    case 'c-':                     // 2 stars
      return 'bg-orange-200 text-orange-900';
    case 'd':                      // 1 star
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

/**
 * Format AM Best rating display with star equivalent
 */
export const formatAmBestRatingDisplay = (rating: string | null | undefined): string => {
  if (!rating || 
      rating.toLowerCase().trim() === 'n/a' || 
      rating.toLowerCase().trim() === 'null' ||
      rating.trim() === '') {
    return 'No Rating';
  }
  
  const stars = amBestToStars(rating);
  if (stars === 0) {
    return 'No Rating';
  }
  
  return `${rating} (${stars} ${stars === 1 ? 'star' : 'stars'})`;
};

/**
 * Get just the rating text for display (handles null/N/A cases)
 */
export const getAmBestRatingText = (rating: string | null | undefined): string => {
  if (!rating || 
      rating.toLowerCase().trim() === 'n/a' || 
      rating.toLowerCase().trim() === 'null' ||
      rating.trim() === '') {
    return 'No Rating';
  }
  
  return rating;
};

/**
 * Render star display for half-star ratings
 * Returns array of star states: 'full', 'half', 'empty'
 */
export const getStarDisplay = (starRating: number): Array<'full' | 'half' | 'empty'> => {
  const stars: Array<'full' | 'half' | 'empty'> = [];
  
  for (let i = 1; i <= 5; i++) {
    if (starRating >= i) {
      stars.push('full');
    } else if (starRating >= i - 0.5) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }
  
  return stars;
};

/**
 * Check if AM Best rating is considered excellent (4+ stars)
 */
export const isExcellentRating = (rating: string | null | undefined): boolean => {
  return amBestToStars(rating) >= 4;
};

/**
 * Check if AM Best rating is considered good (3+ stars)
 */
export const isGoodRating = (rating: string | null | undefined): boolean => {
  return amBestToStars(rating) >= 3;
};