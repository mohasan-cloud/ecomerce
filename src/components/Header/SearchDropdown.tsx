"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Route } from "@/routers/types";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  type: 'product' | 'category' | 'subcategory' | 'brand' | 'gender';
  image?: string | null;
  price?: number;
  category_id?: number;
  category_name?: string;
  logo?: string | null;
}

interface SearchDropdownProps {
  searchQuery: string;
  onClose: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ searchQuery, onClose }) => {
  const [results, setResults] = useState<{
    products: SearchResult[];
    categories: SearchResult[];
    subcategories: SearchResult[];
    brands: SearchResult[];
    genders: SearchResult[];
  }>({
    products: [],
    categories: [],
    subcategories: [],
    brands: [],
    genders: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults({
        products: [],
        categories: [],
        subcategories: [],
        brands: [],
        genders: [],
      });
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = await response.json();

        if (data.success && data.data) {
          setResults(data.data);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleItemClick = (item: SearchResult) => {
    let url = '';
    
    switch (item.type) {
      case 'product':
        url = `/product-detail/${item.slug}`;
        break;
      case 'category':
        url = `/collection?category_id=${item.id}&search=${encodeURIComponent(searchQuery)}`;
        break;
      case 'subcategory':
        url = `/collection?sub_category_id=${item.id}&search=${encodeURIComponent(searchQuery)}`;
        break;
      case 'brand':
        url = `/collection?brand_ids[]=${item.id}&search=${encodeURIComponent(searchQuery)}`;
        break;
      case 'gender':
        url = `/collection?gender_id=${item.id}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
        break;
    }

    if (url) {
      router.push(url as Route);
      onClose();
    }
  };

  const allResults = [
    ...results.products,
    ...results.categories,
    ...results.subcategories,
    ...results.brands,
    ...results.genders,
  ];

  if (searchQuery.trim().length < 2 || (!loading && allResults.length === 0)) {
    return null;
          }

          return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto z-50"
    >
      {loading ? (
        <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Searching...
        </div>
      ) : allResults.length > 0 ? (
        <div className="py-2">
          {results.products.length > 0 && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Products</h3>
              {results.products.map((item) => (
                <div
                  key={`product-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded"
                >
                  {item.image && (
                    <div className="w-10 h-10 relative flex-shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized={item.image.includes('localhost') || item.image.includes('127.0.0.1')}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                    {item.price !== undefined && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">${item.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.categories.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Categories</h3>
              {results.categories.map((item) => (
                <div
                  key={`category-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                  <p className="text-sm text-slate-900 dark:text-slate-100">{item.name}</p>
                </div>
              ))}
            </div>
          )}

          {results.subcategories.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Subcategories</h3>
              {results.subcategories.map((item) => (
                <div
                  key={`subcategory-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{item.name}</p>
                    {item.category_name && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.category_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.brands.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Brands</h3>
              {results.brands.map((item) => (
                <div
                  key={`brand-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded"
                >
                  {item.logo ? (
                    <div className="w-8 h-8 relative flex-shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <Image
                        src={item.logo}
                        alt={item.name}
                        fill
                        className="object-contain"
                        sizes="32px"
                        unoptimized={item.logo.includes('localhost') || item.logo.includes('127.0.0.1')}
                      />
                    </div>
                  ) : (
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                  )}
                  <p className="text-sm text-slate-900 dark:text-slate-100">{item.name}</p>
                </div>
              ))}
            </div>
          )}

          {results.genders.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Genders</h3>
              {results.genders.map((item) => (
                <div
                  key={`gender-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                  <p className="text-sm text-slate-900 dark:text-slate-100">{item.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SearchDropdown;
