import { useState, useEffect } from 'react';

// Read breakpoint values from CSS custom properties (single source of truth in SCSS)
const getBreakpoints = () => {
  if (typeof window === 'undefined') {
    // Fallback for SSR
    return {
      small: 768,
      medium: 1024,
      large: 1200,
      extraLarge: 1400,
    } as const;
  }

  const root = getComputedStyle(document.documentElement);
  return {
    small: parseInt(root.getPropertyValue('--breakpoint-small')) || 768,
    medium: parseInt(root.getPropertyValue('--breakpoint-medium')) || 1024,
    large: parseInt(root.getPropertyValue('--breakpoint-large')) || 1200,
    extraLarge: parseInt(root.getPropertyValue('--breakpoint-extra-large')) || 1400,
  } as const;
};

type BreakpointValues = ReturnType<typeof getBreakpoints>;
type Breakpoint = BreakpointValues[keyof BreakpointValues];

const useResponsive = () => {
  const [breakpoints, setBreakpoints] = useState<BreakpointValues>(() => getBreakpoints());
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(breakpoints.small);

  useEffect(() => {
    // Initialize breakpoints on client side
    const clientBreakpoints = getBreakpoints();
    setBreakpoints(clientBreakpoints);

    const handleResize = () => {
      let newBreakpoint: Breakpoint = clientBreakpoints.small;
      if (window.innerWidth < clientBreakpoints.small) {
        newBreakpoint = clientBreakpoints.small;
      } else if (window.innerWidth < clientBreakpoints.medium) {
        newBreakpoint = clientBreakpoints.medium;
      } else if (window.innerWidth < clientBreakpoints.large) {
        newBreakpoint = clientBreakpoints.large;
      } else {
        newBreakpoint = clientBreakpoints.extraLarge;
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
    isMobile: breakpoint === breakpoints.small,
    isDesktop: breakpoint !== breakpoints.small,
  };
};

export { useResponsive };
