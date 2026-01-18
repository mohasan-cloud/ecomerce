import { Metadata } from 'next';

export interface MetaDataResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    keywords?: string | null;
    robots?: string | null;
    canonical_url?: string | null;
    og_title?: string;
    og_description?: string;
    og_url?: string;
    og_type?: string;
    og_image?: string | null;
    twitter_card?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string | null;
    og_price_amount?: number;
    og_price_currency?: string;
    site_name?: string;
    site_url?: string;
    favicon?: string | null;
  };
}

/**
 * Fetch metadata from API
 */
export async function getMetadataFromAPI(
  type: 'default' | 'page' | 'product' | 'category' | 'subcategory' | 'brand',
  slug?: string
): Promise<MetaDataResponse['data']> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  let endpoint = '';
  switch (type) {
    case 'default':
      endpoint = `${apiUrl}/api/meta/default`;
      break;
    case 'page':
      endpoint = `${apiUrl}/api/meta/page/${slug}`;
      break;
    case 'product':
      endpoint = `${apiUrl}/api/meta/product/${slug}`;
      break;
    case 'category':
      endpoint = `${apiUrl}/api/meta/category/${slug}`;
      break;
    case 'subcategory':
      endpoint = `${apiUrl}/api/meta/subcategory/${slug}`;
      break;
    case 'brand':
      endpoint = `${apiUrl}/api/meta/brand/${slug}`;
      break;
  }

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      // If 404 or other error, return default metadata
      console.warn(`Metadata API returned ${response.status} for ${type}${slug ? `/${slug}` : ''}`);
      return {
        title: 'Page',
        description: '',
      };
    }
    
    const data: MetaDataResponse = await response.json();
    
    // Check if API returned success
    if (!data.success || !data.data) {
      console.warn(`Metadata API returned unsuccessful response for ${type}${slug ? `/${slug}` : ''}`);
      return {
        title: 'Page',
        description: '',
      };
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    // Return default metadata on error
    return {
      title: 'Page',
      description: '',
    };
  }
}

/**
 * Convert API metadata to Next.js Metadata format
 */
export async function generateMetadata(
  type: 'default' | 'page' | 'product' | 'category' | 'subcategory' | 'brand',
  slug?: string
): Promise<Metadata> {
  const meta = await getMetadataFromAPI(type, slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Ensure we have at least basic metadata
  const title = meta.title || (slug ? `${slug} - Page` : 'Page');
  const description = meta.description || '';

  // Build metadata object
  const metadata: Metadata = {
    title,
    description: description || undefined,
    keywords: meta.keywords ? meta.keywords.split(',').map(k => k.trim()).filter(k => k) : undefined,
    robots: meta.robots || undefined,
    alternates: meta.canonical_url ? {
      canonical: meta.canonical_url,
    } : undefined,
    openGraph: {
      title: meta.og_title || title,
      description: meta.og_description || description || undefined,
      url: meta.og_url || meta.site_url || siteUrl,
      siteName: meta.site_name || 'Site',
      images: meta.og_image ? [
        {
          url: meta.og_image,
          width: 1200,
          height: 630,
          alt: meta.og_title || title,
        }
      ] : [],
      type: (meta.og_type === 'product' ? 'website' : (meta.og_type || 'website')) as 'website',
      ...(meta.og_price_amount && {
        // Product specific
        price: {
          amount: meta.og_price_amount,
          currency: meta.og_price_currency || 'USD',
        },
      }),
    },
    twitter: {
      card: (meta.twitter_card as 'summary' | 'summary_large_image' | 'app' | 'player') || 'summary_large_image',
      title: meta.twitter_title || meta.og_title || title,
      description: meta.twitter_description || meta.og_description || description || undefined,
      images: meta.twitter_image ? [meta.twitter_image] : (meta.og_image ? [meta.og_image] : []),
    },
    icons: {
      icon: meta.favicon || '/favicon.ico',
    },
  };

  return metadata;
}

