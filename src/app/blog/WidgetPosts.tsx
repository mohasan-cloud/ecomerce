"use client";

import React, { FC } from "react";
import Card3Small from "./Card3Small";
import WidgetHeading1 from "./WidgetHeading1";
import { useBlogs } from "@/hooks/useBlogs";

export interface WidgetPostsProps {
  className?: string;
}

const WidgetPosts: FC<WidgetPostsProps> = ({
  className = "bg-neutral-100 dark:bg-neutral-800",
}) => {
  const { blogs, loading } = useBlogs({
    perPage: 6,
    autoFetch: true,
  });

  return (
    <div
      className={`nc-WidgetPosts rounded-3xl overflow-hidden ${className}`}
      data-nc-id="WidgetPosts"
    >
      <WidgetHeading1
        title="🎯 Popular Posts"
        viewAll={{ label: "View all", href: "/blog" }}
      />
      {loading ? (
        <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-700">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Card3Small
              key={index}
              blog={null}
              className="p-4 xl:px-5 xl:py-6 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            />
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-700">
          {blogs.slice(0, 6).map((blog) => (
            <Card3Small
              key={blog.id}
              blog={blog}
              className="p-4 xl:px-5 xl:py-6 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            />
          ))}
        </div>
      ) : (
        <div className="p-4 xl:px-5 xl:py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          No posts found
        </div>
      )}
    </div>
  );
};

export default WidgetPosts;
