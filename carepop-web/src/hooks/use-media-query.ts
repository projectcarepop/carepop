'use client';

import { useState, useEffect } from 'react';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Ensure window is defined (for SSR/server-side rendering)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    const updateMatch = () => {
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
    };
    
    // Initial check
    updateMatch();

    // Listen for changes
    media.addEventListener('change', updateMatch);

    return () => {
      media.removeEventListener('change', updateMatch);
    };
  }, [query, matches]);

  return matches;
};

export default useMediaQuery; 