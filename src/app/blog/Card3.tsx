import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import Badge from "@/shared/Badge/Badge";
import PostCardMeta from "@/components/PostCardMeta/PostCardMeta";
import Link from "next/link";
import { ApiBlog } from "@/hooks/useBlogs";

export interface Card3Props {
  className?: string;
  blog?: ApiBlog | null;
}

const Card3: FC<Card3Props> = ({ className = "h-full", blog }) => {
  if (!blog) {
    return (
      <div
        className={`nc-Card3 relative flex flex-col-reverse sm:flex-row sm:items-center rounded-[40px] group ${className}`}
        data-nc-id="Card3"
      >
        <div className="flex flex-col flex-grow">
          <div className="space-y-5 mb-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24"></div>
            <div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="hidden sm:block sm:mt-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32"></div>
          </div>
        </div>
        <div className="block flex-shrink-0 sm:w-56 sm:ml-6 rounded-3xl overflow-hidden mb-5 sm:mb-0 bg-slate-200 dark:bg-slate-700 animate-pulse aspect-h-9 sm:aspect-h-16 aspect-w-16"></div>
      </div>
    );
  }

  return (
    <div
      className={`nc-Card3 relative flex flex-col-reverse sm:flex-row sm:items-center rounded-[40px] group ${className}`}
      data-nc-id="Card3"
    >
      <div className="flex flex-col flex-grow">
        <div className="space-y-5 mb-4">
          {blog.category && (
            <Badge 
              name={blog.category.name}
              href={`/blog?category=${blog.category.slug}`}
            />
          )}
          <div>
            <h2
              className={`nc-card-title block font-semibold text-neutral-900 dark:text-neutral-100 text-xl`}
            >
              <Link
                href={`/blog/${blog.slug}`}
                className="line-clamp-2"
                title={blog.title}
              >
                {blog.title}
              </Link>
            </h2>
            {blog.excerpt && (
              <div className="hidden sm:block sm:mt-2">
                <span className="text-neutral-500 dark:text-neutral-400 text-base line-clamp-1">
                  {blog.excerpt}
                </span>
              </div>
            )}
          </div>
          <PostCardMeta 
            author={blog.author}
            date={blog.published_at_formatted}
          />
        </div>
      </div>

      <div
        className={`block flex-shrink-0 sm:w-56 sm:ml-6 rounded-3xl overflow-hidden mb-5 sm:mb-0`}
      >
        <Link
          href={`/blog/${blog.slug}`}
          className={`block w-full h-0 aspect-h-9 sm:aspect-h-16 aspect-w-16 `}
        >
          {blog.featured_image ? (
            <NcImage
              alt={blog.title}
              fill
              src={blog.featured_image}
              containerClassName="absolute inset-0"
              sizes="(max-width: 768px) 100vw, 30vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-slate-400 dark:text-slate-500 text-sm">No Image</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Card3;
