import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToAnchor handles automatic smooth scrolling to anchor targets
 * (e.g. #featured-cruises, #destinations, #experience, #about)
 * across both direct link clicks and page route transitions.
 */
const ScrollToAnchor = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }
  }, [location]);

  return null;
};

export default ScrollToAnchor;
