"use client";

import { useEffect, useRef } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { safeRemoveElement } from "@/utils/safeDOM";

const FaviconUpdater = () => {
  const { siteData, loading } = useSiteData();
  const linkRef = useRef<HTMLLinkElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Only run on client side
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    isMountedRef.current = true;

    if (!loading && siteData?.settings?.site_favicon && isMountedRef.current) {
      // Remove existing favicon links using safe DOM utility
      const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      existingLinks.forEach(link => {
        safeRemoveElement(link);
      });

      // Create new favicon link
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = siteData.settings.site_favicon;
      
      // Store reference in useRef
      linkRef.current = link;
      
      if (document.head && isMountedRef.current) {
        try {
          document.head.appendChild(link);
        } catch (e) {
          console.error('Error appending favicon:', e);
          return;
        }
      }
    }

    // Cleanup function - use useRef for safe cleanup
    return () => {
      isMountedRef.current = false;
      
      if (typeof document === 'undefined' || typeof window === 'undefined') {
        return;
      }
      
      // Use ref to safely remove the link
      if (linkRef.current) {
        try {
          // Try to find the link in the DOM by href
          const linkInDom = document.querySelector(`link[href="${linkRef.current.href}"]`);
          if (linkInDom) {
            safeRemoveElement(linkInDom);
          }
          
          // Also try to remove the original link reference
          safeRemoveElement(linkRef.current);
        } catch (e) {
          // Silently ignore - element might already be removed during navigation
        } finally {
          linkRef.current = null;
        }
      }
    };
  }, [siteData, loading]);

  return null;
};

export default FaviconUpdater;

