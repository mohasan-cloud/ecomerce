"use client";

import useSWR from 'swr';
import { swrFetcher } from '@/lib/swrFetcher';
import { SiteData } from '@/contexts/SiteDataContext';

const defaultSiteData: SiteData = {
  settings: {
    site_name: null,
    site_tagline: null,
    site_logo: null,
    header_logo: null,
    footer_logo: null,
    white_logo: null,
    black_logo: null,
    color_logo: null,
    site_favicon: null,
    footer_text: null,
    copyright_text: null,
    social: {
      facebook: null,
      instagram: null,
      twitter: null,
      linkedin: null,
      youtube: null,
      whatsapp: null,
    },
    contact: {
      email: null,
      phone: null,
      address: null,
    },
    system: {
      currency: null,
      timezone: 'UTC',
      default_language: 'en',
    },
  },
  header_pages: [],
  footer_pages: [],
};

export const useSiteData = () => {
  const { data, error, isLoading, mutate } = useSWR<SiteData>(
    '/api/site',
    swrFetcher,
    {
      // SWR Configuration
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: true, // Revalidate when network reconnects
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
      refreshInterval: 0, // Disable auto refresh (we'll use manual refresh)
      fallbackData: defaultSiteData, // Use default data while loading
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404
        if (error.status === 404) return;
        // Don't retry more than 3 times
        if (retryCount >= 3) return;
        // Retry after 5 seconds
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  return {
    siteData: data || defaultSiteData,
    loading: isLoading,
    error: error ? (error.message || 'Error fetching site data') : null,
    refetch: mutate,
  };
};
