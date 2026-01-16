"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "@/shared/Pagination/Pagination";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ProductCard from "@/components/ProductCard";
import SidebarFiltersAPI, { FilterState } from "@/components/SidebarFiltersAPI";
import { ApiProduct } from "@/hooks/useProducts";
import SkeletonProductCard from "@/components/SkeletonProductCard";

const PageCollectionContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const isInitializing = useRef(true);
  const prevFiltersRef = useRef<FilterState | null>(null);

  // Read URL parameters and set filters/search
  useEffect(() => {
    isInitializing.current = true;
    const categoryId = searchParams.get('category_id');
    const subCategoryId = searchParams.get('sub_category_id');
    const brandIdsParam = searchParams.get('brand_ids[]') || searchParams.getAll('brand_ids[]');
    const genderId = searchParams.get('gender_id');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sortBy = searchParams.get('sort_by');

    // Parse attribute filters from URL (format: attribute_ids[attributeId][]=valueId)
    const attributeIds: Record<number, number[]> = {};
    const allParams = searchParams.toString();
    const attributeMatches = allParams.match(/attribute_ids\[(\d+)\]\[\]=(\d+)/g);
    if (attributeMatches) {
      attributeMatches.forEach(match => {
        const attrMatch = match.match(/attribute_ids\[(\d+)\]\[\]=(\d+)/);
        if (attrMatch) {
          const attrId = parseInt(attrMatch[1]);
          const valueId = parseInt(attrMatch[2]);
          if (!attributeIds[attrId]) {
            attributeIds[attrId] = [];
          }
          attributeIds[attrId].push(valueId);
        }
      });
    }

    // Update filters from URL
    const newFilters: FilterState = {
      categoryIds: categoryId ? [parseInt(categoryId)] : [],
      subCategoryIds: subCategoryId ? [parseInt(subCategoryId)] : [],
      brandIds: Array.isArray(brandIdsParam) 
        ? brandIdsParam.map(id => parseInt(id))
        : brandIdsParam ? [parseInt(brandIdsParam)] : [],
      attributeIds: attributeIds,
      minPrice: minPrice ? parseInt(minPrice) : 0,
      maxPrice: maxPrice ? parseInt(maxPrice) : 1000,
      onSale: searchParams.get('has_offers') === '1',
      sortBy: sortBy || 'latest',
    };

    setFilters(newFilters);
    if (search) {
      setSearchQuery(search);
    }
    
    // Mark initialization as complete after a short delay
    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
  }, [searchParams]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Build query params
        const params = new URLSearchParams();
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        params.append('sort_by', filters.sortBy);
        
        if (filters.categoryIds.length > 0) {
          params.append('category_id', filters.categoryIds[0].toString());
        }
        
        if (filters.subCategoryIds.length > 0) {
          params.append('sub_category_id', filters.subCategoryIds[0].toString());
        }
        
        if (filters.brandIds.length > 0) {
          filters.brandIds.forEach(id => params.append('brand_ids[]', id.toString()));
        }
        
        // Add attribute filters
        if (filters.attributeIds && Object.keys(filters.attributeIds).length > 0) {
          Object.entries(filters.attributeIds).forEach(([attrId, valueIds]) => {
            if (valueIds && valueIds.length > 0) {
              valueIds.forEach(valueId => {
                params.append(`attribute_ids[${attrId}][]`, valueId.toString());
              });
            }
          });
        }
        
        const genderId = searchParams.get('gender_id');
        if (genderId) {
          params.append('gender_id', genderId);
        }
        
        params.append('min_price', filters.minPrice.toString());
        params.append('max_price', filters.maxPrice.toString());
        
        if (filters.onSale) {
          params.append('has_offers', '1');
        }
        
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }
        
        const response = await fetch(`${apiUrl}/api/products?${params.toString()}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setProducts(data.data);
          setPagination({
            ...pagination,
            total: data.total,
            totalPages: data.totalPages,
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, pagination.page, searchQuery]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    // Skip URL update during initialization
    if (isInitializing.current) {
      setFilters(newFilters);
      setPagination(prev => ({ ...prev, page: 1 }));
      prevFiltersRef.current = newFilters;
      return;
    }
    
    // Check if filters actually changed to avoid unnecessary updates
    const filtersChanged = !prevFiltersRef.current || 
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(newFilters);
    
    if (!filtersChanged) {
      return;
    }
    
    prevFiltersRef.current = newFilters;
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    
    // Update URL with new filters (only if not initializing)
    const params = new URLSearchParams();
    if (newFilters.categoryIds.length > 0) {
      params.append('category_id', newFilters.categoryIds[0].toString());
    }
    if (newFilters.subCategoryIds.length > 0) {
      params.append('sub_category_id', newFilters.subCategoryIds[0].toString());
    }
    if (newFilters.brandIds.length > 0) {
      newFilters.brandIds.forEach(id => params.append('brand_ids[]', id.toString()));
    }
    // Add attribute filters
    if (newFilters.attributeIds && Object.keys(newFilters.attributeIds).length > 0) {
      Object.entries(newFilters.attributeIds).forEach(([attrId, valueIds]) => {
        if (valueIds && valueIds.length > 0) {
          valueIds.forEach(valueId => {
            params.append(`attribute_ids[${attrId}][]`, valueId.toString());
          });
        }
      });
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    if (newFilters.onSale) {
      params.append('has_offers', '1');
    }
    if (newFilters.sortBy !== 'latest') {
      params.append('sort_by', newFilters.sortBy);
    }
    
    router.replace(`/collection?${params.toString()}`, { scroll: false });
  }, [searchQuery, router]);

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`nc-PageCollection`}>
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {/* HEADING */}
          <div className="max-w-screen-sm">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Products Collection
            </h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              Discover our curated collection of premium products. Use filters to find exactly what you're looking for.
            </span>
            
            {/* SEARCH INPUT */}
            <div className="mt-6 flex justify-center">
              <div className="relative w-full max-w-lg">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-full text-sm font-normal h-11 pl-11 pr-11 py-3"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />
          
          <main>
            {/* LOOP ITEMS */}
            <div className="flex flex-col lg:flex-row">
              {/* SIDEBAR FILTERS */}
              <div className="lg:w-1/3 xl:w-1/4 pr-4">
                <SidebarFiltersAPI 
                  onFilterChange={handleFilterChange} 
                  initialFilters={filters}
                />
              </div>
              
              <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 border-t lg:border-t-0"></div>
              
              {/* PRODUCTS GRID */}
              <div className="flex-1">
                {/* Results count */}
                {!loading && (
                  <div className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                    Showing {products.length} of {pagination.total} products
                  </div>
                )}
                
                {loading ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                    {Array.from({ length: pagination.limit }).map((_, index) => (
                      <SkeletonProductCard key={index} />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                      {products.map((item) => (
                        <ProductCard data={item} key={item.id} />
              ))}
            </div>

            {/* PAGINATION */}
                    {pagination.totalPages > 1 && (
                      <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-center sm:items-center">
                        <Pagination 
                          currentPage={pagination.page}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-neutral-500 dark:text-neutral-400">
                      <svg
                        className="mx-auto h-12 w-12 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium">No products found</h3>
                      <p className="mt-1 text-sm">Try adjusting your filters to see more products.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const PageCollection = () => {
  return (
    <Suspense fallback={
      <div className={`nc-PageCollection`}>
        <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
          <div className="space-y-10 lg:space-y-14">
            <div className="max-w-screen-sm">
              <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
                Products Collection
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonProductCard key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <PageCollectionContent />
    </Suspense>
  );
};

export default PageCollection;
