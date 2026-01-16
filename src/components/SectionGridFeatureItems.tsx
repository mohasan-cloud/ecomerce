"use client";

import React, { FC, useState } from "react";
import HeaderFilterSection from "@/components/HeaderFilterSection";
import type { FilterState } from "@/components/TabFiltersAPI";
import ProductCard from "@/components/ProductCard";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useProducts } from "@/hooks/useProducts";
import SkeletonProductCard from "./SkeletonProductCard";

export interface SectionGridFeatureItemsProps {
  limit?: number;
  categoryId?: number;
  featured?: boolean;
  showMoreButton?: boolean;
}

const SectionGridFeatureItems: FC<SectionGridFeatureItemsProps> = ({
  limit = 8,
  categoryId,
  featured = false,
  showMoreButton = false,
}) => {
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    categoryIds: [],
    subCategoryIds: [],
    brandIds: [],
    attributeIds: {},
    minPrice: 0,
    maxPrice: 1000,
    onSale: false,
    sortBy: "latest",
  });

  // Build API parameters from filters
  const apiParams: any = {
    limit,
    categoryId: filters.categoryIds.length > 0 ? filters.categoryIds[0] : categoryId,
    subCategoryId: filters.subCategoryIds.length > 0 ? filters.subCategoryIds[0] : undefined,
    genderId: selectedGenderId || undefined,
    search: searchQuery || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    hasOffers: filters.onSale,
    sortBy: filters.sortBy,
  };

  // Add brand filters
  if (filters.brandIds.length > 0) {
    apiParams.brandIds = filters.brandIds;
  }

  const { products, loading } = useProducts(apiParams);
  
  // Note: Attribute filters will be handled via direct API call if needed
  // For now, we'll use the basic filters that useProducts supports

  return (
    <div className="nc-SectionGridFeatureItems relative">
      <HeaderFilterSection 
        onGenderChange={setSelectedGenderId}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilters}
        selectedGenderId={selectedGenderId}
        searchQuery={searchQuery}
      />
      <div
        className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 `}
      >
        {loading ? (
          Array.from({ length: limit }).map((_, index) => (
            <SkeletonProductCard key={index} />
          ))
        ) : products.length > 0 ? (
          products.map((item) => (
            <ProductCard data={item} key={item.id} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              No products found. Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>
      {showMoreButton && (
        <div className="flex mt-16 justify-center items-center">
          <ButtonPrimary loading>Show me more</ButtonPrimary>
        </div>
      )}
    </div>
  );
};

export default SectionGridFeatureItems;
