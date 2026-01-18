"use client";

import React, { useState, useEffect, useRef } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Slider from "rc-slider";
import Radio from "@/shared/Radio/Radio";
import MySwitch from "@/components/MySwitch";
import { useSiteData } from "@/hooks/useSiteData";
import { getCurrencySymbol } from "@/utils/currency";

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
  attributes: Attribute[];
}

interface SidebarFiltersAPIProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export interface FilterState {
  categoryIds: number[];
  subCategoryIds: number[];
  brandIds: number[];
  attributeIds: Record<number, number[]>; // attributeId -> array of valueIds
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

const SidebarFiltersAPI: React.FC<SidebarFiltersAPIProps> = ({ onFilterChange, initialFilters }) => {
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;
  
  const [filterData, setFilterData] = useState<FilterData>({
    categories: [],
    brands: [],
    attributes: [],
  });
  const [loading, setLoading] = useState(true);
  const isInitializing = useRef(true);
  const prevInitialFilters = useRef<Partial<FilterState> | undefined>(undefined);
  const prevFilterState = useRef<FilterState | null>(null);

  // Filter states - initialize from props if provided
  const [categoryIds, setCategoryIds] = useState<number[]>(initialFilters?.categoryIds || []);
  const [subCategoryIds, setSubCategoryIds] = useState<number[]>(initialFilters?.subCategoryIds || []);
  const [brandIds, setBrandIds] = useState<number[]>(initialFilters?.brandIds || []);
  const [attributeIds, setAttributeIds] = useState<Record<number, number[]>>(initialFilters?.attributeIds || {});
  const [rangePrices, setRangePrices] = useState([
    initialFilters?.minPrice ?? PRICE_RANGE[0], 
    initialFilters?.maxPrice ?? PRICE_RANGE[1]
  ]);
  const [onSale, setOnSale] = useState(initialFilters?.onSale || false);
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || "latest");

  // Update filters when initialFilters change (only if values are actually different)
  useEffect(() => {
    if (!initialFilters) {
      isInitializing.current = false;
      return;
    }
    
    // Compare with previous initialFilters to avoid unnecessary updates
    const prevFilters = prevInitialFilters.current;
    const filtersChanged = !prevFilters || JSON.stringify(prevFilters) !== JSON.stringify(initialFilters);
    
    if (!filtersChanged) {
      isInitializing.current = false;
      return;
    }
    
    isInitializing.current = true;
    
    // Update all filter states from initialFilters
    if (initialFilters.categoryIds) {
      setCategoryIds(initialFilters.categoryIds);
    }
    if (initialFilters.subCategoryIds) {
      setSubCategoryIds(initialFilters.subCategoryIds);
    }
    if (initialFilters.brandIds) {
      setBrandIds(initialFilters.brandIds);
    }
    if (initialFilters.attributeIds) {
      setAttributeIds(initialFilters.attributeIds);
    }
    if (initialFilters.minPrice !== undefined || initialFilters.maxPrice !== undefined) {
      setRangePrices([
        initialFilters.minPrice ?? PRICE_RANGE[0],
        initialFilters.maxPrice ?? PRICE_RANGE[1]
      ]);
    }
    if (initialFilters.onSale !== undefined) {
      setOnSale(initialFilters.onSale);
    }
    if (initialFilters.sortBy) {
      setSortBy(initialFilters.sortBy);
    }
    
    prevInitialFilters.current = initialFilters;
    
    // Mark initialization complete after state updates
    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters]);

  // Fetch filter data from API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/filters`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setFilterData(data.data);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Notify parent component when filters change (but not during initialization)
  useEffect(() => {
    // Skip if we're still initializing from URL params
    if (isInitializing.current) {
      return;
    }
    
    const currentFilters: FilterState = {
      categoryIds,
      subCategoryIds,
      brandIds,
      attributeIds,
      minPrice: rangePrices[0],
      maxPrice: rangePrices[1],
      onSale,
      sortBy,
    };
    
    // Only call onFilterChange if filters actually changed (not just initialized)
    const filtersChanged = !prevFilterState.current || 
      JSON.stringify(prevFilterState.current) !== JSON.stringify(currentFilters);
    
    if (filtersChanged) {
      prevFilterState.current = currentFilters;
      onFilterChange(currentFilters);
    }
  }, [categoryIds, subCategoryIds, brandIds, attributeIds, rangePrices, onSale, sortBy, onFilterChange]);

