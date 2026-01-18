"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useSiteData } from "@/hooks/useSiteData";

/**
 * Component to prefetch all child pages when parent (home) page loads
 * This improves navigation performance by preloading pages in the background
 */
const PagePrefetcher = () => {
  const router = useRouter();
  const { siteData } = useSiteData();

  useEffect(() => {
    // Only prefetch on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Collect all unique page URLs from header and footer
    const pagesToPrefetch = new Set<string>();

    // Add header pages
    if (siteData?.header_pages) {
      const addPages = (pages: any[]) => {
        pages.forEach((page) => {
          if (page.href && page.href !== '/' && page.href !== '#') {
            pagesToPrefetch.add(page.href);
          }
          // Recursively add child pages
          if (page.children && page.children.length > 0) {
            addPages(page.children);
          }
        });
      };
      addPages(siteData.header_pages);
    }

    // Add footer pages
    if (siteData?.footer_pages) {
      const addPages = (pages: any[]) => {
        pages.forEach((page) => {
          if (page.href && page.href !== '/' && page.href !== '#') {
            pagesToPrefetch.add(page.href);
          }
          // Recursively add child pages
          if (page.children && page.children.length > 0) {
            addPages(page.children);
          }
        });
      };
      addPages(siteData.footer_pages);
    }

    // Common pages that should be prefetched
    const commonPages = [
      '/collection',
      '/cart',
      '/checkout',
      '/search',
      '/blog',
      '/about',
      '/contact',
      '/login',
      '/signup',
    ];

    commonPages.forEach((page) => {
      pagesToPrefetch.add(page);
    });

    // Prefetch all pages with a small delay to avoid blocking initial load
    const prefetchPages = () => {
      const pagesArray = Array.from(pagesToPrefetch);
      
      // Prefetch pages in batches to avoid overwhelming the browser
      const batchSize = 3;
      let currentIndex = 0;

      const prefetchBatch = () => {
        const batch = pagesArray.slice(currentIndex, currentIndex + batchSize);
        
        batch.forEach((href) => {
          try {
            // Use Next.js router.prefetch for better performance
            router.prefetch(href as Route);
          } catch (error) {
            // Silently fail if prefetch fails (page might not exist)
            console.debug(`Failed to prefetch ${href}:`, error);
          }
        });

        currentIndex += batchSize;

        // Continue with next batch if there are more pages
        if (currentIndex < pagesArray.length) {
          setTimeout(prefetchBatch, 100); // Small delay between batches
        }
      };

      // Start prefetching after a short delay to not block initial render
      setTimeout(prefetchBatch, 500);
    };

    // Only prefetch if we have site data
    if (siteData && pagesToPrefetch.size > 0) {
      prefetchPages();
    }
  }, [router, siteData]);

  // This component doesn't render anything
  return null;
};

export default PagePrefetcher;

