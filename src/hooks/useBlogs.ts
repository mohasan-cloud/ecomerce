import { useState, useEffect } from 'react';

export interface BlogAuthor {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface ApiBlog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string | null;
  status: string;
  is_featured: boolean;
  views: number;
  published_at: string | null;
  published_at_formatted: string | null;
  category: BlogCategory | null;
  author: BlogAuthor | null;
}

export interface UseBlogsOptions {
  categoryId?: number;
  categorySlug?: string;
  isFeatured?: boolean;
  search?: string;
  perPage?: number;
  page?: number;
  autoFetch?: boolean;
}

export interface UseBlogsResult {
  blogs: ApiBlog[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  refetch: () => void;
}

export const useBlogs = (options: UseBlogsOptions = {}): UseBlogsResult => {
  const {
    categoryId,
    categorySlug,
    isFeatured,
    search,
    perPage = 12,
    page = 1,
    autoFetch = true,
  } = options;

  const [blogs, setBlogs] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseBlogsResult['pagination']>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      if (categoryId) params.append('category_id', categoryId.toString());
      if (categorySlug) params.append('category_slug', categorySlug);
      if (isFeatured) params.append('is_featured', '1');
      if (search) params.append('search', search);
      params.append('per_page', perPage.toString());
      params.append('page', page.toString());

      const response = await fetch(`${apiUrl}/api/blogs?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setBlogs(data.data.blogs || []);
        setPagination(data.data.pagination || null);
      } else {
        setError(data.message || 'Failed to fetch blogs');
      }
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchBlogs();
    }
  }, [categoryId, categorySlug, isFeatured, search, perPage, page, autoFetch]);

  return {
    blogs,
    loading,
    error,
    pagination,
    refetch: fetchBlogs,
  };
};