  const handleChangeCategory = (checked: boolean, id: number) => {
    if (checked) {
      setCategoryIds([...categoryIds, id]);
    } else {
      setCategoryIds(categoryIds.filter((i) => i !== id));
      // Remove subcategories of this category
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

  const renderTabsCategories = () => {
    return (
      <div className="relative flex flex-col pb-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Categories</h3>
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
              {/* Subcategories */}
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
    );
  };

  const renderTabsBrands = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Brands</h3>
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
    );
  };

  const renderTabsAttributes = () => {
    if (filterData.attributes.length === 0 && !loading) {
      return null;
    }

    return (
      <>
        {filterData.attributes.map((attribute) => {
          const selectedValues = attributeIds[attribute.id] || [];
          
          return (
            <div key={attribute.id} className="relative flex flex-col py-8 space-y-4">
              <h3 className="font-semibold mb-2.5">{attribute.name}</h3>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {attribute.values.map((value) => {
                    const displayValue = value.backend_value || value.value;
                    const isColor = attribute.input_type === 'color' || attribute.name.toLowerCase().includes('color');
                    const colorCode = isColor && value.backend_value ? value.backend_value : null;
                    
                    return (
                      <div key={value.id} className="flex items-center">
                        <Checkbox
                          sizeClassName="w-5 h-5"
                          labelClassName="text-sm font-normal"
                          name={`attr-${attribute.id}-${value.id}`}
                          label={
                            <div className="flex items-center">
                              {colorCode && (
                                <span
                                  className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                  style={{ backgroundColor: colorCode }}
                                />
                              )}
                              <span>{displayValue}</span>
                              {value.price && value.price > 0 && (
                                <span className="ml-2 text-xs text-gray-500">(+${value.price.toFixed(2)})</span>
                              )}
                            </div>
                          }
                          defaultChecked={selectedValues.includes(value.id)}
                          onChange={(checked) => handleChangeAttributeValue(checked, attribute.id, value.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  const renderTabsPriceRange = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-5 pr-3">
        <div className="space-y-5">
          <span className="font-semibold">Price range</span>
          <Slider
            range
            min={PRICE_RANGE[0]}
            max={PRICE_RANGE[1]}
            step={10}
            defaultValue={[rangePrices[0], rangePrices[1]]}
            value={rangePrices}
            allowCross={false}
            onChange={(_input: number | number[]) =>
              setRangePrices(_input as number[])
            }
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
              {currency && (
                <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                  {getCurrencySymbol(currency)}
                </span>
              )}
              <input
                type="text"
                name="minPrice"
                disabled
                id="minPrice"
                className={`block w-32 ${currency ? 'pr-10' : 'pr-4'} pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent`}
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
              {currency && (
                <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                  {getCurrencySymbol(currency)}
                </span>
              )}
              <input
                type="text"
                disabled
                name="maxPrice"
                id="maxPrice"
                className={`block w-32 ${currency ? 'pr-10' : 'pr-4'} pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent`}
                value={rangePrices[1]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabsSortOrder = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Sort order</h3>
        {DATA_sortOrderRadios.map((item) => (
          <Radio
            id={item.id}
            key={item.id}
            name="radioNameSort"
            label={item.name}
            defaultChecked={sortBy === item.id}
            sizeClassName="w-5 h-5"
            onChange={() => setSortBy(item.id)}
            className="!text-sm"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {renderTabsCategories()}
      {renderTabsBrands()}
      {renderTabsAttributes()}
      {renderTabsPriceRange()}
      <div className="py-8 pr-2">
        <MySwitch
          label="On sale!"
          desc="Products currently on sale"
          enabled={onSale}
          onChange={setOnSale}
        />
      </div>
      {renderTabsSortOrder()}
    </div>
  );
};

export default SidebarFiltersAPI;

