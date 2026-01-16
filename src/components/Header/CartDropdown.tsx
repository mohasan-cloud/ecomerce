"use client";

import { Popover, Transition } from "@/app/headlessui";
import Prices from "@/components/Prices";
import { Fragment } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSiteData } from "@/hooks/useSiteData";
import { getCurrencySymbol } from "@/utils/currency";

// Helper function to check if a string is a valid color code
const isValidColorCode = (str: string): boolean => {
  if (!str) return false;
  const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
  const rgbPattern = /^rgba?\(/i;
  return hexPattern.test(str) || rgbPattern.test(str);
};

export default function CartDropdown() {
  const { items, loading, total, removeFromCart, updateQuantity } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const router = useRouter();
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  const handleRemove = async (cartId: number, close: () => void) => {
    const item = items.find(i => i.id === cartId);
    if (!item) return;
    
    setRemovingId(cartId);
    const result = await removeFromCart(cartId);
    if (result.success) {
      toast.success(`${item.product.name} removed from cart`);
    } else {
      toast.error("Failed to remove item");
    }
    setRemovingId(null);
  };

  const handleQuantityChange = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = items.find(i => i.id === cartId);
    if (!item) return;
    
    // Check stock quantity availability
    if (item.product.stockQuantity !== null && item.product.stockQuantity !== undefined) {
      if (newQuantity > item.product.stockQuantity) {
        toast.error(`Only ${item.product.stockQuantity} items available in stock`);
        return;
      }
    }
    
    // Check if product is in stock
    if (item.product.inStock === false) {
      toast.error("This product is out of stock");
      return;
    }
    
    setUpdatingId(cartId);
    const result = await updateQuantity(cartId, newQuantity);
    if (result.success) {
      toast.success(`Quantity updated to ${newQuantity}`);
    } else {
      toast.error("Failed to update quantity");
    }
    setUpdatingId(null);
  };

  const renderProductCartOnNotify = (item: typeof items[0]) => {
    const { product, quantity, color, size, price, priceWithAttributes, finalPrice, discountPercentage, subtotal } = item;
    
    // Calculate attribute prices
    let totalAttributePrice = 0;
    if (item.selectedAttributes && product.attributes) {
      Object.entries(item.selectedAttributes).forEach(([attrId, values]) => {
        const attribute = product.attributes?.find(a => a.id === Number(attrId));
        if (attribute && values && values.length > 0) {
          const selectedValue = values[0];
          const valueDetails = attribute.values?.find(v => v.value === selectedValue);
          if (valueDetails?.price && Number(valueDetails.price) > 0) {
            totalAttributePrice += Number(valueDetails.price);
          }
        }
      });
    }
    
    const baseProductPrice = price || product.price;
    const priceWithAttrs = priceWithAttributes || (baseProductPrice + totalAttributePrice);
    
    return (
      <div className="flex">
        <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 relative">
          {product.image ? (
            <Image
              width={80}
              height={96}
              src={product.image}
              alt={product.name}
              className="object-contain object-center w-full h-full"
              unoptimized={product.image.includes('localhost') || product.image.includes('127.0.0.1')}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}
        </div>

        <div className="ms-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between">
              <div>
                <h3 className="text-base font-medium">{product.name}</h3>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && product.attributes && product.attributes.length > 0 ? (
                    <>
                      {Object.entries(item.selectedAttributes)
                        .map(([attrId, values], idx, filteredArray) => {
                          const attribute = product.attributes?.find(a => a.id === Number(attrId));
                          if (!attribute || !values || values.length === 0) return null;
                          
                          // Get the selected value details - try ID first (new format - IDs are stored), then by value string (legacy format)
                          const selectedValue = values[0];
                          const valueDetails = attribute.values?.find(v => {
                            // First, try to match by ID (new format - IDs are stored in array)
                            if (typeof selectedValue === 'number') {
                              return v.id === selectedValue;
                            }
                            if (typeof selectedValue === 'string') {
                              const numValue = Number(selectedValue);
                              if (!isNaN(numValue) && numValue > 0) {
                                // If it's a numeric string, treat it as ID
                                return v.id === numValue || String(v.id) === selectedValue;
                              }
                              // If it's not numeric, it's a legacy value name - match by value string
                              if (v.value === selectedValue || v.backend_value === selectedValue) {
                                return true;
                              }
                              // Case-insensitive match for value strings
                              if (typeof v.value === 'string') {
                                return v.value.toLowerCase() === selectedValue.toLowerCase();
                              }
                            }
                            return false;
                          });
                          const displayValue = valueDetails?.backend_value || valueDetails?.value || String(selectedValue);
                          const displayValueStr = String(displayValue);
                          const isColorCode = isValidColorCode(displayValueStr);
                          
                          return (
                            <span key={attrId} className="flex items-center gap-1">
                              {idx > 0 && <span className="mx-1">•</span>}
                              <span>{attribute.name}:</span>
                              {isColorCode ? (
                                <>
                                  <div 
                                    className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                                    style={{ backgroundColor: displayValueStr }}
                                  />
                                  <span>{valueDetails?.value || displayValue}</span>
                                </>
                              ) : (
                                <span className="font-medium">{displayValue}</span>
                              )}
                            {valueDetails?.price && Number(valueDetails.price) > 0 && (
                              <span className="text-xs">
                                (+{getCurrencySymbol(currency)}{Number(valueDetails.price).toFixed(2)})
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {color && <span>{color.name}</span>}
                      {color && size && (
                        <span className="mx-2 border-l border-slate-200 dark:border-slate-700 h-4"></span>
                      )}
                      {size && <span>{size.name}</span>}
                      {!color && !size && <span className="text-slate-400">No variant</span>}
                    </>
                  )}
                </div>
              </div>
              <Prices 
                price={price} 
                finalPrice={finalPrice} 
                discountPercentage={discountPercentage}
                className="mt-0.5"
                currency={currency}
              />
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-slate-400">Qty {quantity}</p>
            <div className="flex">
              <button
                type="button"
                className="font-medium text-primary-6000 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/cart");
                }}
              >
                View cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProduct = (item: typeof items[0], index: number, close: () => void) => {
    const { product, quantity, color, size, price, priceWithAttributes, finalPrice, discountPercentage, subtotal, selectedAttributes } = item;
    const isRemoving = removingId === item.id;
    const isUpdating = updatingId === item.id;

    // Debug: Log item data for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('CartDropdown Item:', {
        itemId: item.id,
        productId: product.id,
        productName: product.name,
        selectedAttributes,
        productAttributes: product.attributes,
        selectedAttributesKeys: selectedAttributes ? Object.keys(selectedAttributes) : [],
      });
    }
    
    // Calculate attribute prices
    let totalAttributePrice = 0;
    if (item.selectedAttributes && product.attributes) {
      Object.entries(item.selectedAttributes).forEach(([attrId, values]) => {
        const attribute = product.attributes?.find(a => a.id === Number(attrId));
        if (attribute && values && values.length > 0) {
                          const selectedValue = values[0];
                          // Try to find value by ID first (new format - IDs are stored), then by value string (legacy format)
                          const valueDetails = attribute.values?.find(v => {
                            // First, try to match by ID (new format - IDs are stored in array)
                            if (typeof selectedValue === 'number') {
                              return v.id === selectedValue;
                            }
                            if (typeof selectedValue === 'string') {
                              const numValue = Number(selectedValue);
                              if (!isNaN(numValue) && numValue > 0) {
                                // If it's a numeric string, treat it as ID
                                return v.id === numValue || String(v.id) === selectedValue;
                              }
                              // If it's not numeric, it's a legacy value name - match by value string
                              if (v.value === selectedValue || v.backend_value === selectedValue) {
                                return true;
                              }
                              // Case-insensitive match for value strings
                              if (typeof v.value === 'string') {
                                return v.value.toLowerCase() === selectedValue.toLowerCase();
                              }
                            }
                            return false;
                          });
          if (valueDetails?.price && Number(valueDetails.price) > 0) {
            totalAttributePrice += Number(valueDetails.price);
          }
        }
      });
    }
    
    const baseProductPrice = price || product.price;
    const priceWithAttrs = priceWithAttributes || (baseProductPrice + totalAttributePrice);
    
    // Calculate discount only on base product price, not on attributes
    const discountedProductPrice = discountPercentage > 0 
      ? baseProductPrice * (1 - discountPercentage / 100)
      : baseProductPrice;
    
    // Final price = discounted product price + attribute prices
    const calculatedFinalPrice = discountedProductPrice + totalAttributePrice;
    const itemTotal = (finalPrice || calculatedFinalPrice) * quantity;
    const itemSubtotal = priceWithAttrs * quantity;
    const discountAmount = discountPercentage > 0 
      ? (baseProductPrice - discountedProductPrice) * quantity
      : 0;

    return (
      <div key={item.id} className="flex py-5 last:pb-0">
        {/* Product Thumbnail */}
        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {product.image ? (
          <Image
            fill
              src={product.image}
              alt={product.name}
            className="h-full w-full object-contain object-center"
              sizes="80px"
              unoptimized={product.image.includes('localhost') || product.image.includes('127.0.0.1')}
          />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}
          <Link
            onClick={close}
            className="absolute inset-0"
            href={`/product-detail/${product.slug}`}
          />
        </div>

        {/* Product Details */}
        <div className="ml-4 flex flex-1 flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              {/* Left Side - Product Info */}
              <div className="flex-1 pr-4">
                {/* Product Name */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  <Link onClick={close} href={`/product-detail/${product.slug}`} className="hover:text-primary-6000 dark:hover:text-primary-400">
                    {product.name}
                  </Link>
                </h3>
                
                {/* Attributes - Only show those with show_in_checkout = 1 */}
                <div className="mt-1.5 space-y-1">
                  {(() => {
                    // Use selectedAttributes from destructured item or fallback to item.selectedAttributes
                    const attrs = selectedAttributes || item.selectedAttributes;
                    
                    // Check if we have selectedAttributes and product.attributes
                    if (!attrs || typeof attrs !== 'object' || Object.keys(attrs).length === 0) {
                      // Fallback to old color/size display
                      return (
                        <>
                          {color && <div className="text-sm text-slate-600 dark:text-slate-400">color: {color.name}</div>}
                          {size && <div className="text-sm text-slate-600 dark:text-slate-400">Size: {size.name}</div>}
                          {!color && !size && <div className="text-sm text-slate-400">No variant</div>}
                        </>
                      );
                    }

                    if (!product.attributes || product.attributes.length === 0) {
                      return (
                        <>
                          {color && <div className="text-sm text-slate-600 dark:text-slate-400">color: {color.name}</div>}
                          {size && <div className="text-sm text-slate-600 dark:text-slate-400">Size: {size.name}</div>}
                          {!color && !size && <div className="text-sm text-slate-400">No variant</div>}
                        </>
                      );
                    }

                    // Filter and map selected attributes - only show those with show_in_checkout = 1
                    const filteredAttributes = Object.entries(attrs)
                      .map(([attrId, values]) => {
                        const attrIdNum = Number(attrId);
                        const attribute = product.attributes?.find(a => a.id === attrIdNum);
                        
                        // If attribute not found in product.attributes, skip it (backend filtered it out)
                        if (!attribute) {
                          if (process.env.NODE_ENV === 'development') {
                            console.log('Attribute not found:', { attrId, attrIdNum, availableAttributes: product.attributes?.map(a => a.id) });
                          }
                          return null;
                        }
                        
                        if (!values || !Array.isArray(values) || values.length === 0) {
                          if (process.env.NODE_ENV === 'development') {
                            console.log('No values for attribute:', { attrId, values });
                          }
                          return null;
                        }
                        
                        const selectedValue = values[0];
                        // Try to find value by ID first (new format - IDs are stored), then by value string (legacy format)
                        const valueDetails = attribute.values?.find(v => {
                          // First, try to match by ID (new format - IDs are stored in array)
                          if (typeof selectedValue === 'number') {
                            return v.id === selectedValue;
                          }
                          if (typeof selectedValue === 'string') {
                            const numValue = Number(selectedValue);
                            if (!isNaN(numValue) && numValue > 0) {
                              // If it's a numeric string, treat it as ID
                              return v.id === numValue || String(v.id) === selectedValue;
                            }
                            // If it's not numeric, it's a legacy value name - match by value string
                            if (v.value === selectedValue || v.backend_value === selectedValue) {
                              return true;
                            }
                            // Case-insensitive match for value strings
                            if (typeof v.value === 'string') {
                              return v.value.toLowerCase() === selectedValue.toLowerCase();
                            }
                          }
                          return false;
                        });
                        
                        if (!valueDetails && process.env.NODE_ENV === 'development') {
                          console.log('Value details not found:', { 
                            attrId, 
                            selectedValue, 
                            availableValues: attribute.values?.map(v => ({ id: v.id, value: v.value }))
                          });
                        }
                        
                        const displayValue = valueDetails?.backend_value || valueDetails?.value || String(selectedValue);
                        const displayValueStr = String(displayValue);
                        const isColorCode = isValidColorCode(displayValueStr);
                        
                        return {
                          attrId,
                          attribute,
                          valueDetails,
                          displayValue,
                          displayValueStr,
                          isColorCode,
                        };
                      })
                      .filter(item => item !== null);

                    if (filteredAttributes.length === 0) {
                      return (
                        <>
                          {color && <div className="text-sm text-slate-600 dark:text-slate-400">color: {color.name}</div>}
                          {size && <div className="text-sm text-slate-600 dark:text-slate-400">Size: {size.name}</div>}
                          {!color && !size && <div className="text-sm text-slate-400">No variant</div>}
                        </>
                      );
                    }

                    return (
                      <>
                        {filteredAttributes.map(({ attrId, attribute, valueDetails, displayValue, displayValueStr, isColorCode }) => (
                          <div key={attrId} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <span className="lowercase">{attribute.name}:</span>
                            {isColorCode ? (
                              <>
                                <div 
                                  className="w-4 h-4 rounded-full border border-slate-300 inline-block flex-shrink-0"
                                  style={{ backgroundColor: displayValueStr }}
                                />
                                <span className="font-medium">{valueDetails?.value || displayValue}</span>
                              </>
                            ) : (
                              <span className="font-medium">{displayValue}</span>
                            )}
                            {valueDetails?.price && Number(valueDetails.price) > 0 && (
                              <span className="text-xs text-slate-500 dark:text-slate-500">
                                (+{getCurrencySymbol(currency)}{Number(valueDetails.price).toFixed(2)})
                              </span>
                            )}
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>

                {/* Price Breakdown */}
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {/* Product Price with Discount */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>Product Price:</span>
                      <div className="flex items-center gap-2">
                        {discountPercentage > 0 && (
                          <span className="text-slate-400 dark:text-slate-500 line-through">
                            {getCurrencySymbol(currency)}{baseProductPrice.toFixed(2)}
                          </span>
                        )}
                        <span className={discountPercentage > 0 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                          {getCurrencySymbol(currency)}{discountedProductPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="flex justify-between pl-2">
                        <span className="bg-blue-50 dark:bg-blue-900/20 px-1 rounded text-xs">
                          Discount ({discountPercentage.toFixed(0)}%): -{getCurrencySymbol(currency)}{(baseProductPrice - discountedProductPrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Selected Attributes Breakdown */}
                  {(() => {
                    const attrs = item.selectedAttributes || {};
                    if (!attrs || typeof attrs !== 'object' || Object.keys(attrs).length === 0 || !product.attributes) {
                      return null;
                    }

                    const attrLines = Object.entries(attrs).map(([attrId, values]) => {
                      const attribute = product.attributes?.find(a => a.id === Number(attrId));
                      if (!attribute || !values || !Array.isArray(values) || values.length === 0) return null;

                      const selectedValue = values[0];
                      const valueDetails = attribute.values?.find(v => {
                        if (typeof selectedValue === 'number') {
                          return v.id === selectedValue;
                        }
                        const numValue = Number(selectedValue);
                        if (!isNaN(numValue) && numValue > 0) {
                          return v.id === numValue || String(v.id) === selectedValue;
                        }
                        if (v.value === selectedValue || v.backend_value === selectedValue) {
                          return true;
                        }
                        if (typeof v.value === 'string') {
                          return v.value.toLowerCase() === String(selectedValue).toLowerCase();
                        }
                        return false;
                      });

                      const displayValue = valueDetails?.backend_value || valueDetails?.value || String(selectedValue);
                      const price = valueDetails?.price && Number(valueDetails.price) > 0 ? Number(valueDetails.price) : null;

                      return (
                        <div key={attrId} className="flex justify-between pl-2 text-slate-600 dark:text-slate-300">
                          <span className="truncate pr-2">
                            <span className="font-medium">{attribute.name}:</span> {displayValue}
                          </span>
                          {price !== null && (
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              +{getCurrencySymbol(currency)}{price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    }).filter(Boolean);

                    if (attrLines.length === 0) return null;
                    return (
                      <div className="space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 pl-1">Selected attributes</div>
                        {attrLines}
                      </div>
                    );
                  })()}
                  
                  {totalAttributePrice > 0 && (
                    <div className="flex justify-between">
                      <span>Attributes:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{getCurrencySymbol(currency)}{totalAttributePrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Total:</span>
                    <span>{getCurrencySymbol(currency)}{itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Price Display */}
              <div className="flex flex-col items-end text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                    {getCurrencySymbol(currency)}{finalPrice.toFixed(2)}
                  </div>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-slate-400 dark:text-slate-500 line-through text-sm">
                        {getCurrencySymbol(currency)}{priceWithAttrs.toFixed(2)}
                      </span>
                      <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                        Save {discountPercentage.toFixed(0)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Quantity and Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Qty</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(item.id, quantity - 1);
                  }}
                  disabled={isUpdating || quantity <= 1}
                  className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1 min-w-[2.5rem] text-center text-sm font-medium">
                  {isUpdating ? "..." : quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(item.id, quantity + 1);
                  }}
                  disabled={isUpdating || (item.product.stockQuantity !== null && item.product.stockQuantity !== undefined && quantity >= item.product.stockQuantity) || item.product.inStock === false}
                  className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price and Remove */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                {discountPercentage > 0 && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 line-through mb-0.5">
                    {getCurrencySymbol(currency)}{itemSubtotal.toFixed(2)}
                  </div>
                )}
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {getCurrencySymbol(currency)}{itemTotal.toFixed(2)}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(item.id, close);
                }}
                disabled={isRemoving}
                className="text-sm font-medium text-primary-6000 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const itemCount = items.length;

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`
                ${open ? "" : "text-opacity-90"}
                 group w-10 h-10 sm:w-12 sm:h-12 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative`}
          >
            {itemCount > 0 && (
            <div className="w-3.5 h-3.5 flex items-center justify-center bg-primary-500 absolute top-1.5 right-1.5 rounded-full text-[10px] leading-none text-white font-medium">
                <span className="mt-[1px]">{itemCount > 99 ? '99+' : itemCount}</span>
            </div>
            )}
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H3.74001C4.82001 2 5.67 2.93 5.58 4L4.75 13.96C4.61 15.59 5.89999 16.99 7.53999 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.54 6.88C21.66 5.22 20.4 3.87 18.73 3.87H5.82001"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.25 22C16.9404 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9404 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.25 22C8.94036 22 9.5 21.4404 9.5 20.75C9.5 20.0596 8.94036 19.5 8.25 19.5C7.55964 19.5 7 20.0596 7 20.75C7 21.4404 7.55964 22 8.25 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 8H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <Link className="block md:hidden absolute inset-0" href={"/cart"} />
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
            <Popover.Panel className="hidden md:block absolute z-10 w-screen max-w-xs sm:max-w-md px-4 mt-3.5 -right-28 sm:right-0 sm:px-0">
              <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                <div className="relative bg-white dark:bg-neutral-800">
                  <div className="max-h-[60vh] p-5 overflow-y-auto hiddenScrollbar">
                    <h3 className="text-xl font-semibold">Shopping cart</h3>
                    {loading ? (
                      <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                        Loading cart...
                      </div>
                    ) : items.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700 mt-4">
                        {items.map((item, index) => renderProduct(item, index, close))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400">Your cart is empty</p>
                        <Link
                          href="/collection"
                          onClick={close}
                          className="mt-4 inline-block text-primary-6000 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
                        >
                          Continue shopping
                        </Link>
                      </div>
                    )}
                  </div>
                  {items.length > 0 && (
                  <div className="bg-neutral-50 dark:bg-slate-900 p-5">
                    <p className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                      <span>
                        <span>Subtotal</span>
                        <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">
                          Shipping and taxes calculated at checkout.
                        </span>
                      </span>
                        <span className="">{getCurrencySymbol(currency)}{total.toFixed(2)}</span>
                    </p>
                    <div className="flex space-x-2 mt-5">
                      <ButtonSecondary
                        href="/cart"
                        className="flex-1 border border-slate-200 dark:border-slate-700"
                        onClick={close}
                      >
                        View cart
                      </ButtonSecondary>
                      <ButtonPrimary
                        href="/checkout"
                        onClick={close}
                        className="flex-1"
                      >
                        Check out
                      </ButtonPrimary>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
