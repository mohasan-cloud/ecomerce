"use client";

import React from "react";
import Avatar from "@/shared/Avatar/Avatar";
import Badge from "@/shared/Badge/Badge";
import NcImage from "@/shared/NcImage/NcImage";
import SocialsList from "@/shared/SocialsList/SocialsList";
import { useBlog } from "@/hooks/useBlog";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card13 from "../Card13";

const BlogDetailPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { blog, relatedBlogs, loading, error } = useBlog(slug);

  if (loading) {
    return (
      <div className="nc-PageSingle pt-8 lg:pt-16">
        <div className="container">
          <div className="max-w-screen-md mx-auto space-y-5">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="nc-PageSingle pt-8 lg:pt-16">
        <div className="container">
          <div className="max-w-screen-md mx-auto text-center py-16">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Blog Not Found
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
              {error || "The blog post you're looking for doesn't exist."}
            </p>
            <Link
              href="/blog"
              className="inline-block px-6 py-3 bg-primary-6000 text-white rounded-lg hover:bg-primary-7000 transition-colors"
            >
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderHeader = () => {
    return (
      <header className="container rounded-xl">
        <div className="max-w-screen-md mx-auto space-y-5">
          {blog.category && (
            <Badge
              href={`/blog?category=${blog.category.slug}`}
              color="purple"
              name={blog.category.name}
            />
          )}
          <h1 className="text-neutral-900 font-semibold text-3xl md:text-4xl md:!leading-[120%] lg:text-4xl dark:text-neutral-100 max-w-4xl">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <span className="block text-base text-neutral-500 md:text-lg dark:text-neutral-400 pb-1">
              {blog.excerpt}
            </span>
          )}

          <div className="w-full border-b border-neutral-100 dark:border-neutral-800"></div>
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <div className="nc-PostMeta2 flex items-center flex-wrap text-neutral-700 text-left dark:text-neutral-200 text-sm leading-none flex-shrink-0">
              {blog.author && (
                <>
                  <Avatar
                    containerClassName="flex-shrink-0"
                    sizeClass="w-8 h-8 sm:h-11 sm:w-11"
                    imgUrl={blog.author.avatar || undefined}
                    userName={blog.author.name}
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <span className="block font-semibold">
                        {blog.author.name}
                      </span>
                    </div>
                    <div className="text-xs mt-[6px]">
                      {blog.published_at_formatted && (
                        <>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {blog.published_at_formatted}
                          </span>
                          <span className="mx-2 font-semibold">·</span>
                        </>
                      )}
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {blog.views} views
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 sm:mt-1.5 sm:ml-3">
              <SocialsList />
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderContent = () => {
    return (
      <div
        id="single-entry-content"
        className="prose prose-sm !max-w-screen-md sm:prose lg:prose-lg mx-auto dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    );
  };

  const renderAuthor = () => {
    if (!blog.author) return null;

    return (
      <div className="max-w-screen-md mx-auto">
        <div className="nc-SingleAuthor flex">
          <Avatar
            sizeClass="w-11 h-11 md:w-24 md:h-24"
            imgUrl={blog.author.avatar || undefined}
            userName={blog.author.name}
          />
          <div className="flex flex-col ml-3 max-w-lg sm:ml-5 space-y-1">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">
              WRITTEN BY
            </span>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
              {blog.author.name}
            </h2>
            {blog.author.email && (
              <span className="text-sm text-neutral-500 sm:text-base dark:text-neutral-300">
                {blog.author.email}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-PageSingle pt-8 lg:pt-16">
      {renderHeader()}
      {blog.featured_image && (
        <NcImage
          alt={blog.title}
          width={1260}
          height={750}
          className="w-full rounded-xl"
          containerClassName="container my-10 sm:my-12"
          src={blog.featured_image}
          unoptimized
        />
      )}

      <div className="nc-SingleContent container space-y-10">
        {renderContent()}
        <div className="max-w-screen-md mx-auto border-b border-t border-neutral-100 dark:border-neutral-700"></div>
        {renderAuthor()}
      </div>

      {relatedBlogs && relatedBlogs.length > 0 && (
        <div className="relative bg-neutral-100 dark:bg-neutral-800 py-16 lg:py-28 mt-16 lg:mt-24">
          <div className="container">
            <h2 className="text-3xl font-semibold mb-10">Related posts</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <div key={relatedBlog.id} className="relative aspect-w-3 aspect-h-4 rounded-3xl overflow-hidden group">
                  <Link href={`/blog/${relatedBlog.slug}`}>
                    {relatedBlog.featured_image ? (
                      <NcImage
                        alt={relatedBlog.title}
                        fill
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                        src={relatedBlog.featured_image}
                        sizes="400px"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 dark:text-slate-500">No Image</span>
                      </div>
                    )}
                    <div>
                      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black"></div>
                    </div>
                    <div className="flex flex-col justify-end items-start text-xs text-neutral-300 space-y-2.5 p-4">
                      {relatedBlog.category && (
                        <Badge name={relatedBlog.category.name} />
                      )}
                      <h2 className="block text-lg font-semibold text-white">
                        <span className="line-clamp-2">{relatedBlog.title}</span>
                      </h2>
                      <div className="flex">
                        {relatedBlog.author && (
                          <>
                            <span className="block text-neutral-200 hover:text-white font-medium truncate">
                              {relatedBlog.author.name}
                            </span>
                            {relatedBlog.published_at_formatted && (
                              <>
                                <span className="mx-1.5 font-medium">·</span>
                                <span className="font-normal truncate">
                                  {relatedBlog.published_at_formatted}
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetailPage;

