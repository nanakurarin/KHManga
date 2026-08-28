import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - A utility component that resets the scroll position
 * to the top of the viewport on every route transition.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window smoothly or instantly to top (instant is standard for page loads)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
