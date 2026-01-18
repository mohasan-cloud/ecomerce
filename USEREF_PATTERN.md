# useRef Pattern for React Components

## Pattern: "use client" + useRef Approach

Yeh pattern sabse safe, React-friendly aur future-proof hai.

## Key Principles:

1. **Always use `"use client"` directive** for components with client-side logic
2. **Use `useRef` for:**
   - DOM element references
   - Timeout/Interval IDs
   - Event handler references
   - Component mounted state
   - Slider instances
   - Any cleanup resources

## Standard Pattern:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";

const MyComponent = () => {
  // State
  const [data, setData] = useState(null);
  
  // Refs for cleanup and tracking
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const handlerRef = useRef<(() => void) | null>(null);
  const instanceRef = useRef<SomeInstance | null>(null);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Only proceed if mounted
    if (typeof window === 'undefined') return;
    
    // Your logic here
    if (isMountedRef.current) {
      // Safe state updates
      setData(someData);
    }
    
    // Store handlers in refs
    const handler = () => {
      if (!isMountedRef.current) return;
      // Handler logic
    };
    handlerRef.current = handler;
    
    // Store timeouts/intervals in refs
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        // Timeout logic
      }
    }, 1000);
    
    // Cleanup function
    return () => {
      // Mark as unmounted
      isMountedRef.current = false;
      
      // Clean up timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clean up intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Clean up event listeners
      if (handlerRef.current && typeof window !== 'undefined') {
        window.removeEventListener('event', handlerRef.current);
        handlerRef.current = null;
      }
      
      // Clean up instances
      if (instanceRef.current) {
        try {
          instanceRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        } finally {
          instanceRef.current = null;
        }
      }
    };
  }, [dependencies]);

  return <div ref={elementRef}>Content</div>;
};
```

## Benefits:

1. **No Memory Leaks**: All resources properly cleaned up
2. **No State Updates After Unmount**: `isMountedRef` prevents updates
3. **Safe Cleanup**: Refs ensure cleanup functions have access to latest values
4. **Future-Proof**: Works with React 18+ concurrent features
5. **Type-Safe**: TypeScript support for refs

## Examples Updated:

✅ FaviconUpdater - uses `linkRef` and `isMountedRef`
✅ NotificationPermission - uses `messagingRef`, `authChangeHandlerRef`, `isMountedRef`
✅ SectionHero2 - uses `timeOutRef`, `isMountedRef`, `prevDataRef`
✅ SectionSliderProductCard - uses `intervalRef`, `sliderInstanceRef`, `isMountedRef`
✅ SectionClientSay - uses `sliderInstanceRef`, `isMountedRef`
✅ MainNav2 - uses `clickOutsideHandlerRef`, `isMountedRef`
