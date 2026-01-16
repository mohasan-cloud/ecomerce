import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import SocialsShare from "@/shared/SocialsShare/SocialsShare";
import PostCardMeta from "@/components/PostCardMeta/PostCardMeta";
import Link from "next/link";
import { ApiBlog } from "@/hooks/useBlogs";

export interface Card12Props {
  className?: string;
  blog?: ApiBlog | null;
}

const Card12: FC<Card12Props> = ({ className = "h-full", blog }) => {
  if (!blog) {
    return (
      <div className={`nc-Card12 group relative flex flex-col ${className}`}>
        <div className="block flex-shrink-0 flex-grow relative w-full h-0 aspect-w-4 aspect-h-3 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        <div className="mt-8 pr-10 flex flex-col space-y-3">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`nc-Card12 group relative flex flex-col ${className}`}>
      <Link
        href={`/blog/${blog.slug}`}
        className="block flex-shrink-0 flex-grow relative w-full h-0 aspect-w-4 aspect-h-3 rounded-3xl overflow-hidden"
      >
        {blog.featured_image ? (
          <NcImage
            src={blog.featured_image}
            containerClassName="absolute inset-0"
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-slate-400 dark:text-slate-500">No Image</span>
          </div>
        )}
      </Link>

      <SocialsShare className="absolute hidden md:grid gap-[5px] right-4 top-4 opacity-0 z-[-1] group-hover:z-10 group-hover:opacity-100 transition-all duration-300" />

      <div className=" mt-8 pr-10 flex flex-col">
        <h2
          className={`nc-card-title block font-semibold text-neutral-900 dark:text-neutral-100 transition-colors text-lg sm:text-2xl`}
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
          <span className="hidden sm:block mt-4 text-neutral-500 dark:text-neutral-400">
            <span className="line-clamp-2">
              {blog.excerpt}
            </span>
          </span>
        )}
        <PostCardMeta 
          className="mt-5" 
          author={blog.author}
          date={blog.published_at_formatted}
        />
      </div>
    </div>
  );
};

export default Card12;
