"use client";

import React, { FC } from "react";
import Card12 from "./Card12";
import Card13 from "./Card13";
import { useBlogs } from "@/hooks/useBlogs";

export interface SectionMagazine5Props {}

const SectionMagazine5: FC<SectionMagazine5Props> = () => {
  const { blogs, loading } = useBlogs({
    isFeatured: true,
    perPage: 4,
    autoFetch: true,
  });

  if (loading) {
    return (
      <div className="nc-SectionMagazine5">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          <Card12 blog={null} />
          <div className="grid gap-6 md:gap-8">
            {[1, 2, 3].map((item) => (
              <Card13 key={item} blog={null} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return null;
  }

  const featuredBlog = blogs[0] || null;
  const otherBlogs = blogs.slice(1, 4);

  return (
    <div className="nc-SectionMagazine5">
      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <Card12 blog={featuredBlog} />
        <div className="grid gap-6 md:gap-8">
          {otherBlogs.map((blog) => (
            <Card13 key={blog.id} blog={blog} />
          ))}
          {/* Fill remaining slots if less than 3 blogs */}
          {otherBlogs.length < 3 &&
            Array.from({ length: 3 - otherBlogs.length }).map((_, index) => (
              <Card13 key={`empty-${index}`} blog={null} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SectionMagazine5;
