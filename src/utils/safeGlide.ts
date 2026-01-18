/**
 * Safe Glide slider destroy utility
 * Prevents removeChild errors when destroying Glide sliders
 */

/**
 * Safely destroy a Glide slider instance
 */
export const safeDestroyGlide = (slider: any): void => {
  if (!slider) {
    return;
  }

  if (typeof document === 'undefined') {
    return;
  }

  try {
    // Check if slider has destroy method
    if (typeof slider.destroy === 'function') {
      // Wrap destroy in try-catch to handle internal removeChild errors
      try {
        slider.destroy();
      } catch (error: any) {
        // Check if error is related to removeChild
        if (error?.message?.includes('removeChild') || error?.message?.includes('null')) {
          console.debug('Glide destroy encountered removeChild error (safe to ignore):', error);
        } else {
          // Re-throw if it's a different error
          throw error;
        }
      }
    }
  } catch (error) {
    console.debug('Error destroying Glide slider:', error);
  }
};

