"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import Heading from "@/components/Heading/Heading";
import NavItem2 from "@/components/NavItem2";
import Nav from "@/shared/Nav/Nav";
import ProductCard from "@/components/ProductCard";
import SkeletonProductCard from "@/components/SkeletonProductCard";
import { useProducts } from "@/hooks/useProducts";

interface Gender {
  id: number;
  name: string;
}

export interface SectionGridMoreExploreProps {
  className?: string;
  gridClassName?: string;
  limit?: number;
}

const SectionGridMoreExplore: FC<SectionGridMoreExploreProps> = ({
  className = "",
  gridClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  limit = 8,
}) => {
  const [genders, setGenders] = useState<Gender[]>([]);
  const [loadingGenders, setLoadingGenders] = useState(true);
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);
  const isMountedRef = useRef(true);

  // Fetch genders from API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    const fetchGenders = async () => {
      try {
        if (isMountedRef.current) {
          setLoadingGenders(true);
        }
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/genders`);
        const data = await response.json();

        if (!isMountedRef.current) return;

        if (data.success && data.data) {
          if (isMountedRef.current) {
            setGenders(data.data);
            // Set first gender as active if available
            if (data.data.length > 0 && selectedGenderId === null) {
              setSelectedGenderId(data.data[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching genders:', error);
      } finally {
        if (isMountedRef.current) {
          setLoadingGenders(false);
        }
      }
    };

    fetchGenders();
    
    // Cleanup function using useRef
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch products based on selected gender
  const { products, loading: loadingProducts } = useProducts({
    limit,
    genderId: selectedGenderId || undefined,
    autoFetch: true,
  });

  const renderHeading = () => {
    return (
      <div>
        <Heading
          className="mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50"
          fontClass="text-3xl md:text-4xl 2xl:text-5xl font-semibold"
          isCenter
          desc=""
        >
          Start exploring.
        </Heading>
        {loadingGenders ? (
          <div className="mb-12 lg:mb-14 flex justify-center">
            <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        ) : genders.length > 0 ? (
        <Nav
          className="p-1 bg-white dark:bg-neutral-800 rounded-full shadow-lg overflow-x-auto hiddenScrollbar"
          containerClassName="mb-12 lg:mb-14 relative flex justify-center w-full text-sm md:text-base"
        >
            {genders.map((gender) => (
            <NavItem2
                key={gender.id}
                isActive={selectedGenderId === gender.id}
                onClick={() => setSelectedGenderId(gender.id)}
              >
                <div className="flex items-center justify-center space-x-1.5 sm:space-x-2.5 text-xs sm:text-sm">
                  <span>{gender.name}</span>
              </div>
            </NavItem2>
          ))}
        </Nav>
        ) : null}
      </div>
    );
  };

  return (
    <div className={`nc-SectionGridMoreExplore relative ${className}`}>
      {renderHeading()}
      {loadingProducts || loadingGenders ? (
        <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
          {Array.from({ length: limit }).map((_, index) => (
            <SkeletonProductCard key={index} />
          ))}
        </div>
      ) : products.length > 0 ? (
      <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
          {products.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No products available for this gender.
      </div>
      )}
    </div>
  );
};

export default SectionGridMoreExplore;
