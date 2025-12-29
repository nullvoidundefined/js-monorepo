import { useState, useEffect } from 'react';
import { Breakpoint } from '@client-web/constant/breakpoint';

function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(Breakpoint.Small);

  useEffect(() => {
    const handleResize = () => {
      let newBreakpoint: Breakpoint = Breakpoint.Small;
      if (window.innerWidth < Breakpoint.Small) {
        newBreakpoint = Breakpoint.Small;
      } else if (window.innerWidth < Breakpoint.Medium) {
        newBreakpoint = Breakpoint.Medium;
      } else if (window.innerWidth < Breakpoint.Large) {
        newBreakpoint = Breakpoint.Large;
      } else {
        newBreakpoint = Breakpoint.ExtraLarge;
      }
      setBreakpoint(newBreakpoint);
    };

    // Set initial breakpoint
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return {
    breakpoint,
    isDesktop: breakpoint !== Breakpoint.Small,
    isMobile: breakpoint === Breakpoint.Small,
  };
}

export { useResponsive };
