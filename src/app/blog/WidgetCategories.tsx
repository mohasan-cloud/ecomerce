"use client";

import React, { FC } from "react";
import WidgetHeading1 from "./WidgetHeading1";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import Link from "next/link";

export interface WidgetCategoriesProps {
  className?: string;
}

const WidgetCategories: FC<WidgetCategoriesProps> = ({
  className = "bg-neutral-100 dark:bg-neutral-800",
}) => {
  const { categories, loading } = useBlogCategories();

  return (
    <div
      className={`nc-WidgetCategories rounded-3xl overflow-hidden ${className}`}
      data-nc-id="WidgetCategories"
    >
      <WidgetHeading1
        title="✨ Trending topic"
        viewAll={{ label: "View all", href: "/blog" }}
      />
      <div className="flow-root">
        {loading ? (
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-700">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div
                key={index}
                className="p-4 xl:p-5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-700">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className="p-4 xl:p-5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors block"
              >
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 xl:p-5 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No categories found
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetCategories;
