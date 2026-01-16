import React from "react";

const SkeletonCard = () => {
  return (
    <div className="nc-CardCategory3 block animate-pulse">
      <div className="relative w-full aspect-w-16 aspect-h-11 sm:aspect-h-9 h-0 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700">
        <div className="absolute inset-5 sm:inset-8 flex flex-col">
          <div className="max-w-xs space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
          </div>
          <div className="mt-auto">
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

