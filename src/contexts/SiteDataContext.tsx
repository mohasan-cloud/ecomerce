"use client";

import React, { createContext, ReactNode } from 'react';

export interface SitePage {
  id: number;
  title: string;
  slug: string;
  href: string;
  children?: SitePage[] | null;
}

export interface SiteSettings {
  site_name: string | null;
  site_tagline: string | null;
  site_logo: string | null;
  header_logo: string | null;
  footer_logo: string | null;
  white_logo: string | null;
  black_logo: string | null;
  color_logo: string | null;
  site_favicon: string | null;
  footer_text: string | null;
  copyright_text: string | null;
  social: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    youtube: string | null;
    whatsapp: string | null;
  };
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  system?: {
    currency: string | null;
    timezone: string | null;
    default_language: string | null;
  };
}

export interface SiteData {
  settings: SiteSettings;
  header_pages: SitePage[];
  footer_pages: SitePage[];
}

// Keep the provider for backward compatibility, but it now just wraps children
// The actual data fetching is done via SWR in useSiteData hook
export const SiteDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

