import { useState, useEffect } from 'react';

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

export const useSiteData = () => {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/site`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setSiteData(data.data);
        } else {
          setError('Failed to fetch site data: Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching site data:', err);
        let errorMessage = 'Error fetching site data';
        
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          errorMessage = 'Unable to connect to server. Please check if the API server is running.';
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        // Set default data to prevent app crash
        setSiteData({
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
              currency: 'USD',
              timezone: 'UTC',
              default_language: 'en',
            },
          },
          header_pages: [],
          footer_pages: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, []);

  return { siteData, loading, error };
};

