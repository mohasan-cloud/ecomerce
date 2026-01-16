import { useState, useEffect } from 'react';

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  categoryId: number;
  categoryName: string | null;
  productCount: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  subCategories: SubCategory[];
  subCategoriesCount: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('🔍 Fetching categories from:', `${apiUrl}/api/categories`);
      const response = await fetch(`${apiUrl}/api/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check if API is running.');
      }
      
      const data = await response.json();
      console.log('✅ Categories received:', data);
      
      if (data.success && data.data) {
        setCategories(data.data);
        console.log('📦 Categories set:', data.data.length, 'categories');
      } else {
        setError('Failed to fetch categories');
        console.error('❌ API response error:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching categories:', err);
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

