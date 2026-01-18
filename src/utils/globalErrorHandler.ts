/**
 * Global error handler for removeChild errors
 * Catches and suppresses removeChild errors during navigation
 */

if (typeof window !== 'undefined') {
  // Store original error handler
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error to filter removeChild errors
  console.error = (...args: any[]) => {
    const errorMessage = args[0]?.toString() || '';
    
    // Filter out removeChild errors
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('reading \'removeChild\'')
    ) {
      // Silently ignore or log as debug
      console.debug('Suppressed removeChild error during navigation:', ...args);
      return;
    }
    
    // Call original error handler for other errors
    originalError.apply(console, args);
  };

  // Override window.onerror to catch unhandled errors
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('removeChild') ||
      event.message?.includes('Cannot read properties of null') ||
      event.message?.includes('reading \'removeChild\'')
    ) {
      // Prevent error from showing in console
      event.preventDefault();
      console.debug('Suppressed removeChild error:', event.message);
      return true;
    }
  }, true);

  // Override unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    if (
      reason.includes('removeChild') ||
      reason.includes('Cannot read properties of null') ||
      reason.includes('reading \'removeChild\'')
    ) {
      event.preventDefault();
      console.debug('Suppressed removeChild promise rejection:', reason);
    }
  });
}
