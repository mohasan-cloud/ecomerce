"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
}

const PageContent: React.FC<{ slug: string }> = ({ slug }) => {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/pages/${slug}`);
        const data = await response.json();

        if (data.success && data.data) {
          setPage(data.data);
        } else {
          setPage(null);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-16 lg:pb-28 lg:pt-20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container py-16 lg:pb-28 lg:pt-20 text-center">
        <h2 className="text-3xl font-semibold text-red-500">Page Not Found</h2>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-16 lg:pb-28 lg:pt-20">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {page.title}
        </h1>
        {page.excerpt && (
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
            {page.excerpt}
          </p>
        )}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content || '<p>No content available.</p>' }}
        />
      </article>
    </div>
  );
};

export default PageContent;

