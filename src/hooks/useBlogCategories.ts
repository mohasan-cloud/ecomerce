import { useState, useEffect } from 'react';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface UseBlogCategoriesResult {
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBlogCategories = (): UseBlogCategoriesResult => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/blog-categories`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog categories: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setCategories(data.data.categories || []);
      } else {
        setError(data.message || 'Failed to fetch blog categories');
      }
    } catch (err: any) {
      console.error('Error fetching blog categories:', err);
      setError(err.message || 'Error fetching blog categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

