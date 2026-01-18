/**
 * Navigation helper utilities
 * Ensures safe navigation between parent and child pages
 * Prevents removeChild errors during navigation
 */

/**
 * Safely navigate to a route with proper cleanup delay
 */
export const safeNavigate = (
  router: any,
  path: string,
  delay: number = 150
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Add delay to let cleanup functions complete
  setTimeout(() => {
    try {
      router.push(path);
      router.refresh();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, delay);
};

/**
 * Check if we're navigating away from current page
 */
export const isNavigatingAway = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if page is unloading
  return document.visibilityState === 'hidden' || 
         (window as any).__isNavigating === true;
};

/**
 * Mark navigation as in progress
 */
export const setNavigating = (isNavigating: boolean): void => {
  if (typeof window !== 'undefined') {
    (window as any).__isNavigating = isNavigating;
  }
};
