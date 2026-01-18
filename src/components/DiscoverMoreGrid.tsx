"use client";

import React, { useEffect, useState } from "react";
import CardCategory2 from "./CardCategories/CardCategory2";
import Heading from "./Heading/Heading";
import { useCategories } from "@/hooks/useCategories";

const DiscoverMoreGrid = () => {
  const { categories, loading } = useCategories();
  const [displayCategories, setDisplayCategories] = useState<any[]>([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      // Take first 3 categories or all if less than 3
      const cats = categories.slice(0, 3).map((cat) => ({
        name: cat.name,
        desc: `${cat.name} Collection`,
        featuredImage: cat.image || null,
        slug: `/collection?category=${cat.slug}`,
      }));
      setDisplayCategories(cats);
    }
  }, [categories]);

  if (loading) {
    return (
      <div className="nc-DiscoverMoreGrid relative">
        <Heading
          className="mb-12 text-neutral-900 dark:text-neutral-50"
          desc=""
          isCenter
          rightDescText="Good things are waiting for you"
        >
          Discover more
        </Heading>
        <div className="relative grid grid-cols-3 gap-8">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-w-1 aspect-h-1 bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
              <div className="mt-5">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mx-auto mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="nc-DiscoverMoreGrid relative">
      <Heading
        className="mb-12 text-neutral-900 dark:text-neutral-50"
        desc=""
        isCenter
        rightDescText="Good things are waiting for you"
      >
        Discover more
      </Heading>
      {displayCategories.length > 0 ? (
        <div className="relative grid grid-cols-3 gap-8">
          {displayCategories.map((item, index) => (
            <CardCategory2
              key={item.slug || index}
              name={item.name}
              desc={item.desc}
              featuredImage={item.featuredImage}
              slug={item.slug}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
          No categories available
        </div>
      )}
    </div>
  );
};

export default DiscoverMoreGrid;
