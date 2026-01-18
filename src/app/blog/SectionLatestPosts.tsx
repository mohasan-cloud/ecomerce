"use client";

import React, { FC, useState, Suspense } from "react";
import Heading from "@/components/Heading/Heading";
import Pagination from "@/shared/Pagination/Pagination";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import WidgetCategories from "./WidgetCategories";
import WidgetPosts from "./WidgetPosts";
import Card3 from "./Card3";
import { useBlogs } from "@/hooks/useBlogs";
import { useSearchParams } from "next/navigation";

export interface SectionLatestPostsProps {
  className?: string;
  postCardName?: "card3";
}

const SectionLatestPostsContent: FC<SectionLatestPostsProps> = ({
  postCardName = "card3",
  className = "",
}) => {
  const searchParams = useSearchParams();
  const categorySlug = searchParams?.get('category') || undefined;
  const [page, setPage] = useState(1);

  const { blogs, loading, pagination } = useBlogs({
    categorySlug,
    perPage: 6,
    page,
    autoFetch: true,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`nc-SectionLatestPosts relative ${className}`}>
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 xl:w-2/3 xl:pr-14">
          <Heading>Latest Articles 🎈</Heading>
          {loading ? (
            <div className={`grid gap-6 md:gap-8 grid-cols-1`}>
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Card3 key={index} blog={null} className="" />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <>
              <div className={`grid gap-6 md:gap-8 grid-cols-1`}>
                {blogs.map((blog) => (
                  <Card3 key={blog.id} blog={blog} className="" />
                ))}
              </div>
              {pagination && pagination.last_page > 1 && (
                <div className="flex flex-col mt-12 md:mt-20 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination 
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-500 dark:text-neutral-400">
                No blog posts found.
              </p>
            </div>
          )}
        </div>
        <div className="w-full space-y-7 mt-24 lg:mt-0 lg:w-2/5 lg:pl-10 xl:pl-0 xl:w-1/3 ">
          <WidgetCategories />
          <WidgetPosts />
        </div>
      </div>
    </div>
  );
};

const SectionLatestPosts: FC<SectionLatestPostsProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className={`nc-SectionLatestPosts relative ${props.className || ''}`}>
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-3/5 xl:w-2/3 xl:pr-14">
              <Heading>Latest Articles 🎈</Heading>
              <div className={`grid gap-6 md:gap-8 grid-cols-1`}>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <Card3 key={index} blog={null} className="" />
                ))}
              </div>
            </div>
            <div className="w-full space-y-7 mt-24 lg:mt-0 lg:w-2/5 lg:pl-10 xl:pl-0 xl:w-1/3 ">
              <WidgetCategories />
              <WidgetPosts />
            </div>
          </div>
        </div>
      }
    >
      <SectionLatestPostsContent {...props} />
    </Suspense>
  );
};

export default SectionLatestPosts;
