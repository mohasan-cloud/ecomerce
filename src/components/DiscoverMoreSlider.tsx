"use client";

import React, { useEffect, useState, useRef } from "react";
import Heading from "./Heading/Heading";
import { useCategories } from "@/hooks/useCategories";
import Link from "next/link";
import Image from "next/image";
import { Route } from "@/routers/types";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";

interface DiscoverCategory {
  id: number;
  name: string;
  desc: string;
  featuredImage: string;
  color: string;
  slug?: string;
}

const DiscoverMoreSlider = () => {
  const { categories, loading } = useCategories();
  const [displayCategories, setDisplayCategories] = useState<DiscoverCategory[]>([]);
  const isMountedRef = useRef(true);

  // Map categories to display format
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    if (categories && categories.length > 0 && isMountedRef.current) {
      const colors = [
        'bg-gradient-to-br from-yellow-50 to-orange-50',
        'bg-gradient-to-br from-pink-50 to-rose-50',
        'bg-gradient-to-br from-blue-50 to-cyan-50',
        'bg-gradient-to-br from-green-50 to-emerald-50',
        'bg-gradient-to-br from-purple-50 to-violet-50',
        'bg-gradient-to-br from-indigo-50 to-blue-50',
        'bg-gradient-to-br from-orange-50 to-amber-50',
        'bg-gradient-to-br from-teal-50 to-cyan-50',
      ];

      const mappedCategories: DiscoverCategory[] = categories.slice(0, 6).map((cat) => ({
        id: cat.id,
        name: cat.name,
        desc: `Explore ${cat.name} collection`,
        featuredImage: cat.image || '',
        color: colors[cat.id % colors.length] || 'bg-gradient-to-br from-gray-50 to-slate-50',
        slug: cat.slug,
      }));

      if (isMountedRef.current) {
        setDisplayCategories(mappedCategories);
      }
    }
    
    // Cleanup function using useRef
    return () => {
      isMountedRef.current = false;
    };
  }, [categories]);

  if (loading) {
    return (
      <div className="nc-DiscoverMoreSlider container relative py-16 lg:py-24">
        <Heading
          className="mb-12 lg:mb-16 text-neutral-900 dark:text-neutral-50"
          desc=""
          rightDescText="Explore our featured collections"
        >
          Discover more
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
              <div className="mt-4">
                <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <div className="nc-DiscoverMoreSlider container relative py-16 lg:py-24">
      <Heading
        className="mb-12 lg:mb-16 text-neutral-900 dark:text-neutral-50"
        desc=""
        rightDescText="Explore our featured collections"
      >
        Discover more
      </Heading>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {displayCategories.map((item) => {
          const href = item.slug 
            ? `/collection?category=${item.slug}` 
            : `/collection?category_id=${item.id}`;

          return (
            <Link
              key={item.id}
              href={href as Route}
              className="group block"
            >
              <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden ${item.color} transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>
                {/* Image Container */}
                <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-8">
                  {item.featuredImage ? (
                    <div className="relative w-full h-full max-w-[200px] max-h-[200px]">
                      <Image
                        alt={item.name}
                        src={item.featuredImage}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={typeof item.featuredImage === 'string' && (item.featuredImage.startsWith('http://localhost') || item.featuredImage.startsWith('http://127.0.0.1'))}
                        onError={(e) => {
                          try {
                            const target = e.currentTarget;
                            if (target && target.parentElement) {
                              target.style.display = 'none';
                            }
                          } catch (error) {
                            // Ignore error if element is already removed
                            console.warn('Error handling image error:', error);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <h3 className="text-white text-xl lg:text-2xl font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {item.name}
                    </h3>
                    <p className="text-white/90 text-sm lg:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Category Name - Always Visible */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-neutral-900 dark:text-neutral-100 text-xl lg:text-2xl font-bold">
                    {item.name}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-12">
        <ButtonSecondary href="/collection" sizeClass="px-8 py-3">
          View All Categories
        </ButtonSecondary>
      </div>
    </div>
  );
};

export default DiscoverMoreSlider;
