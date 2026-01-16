"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "@/shared/Pagination/Pagination";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import HeaderFilterSearchPage from "@/components/HeaderFilterSearchPage";
import Input from "@/shared/Input/Input";
import ButtonCircle from "@/shared/Button/ButtonCircle";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import SkeletonProductCard from "@/components/SkeletonProductCard";

const PageSearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const queryParam = searchParams.get("q") || "";
  
  // Initialize search query from URL
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    } else {
      setSearchQuery("");
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [queryParam]);

  // Fetch products with search query
  const { products, loading, totalPages, total } = useProducts({
    search: queryParam || undefined,
    page: currentPage,
    limit: 20,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setCurrentPage(1);
    }
  };

  return (
    <div className={`nc-PageSearch`} data-nc-id="PageSearch">
      <div
        className={`nc-HeadBackgroundCommon h-24 2xl:h-28 top-0 left-0 right-0 w-full bg-primary-50 dark:bg-neutral-800/20 `}
      />
      <div className="container">
        <header className="max-w-2xl mx-auto -mt-10 flex flex-col lg:-mt-7">
          <form className="relative w-full " onSubmit={handleSearch}>
            <label
              htmlFor="search-input"
              className="text-neutral-500 dark:text-neutral-300"
            >
              <span className="sr-only">Search products</span>
              <Input
                className="shadow-lg border-0 dark:border"
                id="search-input"
                type="search"
                placeholder="Type your keywords"
                sizeClass="pl-14 py-5 pr-5 md:pl-16"
                rounded="rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ButtonCircle
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2"
                size=" w-11 h-11"
                type="submit"
              >
                <i className="las la-arrow-right text-xl"></i>
              </ButtonCircle>
              <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-2xl md:left-6">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 22L20 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>
          </form>
          {queryParam && (
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">
              {loading ? (
                "Searching..."
              ) : total > 0 ? (
                `Found ${total} product${total !== 1 ? "s" : ""} for "${queryParam}"`
              ) : (
                `No products found for "${queryParam}"`
              )}
            </p>
          )}
        </header>
      </div>

      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 lg:space-y-28">
        <main>
          {/* FILTER */}
          <HeaderFilterSearchPage />

          {/* LOOP ITEMS */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonProductCard key={index} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
              {products.map((item) => (
                <ProductCard data={item} key={item.id} />
              ))}
            </div>
          ) : queryParam ? (
            <div className="text-center py-16">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                No products found for "{queryParam}"
              </p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
                Try different keywords or browse our collection
              </p>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Enter keywords to search for products
              </p>
            </div>
          )}

          {/* PAGINATION */}
          {products.length > 0 && totalPages > 1 && (
            <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </main>

        {/* === SECTION 5 === */}
        {products.length > 0 && (
          <>
            <hr className="border-slate-200 dark:border-slate-700" />
            <SectionSliderCollections />
            <hr className="border-slate-200 dark:border-slate-700" />
          </>
        )}
      </div>
    </div>
  );
};

const PageSearch = () => {
  return (
    <Suspense fallback={
      <div className={`nc-PageSearch`} data-nc-id="PageSearch">
        <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 lg:space-y-28">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </div>
        </div>
      </div>
    }>
      <PageSearchContent />
    </Suspense>
  );
};

export default PageSearch;
