import React from "react";

const SkeletonProductCard = () => {
  return (
    <div className="nc-ProductCard relative flex flex-col bg-transparent animate-pulse">
      <div className="relative flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-3xl overflow-hidden h-64"></div>
      <div className="space-y-4 px-2.5 pt-5 pb-2.5">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        <div className="flex justify-between items-end">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;

