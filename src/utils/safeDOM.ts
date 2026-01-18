/**
 * Safe DOM manipulation utilities
 * Prevents removeChild errors by checking element existence before operations
 */

/**
 * Safely remove an element from DOM
 * Prevents removeChild errors during navigation
 */
export const safeRemoveElement = (element: Element | null | undefined): boolean => {
  if (!element) {
    return false;
  }

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  try {
    // Check if element is still in DOM
    if (!document.contains(element)) {
      return false;
    }

    // Check if element has a parent (additional safety check)
    if (!element.parentNode) {
      return false;
    }

    // Use modern remove() method first (preferred, no parent needed)
    if (typeof element.remove === 'function') {
      try {
        element.remove();
        return true;
      } catch (e) {
        // If remove() fails, fall back to removeChild
        // Continue to fallback below
      }
    }

    // Fallback to removeChild with extensive checks
    const parent = element.parentNode;
    if (parent) {
      // Triple check: parent exists, parent contains element, and removeChild exists
      if (
        parent.contains && 
        parent.contains(element) && 
        typeof parent.removeChild === 'function'
      ) {
        try {
          parent.removeChild(element);
          return true;
        } catch (e: any) {
          // Check if error is related to null parent
          if (
            e?.message?.includes('removeChild') ||
            e?.message?.includes('null') ||
            e?.name === 'TypeError'
          ) {
            // Silently ignore - element or parent was already removed
            return false;
          }
          // Re-throw if it's a different error
          throw e;
        }
      }
    }

    return false;
  } catch (error: any) {
    // Silently fail if element is already removed
    // This is expected during navigation transitions
    if (
      error?.message?.includes('removeChild') ||
      error?.message?.includes('null') ||
      error?.name === 'TypeError'
    ) {
      return false;
    }
    // Log other errors for debugging
    console.debug('Error removing element:', error);
    return false;
  }
};

/**
 * Safely append child to parent
 */
export const safeAppendChild = (
  parent: Node | null | undefined,
  child: Node | null | undefined
): boolean => {
  if (!parent || !child) {
    return false;
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    // Check if parent is in DOM
    if (parent !== document && !document.contains(parent)) {
      return false;
    }

    if (typeof parent.appendChild === 'function') {
      parent.appendChild(child);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error appending child:', error);
    return false;
  }
};

/**
 * Safely query selector with null check
 */
export const safeQuerySelector = (selector: string): Element | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    return document.querySelector(selector);
  } catch (error) {
    console.error('Error querying selector:', error);
    return null;
  }
};

/**
 * Safely query selector all with null check
 */
export const safeQuerySelectorAll = (selector: string): NodeListOf<Element> | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    return document.querySelectorAll(selector);
  } catch (error) {
    console.error('Error querying selector all:', error);
    return null;
  }
};

