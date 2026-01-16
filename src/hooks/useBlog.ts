import { useState, useEffect } from 'react';
import { ApiBlog, BlogCategory, BlogAuthor } from './useBlogs';

export interface BlogDetail extends ApiBlog {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export interface RelatedBlog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string | null;
  published_at_formatted: string | null;
  category: BlogCategory | null;
  author: BlogAuthor | null;
}

export interface UseBlogResult {
  blog: BlogDetail | null;
  relatedBlogs: RelatedBlog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBlog = (slug: string): UseBlogResult => {
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/blogs/${slug}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog not found');
        } else {
          throw new Error(`Failed to fetch blog: ${response.status}`);
        }
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setBlog(data.data.blog || null);
        setRelatedBlogs(data.data.related_blogs || []);
      } else {
        setError(data.message || 'Failed to fetch blog');
      }
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      setError(err.message || 'Error fetching blog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  return {
    blog,
    relatedBlogs,
    loading,
    error,
    refetch: fetchBlog,
  };
};

