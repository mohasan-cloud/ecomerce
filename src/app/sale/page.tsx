"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/shared/Pagination/Pagination";
import ProductCard from "@/components/ProductCard";
import SidebarFiltersAPI, { FilterState } from "@/components/SidebarFiltersAPI";
import { ApiProduct } from "@/hooks/useProducts";
import SkeletonProductCard from "@/components/SkeletonProductCard";

const PageSale = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categoryIds: [],
    subCategoryIds: [],
    brandIds: [],
    attributeIds: {},
    minPrice: 0,
    maxPrice: 1000,
    onSale: true, // Always true for sale page
    sortBy: "latest",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

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
        params.append('has_offers', '1'); // Always fetch products with offers
        
        if (filters.categoryIds.length > 0) {
          params.append('category_id', filters.categoryIds[0].toString());
        }
        
        if (filters.subCategoryIds.length > 0) {
          params.append('sub_category_id', filters.subCategoryIds[0].toString());
        }
        
        if (filters.brandIds.length > 0) {
          filters.brandIds.forEach(id => params.append('brand_ids[]', id.toString()));
        }
        
        params.append('min_price', filters.minPrice.toString());
        params.append('max_price', filters.maxPrice.toString());
        
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

  const handleFilterChange = (newFilters: FilterState) => {
    // Always keep onSale as true for sale page
    setFilters({ ...newFilters, onSale: true });
    setPagination({ ...pagination, page: 1 }); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`nc-PageSale`}>
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {/* HEADING */}
          <div className="max-w-screen-sm mx-auto text-center">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              🔥 Special Offers & Sale
            </h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              Discover amazing deals and discounts on our premium products. Limited time offers - don't miss out!
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
                  placeholder="Search sale products..."
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
                <SidebarFiltersAPI onFilterChange={handleFilterChange} />
              </div>
              
              <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 border-t lg:border-t-0"></div>
              
              {/* PRODUCTS GRID */}
              <div className="flex-1">
                {/* Results count */}
                {!loading && (
                  <div className="mb-6 flex items-center justify-between">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Showing {products.length} of {pagination.total} sale products
                    </div>
                    {pagination.total > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          On Sale
                        </span>
                      </div>
                    )}
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
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium">No sale products found</h3>
                      <p className="mt-1 text-sm">Try adjusting your filters or check back later for new offers.</p>
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

export default PageSale;

