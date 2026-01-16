"use client";

import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Popover, Transition } from "@/app/headlessui";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Slider from "rc-slider";
import Radio from "@/shared/Radio/Radio";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import MySwitch from "@/components/MySwitch";
import { getCurrencySymbol } from "@/utils/currency";
import { useSiteData } from "@/hooks/useSiteData";

interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  subCategories: SubCategory[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface AttributeValue {
  id: number;
  value: string;
  backend_value?: string | null;
  price?: number | null;
}

interface Attribute {
  id: number;
  name: string;
  slug: string;
  input_type: string;
  values: AttributeValue[];
}

interface FilterData {
  categories: Category[];
  brands: Brand[];
  filterableAttributes: Attribute[];
}

interface TabFiltersAPIProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  categoryIds: number[];
  subCategoryIds: number[];
  brandIds: number[];
  attributeIds: Record<number, number[]>;
  minPrice: number;
  maxPrice: number;
  onSale: boolean;
  sortBy: string;
}

const PRICE_RANGE = [0, 1000];

const DATA_sortOrderRadios = [
  { name: "Latest", id: "latest" },
  { name: "Price Low - High", id: "price_low" },
  { name: "Price High - Low", id: "price_high" },
  { name: "Most Popular", id: "popular" },
];

// Helper function to check if a string is a valid color code
const isValidColorCode = (str: string): boolean => {
  if (!str) return false;
  const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
  const rgbPattern = /^rgba?\(/i;
  return hexPattern.test(str) || rgbPattern.test(str);
};

const TabFiltersAPI: React.FC<TabFiltersAPIProps> = ({ onFilterChange }) => {
  const [filterData, setFilterData] = useState<FilterData>({
    categories: [],
    brands: [],
    filterableAttributes: [],
  });
  const [loading, setLoading] = useState(true);
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  const [isOpenMoreFilter, setisOpenMoreFilter] = useState(false);
  const [isOnSale, setIsIsOnSale] = useState(false);
  const [rangePrices, setRangePrices] = useState(PRICE_RANGE);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [subCategoryIds, setSubCategoryIds] = useState<number[]>([]);
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [attributeIds, setAttributeIds] = useState<Record<number, number[]>>({});
  const [sortOrderStates, setSortOrderStates] = useState<string>("latest");

  // Fetch filter data from API
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/filters`);
        const data = await response.json();

        if (data.success && data.data) {
          setFilterData({
            categories: data.data.categories || [],
            brands: data.data.brands || [],
            filterableAttributes: data.data.filterableAttributes || [],
          });
          
          // Set max price from products if available
          if (data.data.maxPrice) {
            setRangePrices([PRICE_RANGE[0], data.data.maxPrice]);
          }
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        categoryIds,
        subCategoryIds,
        brandIds,
        attributeIds,
        minPrice: rangePrices[0],
        maxPrice: rangePrices[1],
        onSale: isOnSale,
        sortBy: sortOrderStates,
      });
    }
  }, [categoryIds, subCategoryIds, brandIds, attributeIds, rangePrices, isOnSale, sortOrderStates, onFilterChange]);

  const closeModalMoreFilter = () => setisOpenMoreFilter(false);
  const openModalMoreFilter = () => setisOpenMoreFilter(true);

  const handleChangeCategory = (checked: boolean, id: number) => {
    if (checked) {
      setCategoryIds([...categoryIds, id]);
    } else {
      setCategoryIds(categoryIds.filter((i) => i !== id));
      const category = filterData.categories.find(c => c.id === id);
      if (category) {
        const subCatIds = category.subCategories.map(s => s.id);
        setSubCategoryIds(subCategoryIds.filter(id => !subCatIds.includes(id)));
      }
    }
  };

  const handleChangeSubCategory = (checked: boolean, id: number) => {
    checked
      ? setSubCategoryIds([...subCategoryIds, id])
      : setSubCategoryIds(subCategoryIds.filter((i) => i !== id));
  };

  const handleChangeBrand = (checked: boolean, id: number) => {
    checked
      ? setBrandIds([...brandIds, id])
      : setBrandIds(brandIds.filter((i) => i !== id));
  };

  const handleChangeAttributeValue = (checked: boolean, attributeId: number, valueId: number) => {
    const currentValues = attributeIds[attributeId] || [];
    if (checked) {
      setAttributeIds({
        ...attributeIds,
        [attributeId]: [...currentValues, valueId],
      });
    } else {
      setAttributeIds({
        ...attributeIds,
        [attributeId]: currentValues.filter((id) => id !== valueId),
      });
    }
  };

  const renderXClear = () => {
    return (
      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center ml-3 cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  };

  const renderTabsCategories = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none
               ${
                 open
                   ? "!border-primary-500 "
                   : "border-neutral-300 dark:border-neutral-700"
               }
                ${
                  !!categoryIds.length || !!subCategoryIds.length
                    ? "!border-primary-500 bg-primary-50 text-primary-900"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                }
                `}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2V5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 8.5V13.5C21 18.5 19.5 20 14.5 20H9.5C4.5 20 3 18.5 3 13.5V8.5C3 3.5 4.5 2 9.5 2H14.5C19.5 2 21 3.5 21 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 11H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15.5V6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2">Categories</span>
              {!!categoryIds.length && (
                <span className="ml-1.5 rounded-full w-5 h-5 flex items-center justify-center bg-primary-500 text-white text-[10px]">
                  {categoryIds.length + subCategoryIds.length}
                </span>
              )}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-10 w-screen sm:max-w-sm px-4 mt-3">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid grid-cols-1 gap-8 bg-white dark:bg-neutral-800 p-7">
                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : (
                      filterData.categories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <Checkbox
                            name={`cat-${category.id}`}
                            label={category.name}
                            defaultChecked={categoryIds.includes(category.id)}
                            sizeClassName="w-5 h-5"
                            labelClassName="text-sm font-medium"
                            onChange={(checked) => handleChangeCategory(checked, category.id)}
                          />
                          {categoryIds.includes(category.id) && category.subCategories.length > 0 && (
                            <div className="ml-6 space-y-2 mt-2">
                              {category.subCategories.map((sub) => (
                                <Checkbox
                                  key={sub.id}
                                  name={`subcat-${sub.id}`}
                                  label={sub.name}
                                  defaultChecked={subCategoryIds.includes(sub.id)}
                                  sizeClassName="w-4 h-4"
                                  labelClassName="text-sm font-normal"
                                  onChange={(checked) => handleChangeSubCategory(checked, sub.id)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderTabsBrands = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none
               ${
                 open
                   ? "!border-primary-500 "
                   : "border-neutral-300 dark:border-neutral-700"
               }
                ${
                  !!brandIds.length
                    ? "!border-primary-500 bg-primary-50 text-primary-900"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                }
                `}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2">Brands</span>
              {!!brandIds.length && (
                <span className="ml-1.5 rounded-full w-5 h-5 flex items-center justify-center bg-primary-500 text-white text-[10px]">
                  {brandIds.length}
                </span>
              )}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-10 w-screen sm:max-w-sm px-4 mt-3">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid grid-cols-1 gap-8 bg-white dark:bg-neutral-800 p-7">
                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : (
                      filterData.brands.map((brand) => (
                        <div key={brand.id}>
                          <Checkbox
                            name={`brand-${brand.id}`}
                            label={brand.name}
                            defaultChecked={brandIds.includes(brand.id)}
                            sizeClassName="w-5 h-5"
                            labelClassName="text-sm font-normal"
                            onChange={(checked) => handleChangeBrand(checked, brand.id)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderTabsPriceRage = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none
               ${
                 open
                   ? "!border-primary-500 "
                   : "border-neutral-300 dark:border-neutral-700"
               }
                ${
                  rangePrices[0] > PRICE_RANGE[0] || rangePrices[1] < PRICE_RANGE[1]
                    ? "!border-primary-500 bg-primary-50 text-primary-900"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                }
                `}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2V22"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2">
                {getCurrencySymbol(currency)}{rangePrices[0]} - {getCurrencySymbol(currency)}{rangePrices[1]}
              </span>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-10 w-screen sm:max-w-sm px-4 mt-3">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative bg-white dark:bg-neutral-800 p-7">
                    <div className="relative flex flex-col space-y-8 pb-4">
                      <div className="space-y-5">
                        <div className="font-medium">Price range</div>
                        <Slider
                          range
                          min={PRICE_RANGE[0]}
                          max={PRICE_RANGE[1]}
                          step={1}
                          defaultValue={[rangePrices[0], rangePrices[1]]}
                          allowCross={false}
                          onChange={(e) => setRangePrices(e as number[])}
                        />
                      </div>

                      <div className="flex justify-between space-x-5">
                        <div>
                          <label
                            htmlFor="minPrice"
                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            Min price
                          </label>
                          <div className="mt-1 relative rounded-md">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-neutral-500 sm:text-sm">{getCurrencySymbol(currency)}</span>
                            </span>
                            <input
                              type="text"
                              name="minPrice"
                              disabled
                              id="minPrice"
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-neutral-200 rounded-full text-neutral-900"
                              value={rangePrices[0]}
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="maxPrice"
                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            Max price
                          </label>
                          <div className="mt-1 relative rounded-md">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-neutral-500 sm:text-sm">{getCurrencySymbol(currency)}</span>
                            </span>
                            <input
                              type="text"
                              name="maxPrice"
                              disabled
                              id="maxPrice"
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-neutral-200 rounded-full text-neutral-900"
                              value={rangePrices[1]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderTabIsOnsale = () => {
    return (
      <div
        className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none
          ${
            isOnSale
              ? "!border-primary-500 bg-primary-50 text-primary-900"
              : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
          }
          `}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.9889 14.6604L2.46891 13.1404C1.84891 12.5204 1.84891 11.5004 2.46891 10.8804L3.9889 9.36039C4.2489 9.10039 4.4589 8.59038 4.4589 8.23038V6.08036C4.4589 5.20036 5.1789 4.48038 6.0589 4.48038H8.2089C8.5689 4.48038 9.0789 4.27041 9.3389 4.01041L10.8589 2.49039C11.4789 1.87039 12.4989 1.87039 13.1189 2.49039L14.6389 4.01041C14.8989 4.27041 15.4089 4.48038 15.7689 4.48038H17.9189C18.7989 4.48038 19.5189 5.20036 19.5189 6.08036V8.23038C19.5189 8.59038 19.7289 9.10039 19.9889 9.36039L21.5089 10.8804C22.1289 11.5004 22.1289 12.5204 21.5089 13.1404L19.9889 14.6604C19.7289 14.9204 19.5189 15.4304 19.5189 15.7904V17.9404C19.5189 18.8204 18.7989 19.5404 17.9189 19.5404H15.7689C15.4089 19.5404 14.8989 19.7504 14.6389 20.0104L13.1189 21.5304C12.4989 22.1504 11.4789 22.1504 10.8589 21.5304L9.3389 20.0104C9.0789 19.7504 8.5689 19.5404 8.2089 19.5404H6.0589C5.1789 19.5404 4.4589 18.8204 4.4589 17.9404V15.7904C4.4589 15.4204 4.2489 14.9104 3.9889 14.6604Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="ml-2">On sale</span>
        <MySwitch
          enabled={isOnSale}
          onChange={setIsIsOnSale}
          className="ml-2"
        />
      </div>
    );
  };

  const renderTabsSortOrder = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none
               ${
                 open
                   ? "!border-primary-500 "
                   : "border-neutral-300 dark:border-neutral-700"
               }
                ${
                  !!sortOrderStates
                    ? "!border-primary-500 bg-primary-50 text-primary-900"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                }
                `}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 7H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12H18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 17H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2">Sort order</span>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 z-10 w-screen sm:max-w-sm px-4 mt-3">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid grid-cols-1 gap-8 bg-white dark:bg-neutral-800 p-7">
                    {DATA_sortOrderRadios.map((item) => (
                      <Radio
                        id={item.id}
                        key={item.id}
                        name="sortOrder"
                        label={item.name}
                        defaultChecked={sortOrderStates === item.id}
                        onChange={(checked) => {
                          if (checked) {
                            setSortOrderStates(item.id);
                            close();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  // Render attributes as a single popover
  const renderTabsAttributes = () => {
    if (filterData.filterableAttributes.length === 0 && !loading) {
      return null;
    }

    const totalSelectedAttributes = Object.values(attributeIds).reduce((sum, arr) => sum + arr.length, 0);

    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none
               ${
                 open
                   ? "!border-primary-500 "
                   : "border-neutral-300 dark:border-neutral-700"
               }
                ${
                  totalSelectedAttributes > 0
                    ? "!border-primary-500 bg-primary-50 text-primary-900"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                }
                `}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 13L12 18L17 13M7 6L12 11L17 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2">Attributes</span>
              {totalSelectedAttributes > 0 && (
                <span className="ml-1.5 rounded-full w-5 h-5 flex items-center justify-center bg-primary-500 text-white text-[10px]">
                  {totalSelectedAttributes}
                </span>
              )}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-10 w-screen sm:max-w-md px-4 mt-3 max-h-[80vh] overflow-y-auto">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative bg-white dark:bg-neutral-800 p-7">
                    {filterData.filterableAttributes.map((attribute) => {
                      const selectedValues = attributeIds[attribute.id] || [];
                      
                      return (
                        <div key={attribute.id} className="mb-6 last:mb-0">
                          <h3 className="font-semibold mb-3 text-sm">{attribute.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {attribute.values.map((value) => {
                              const displayValue = value.backend_value || value.value;
                              const isColorCode = isValidColorCode(displayValue);
                              const isSelected = selectedValues.includes(value.id);

                              return (
                                <div key={value.id}>
                                  {isColorCode ? (
                                    <div
                                      onClick={() => handleChangeAttributeValue(!isSelected, attribute.id, value.id)}
                                      className={`relative w-8 h-8 rounded-full border cursor-pointer flex items-center justify-center transition-all ${
                                        isSelected ? 'border-2 border-primary-500 ring-2 ring-primary-500/50' : 'border-slate-300 dark:border-slate-700'
                                      }`}
                                      style={{ backgroundColor: displayValue }}
                                      title={value.value}
                                    >
                                      {isSelected && (
                                        <CheckIcon className="w-4 h-4 text-white drop-shadow-sm" />
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleChangeAttributeValue(!isSelected, attribute.id, value.id)}
                                      className={`px-3 py-1 rounded-full border text-sm transition-all ${
                                        isSelected
                                          ? 'bg-primary-6000 text-white border-primary-6000'
                                          : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'
                                      }`}
                                    >
                                      {value.value}
                                      {value.price && Number(value.price) > 0 && (
                                        <span className="ml-1 text-xs opacity-80">
                                          (+{getCurrencySymbol(currency)}{Number(value.price).toFixed(2)})
                                        </span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  return (
    <div className="flex lg:space-x-4">
      {/* FOR DESKTOP */}
      <div className="hidden lg:flex flex-1 space-x-4">
        {renderTabsPriceRage()}
        {renderTabsCategories()}
        {renderTabsBrands()}
        {renderTabsAttributes()}
        {renderTabIsOnsale()}
        <div className="!ml-auto">{renderTabsSortOrder()}</div>
      </div>

      {/* FOR RESPONSIVE MOBILE */}
      <div className="flex overflow-x-auto lg:hidden space-x-4">
        {renderTabsPriceRage()}
        {renderTabsCategories()}
        {renderTabsBrands()}
        {renderTabsAttributes()}
        {renderTabIsOnsale()}
        {renderTabsSortOrder()}
      </div>
    </div>
  );
};

export default TabFiltersAPI;

