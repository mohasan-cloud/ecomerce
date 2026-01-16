import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import PostCardMeta from "@/components/PostCardMeta/PostCardMeta";
import Link from "next/link";
import { ApiBlog } from "@/hooks/useBlogs";

export interface Card13Props {
  className?: string;
  blog?: ApiBlog | null;
}

const Card13: FC<Card13Props> = ({ className = "", blog }) => {
  if (!blog) {
    return (
      <div className={`nc-Card13 relative flex ${className}`} data-nc-id="Card13">
        <div className="flex flex-col h-full py-2 flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
        </div>
        <div className="block relative h-full flex-shrink-0 w-2/5 sm:w-1/3 ml-3 sm:ml-5 bg-slate-200 dark:bg-slate-700 rounded-xl sm:rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`nc-Card13 relative flex ${className}`} data-nc-id="Card13">
      <div className="flex flex-col h-full py-2">
        <h2 className={`nc-card-title block font-semibold text-base`}>
          <Link
            href={`/blog/${blog.slug}`}
            className="line-clamp-2"
            title={blog.title}
          >
            {blog.title}
          </Link>
        </h2>
        {blog.excerpt && (
          <span className="hidden sm:block my-3 text-slate-500 dark:text-slate-400 ">
            <span className="line-clamp-2">
              {blog.excerpt}
            </span>
          </span>
        )}
        {blog.published_at_formatted && (
          <span className="mt-4 block sm:hidden text-sm text-slate-500 ">
            {blog.published_at_formatted}
          </span>
        )}
        <div className="mt-auto hidden sm:block">
          <PostCardMeta 
            author={blog.author}
            date={blog.published_at_formatted}
          />
        </div>
      </div>

      <Link
        href={`/blog/${blog.slug}`}
        className={`block relative h-full flex-shrink-0 w-2/5 sm:w-1/3 ml-3 sm:ml-5`}
      >
        {blog.featured_image ? (
          <NcImage
            alt={blog.title}
            src={blog.featured_image}
            containerClassName="absolute inset-0"
            className="object-cover w-full h-full rounded-xl sm:rounded-3xl"
            sizes="400px"
            fill
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-xl sm:rounded-3xl flex items-center justify-center">
            <span className="text-slate-400 dark:text-slate-500 text-xs">No Image</span>
          </div>
        )}
      </Link>
    </div>
  );
};

export default Card13;
