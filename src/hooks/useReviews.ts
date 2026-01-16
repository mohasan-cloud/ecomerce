import { useState, useEffect } from 'react';

export interface ReviewProduct {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
}

export interface ApiReview {
  id: number;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  product: ReviewProduct | null;
}

export interface UseReviewsOptions {
  limit?: number;
  autoFetch?: boolean;
}

export interface UseReviewsResult {
  reviews: ApiReview[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReviews = (options: UseReviewsOptions = {}): UseReviewsResult => {
  const {
    limit = 10,
    autoFetch = true,
  } = options;

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      const response = await fetch(`${apiUrl}/api/reviews?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setReviews(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchReviews();
    }
  }, [limit, autoFetch]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
};

