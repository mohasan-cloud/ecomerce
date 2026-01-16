import PostCardMeta from "@/components/PostCardMeta/PostCardMeta";
import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import Link from "next/link";
import { ApiBlog } from "@/hooks/useBlogs";

export interface Card3SmallProps {
  className?: string;
  blog?: ApiBlog | null;
}

const Card3Small: FC<Card3SmallProps> = ({ className = "h-full", blog }) => {
  if (!blog) {
    return (
      <div
        className={`nc-Card3Small relative flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center ${className}`}
        data-nc-id="Card3Small"
      >
        <div className="relative space-y-2 flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24 mb-2"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="block sm:w-20 flex-shrink-0 relative rounded-lg overflow-hidden mb-5 sm:ml-4 sm:mb-0 bg-slate-200 dark:bg-slate-700 aspect-w-16 aspect-h-9 sm:aspect-h-16 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      className={`nc-Card3Small relative flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center ${className}`}
      data-nc-id="Card3Small"
    >
      <Link
        href={`/blog/${blog.slug}`}
        className=" absolute inset-0"
        title={blog.title}
      ></Link>
      <div className="relative space-y-2">
        <PostCardMeta 
          author={blog.author}
          date={blog.published_at_formatted}
          hiddenAvatar
        />
        <h2 className="nc-card-title block text-base font-semibold text-neutral-900 dark:text-neutral-100">
          <Link
            href={`/blog/${blog.slug}`}
            className=" line-clamp-2"
            title={blog.title}
          >
            {blog.title}
          </Link>
        </h2>
      </div>

      <Link
        href={`/blog/${blog.slug}`}
        title={blog.title}
        className={`block sm:w-20 flex-shrink-0 relative rounded-lg overflow-hidden mb-5 sm:ml-4 sm:mb-0 group`}
      >
        <div className={`w-full h-0 aspect-w-16 aspect-h-9 sm:aspect-h-16`}>
          {blog.featured_image ? (
            <NcImage
              alt={blog.title}
              fill
              sizes="100px"
              containerClassName="absolute inset-0"
              className="object-cover w-full h-full group-hover:scale-110 transform transition-transform duration-300"
              src={blog.featured_image}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-slate-400 dark:text-slate-500 text-xs">No Image</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Card3Small;
