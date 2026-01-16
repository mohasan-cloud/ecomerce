import { useState, useEffect } from 'react';

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  finalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  image: string;
  galleryImages: string[];
  rating: number;
  numberOfReviews: number;
  status: string | null;
  stockQuantity: number | null;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  subCategory: {
    id: number;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: number;
    name: string;
  } | null;
  colors?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  sizes?: Array<{
    id: number;
    name: string | null;
    description?: string | null;
    measurements?: string | null;
  }>;
  attributes?: Array<{
    id: number;
    name: string;
    input_type: string;
    is_required: boolean;
    show_in_quick_view?: boolean;
    values: Array<{
      id: number;
      value: string;
      backend_value?: string | null;
      price?: number | null;
    }>;
  }>;
  hasOffer: boolean;
  offer: {
    id: number;
    name: string;
    discountType: string;
    discountValue: number;
    discountPercentage: number;
    startDate: string | null;
    endDate: string | null;
  } | null;
}

interface UseProductsOptions {
  limit?: number;
  page?: number;
  categoryId?: number;
  subCategoryId?: number;
  brandIds?: number[];
  colorIds?: number[];
  genderId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  featured?: boolean;
  hasOffers?: boolean;
  autoFetch?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { 
    limit = 12, 
    page = 1,
    categoryId, 
    subCategoryId,
    brandIds,
    colorIds,
    genderId,
    minPrice,
    maxPrice,
    search,
    sortBy,
    featured = false, 
    hasOffers = false, 
    autoFetch = true 
  } = options;
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      if (limit) params.append('limit', limit.toString());
      if (page) params.append('page', page.toString());
      if (categoryId) params.append('category_id', categoryId.toString());
      if (subCategoryId) params.append('sub_category_id', subCategoryId.toString());
      if (brandIds && brandIds.length > 0) {
        brandIds.forEach(id => params.append('brand_ids[]', id.toString()));
      }
      if (colorIds && colorIds.length > 0) {
        colorIds.forEach(id => params.append('color_ids[]', id.toString()));
      }
      if (genderId) params.append('gender_id', genderId.toString());
      if (minPrice !== undefined) params.append('min_price', minPrice.toString());
      if (maxPrice !== undefined) params.append('max_price', maxPrice.toString());
      if (search) params.append('search', search);
      if (sortBy) params.append('sort_by', sortBy);
      if (featured) params.append('featured', '1');
      if (hasOffers) params.append('has_offers', '1');
      
      const response = await fetch(`${apiUrl}/api/products?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setProducts(data.data);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [limit, page, categoryId, subCategoryId, brandIds, colorIds, genderId, minPrice, maxPrice, search, sortBy, featured, hasOffers, autoFetch]);

  return {
    products,
    loading,
    error,
    totalPages,
    total,
    refetch: fetchProducts,
  };
};

