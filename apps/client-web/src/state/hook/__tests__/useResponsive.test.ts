import { renderHook, act } from '@testing-library/react';

import { Breakpoint } from '@client-web/constant/breakpoint';

import { useResponsive } from '../useResponsive';

describe('useResponsive', () => {
  beforeEach(() => {
    // Reset window size before each test
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should initialize with correct breakpoint based on window width', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 500,
      writable: true,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe(Breakpoint.Small);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return correct values for medium breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 900,
      writable: true,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe(Breakpoint.Small);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return correct values for large breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1100,
      writable: true,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe(Breakpoint.Medium);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should return correct values for extra large breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1500,
      writable: true,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe(Breakpoint.ExtraLarge);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should update breakpoint on window resize with debounce', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useResponsive());

    // Initial state
    expect(result.current.breakpoint).toBe(Breakpoint.Medium);

    // Resize window
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 500,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
    });

    // Should not update immediately (debounced)
    expect(result.current.breakpoint).toBe(Breakpoint.Medium);

    // Fast-forward time past debounce delay
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Now should be updated
    expect(result.current.breakpoint).toBe(Breakpoint.Small);

    jest.useRealTimers();
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useResponsive());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
