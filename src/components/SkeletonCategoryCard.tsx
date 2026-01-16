import React from 'react';

const SkeletonCategoryCard = () => {
  return (
    <div className="nc-CardCategory4 relative w-full aspect-w-12 aspect-h-11 h-0 rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 animate-pulse">
      <div className="absolute bottom-0 right-0 max-w-[280px] opacity-80">
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="absolute inset-5 sm:inset-8 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        <div className="">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCategoryCard;

