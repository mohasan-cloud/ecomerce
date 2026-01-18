"use client";

import { NoSymbolIcon, CheckIcon } from "@heroicons/react/24/outline";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSiteData } from "@/hooks/useSiteData";
import { getCurrencySymbol } from "@/utils/currency";

// Helper function to check if a string is a valid color code
const isValidColorCode = (str: string): boolean => {
  if (!str) return false;
  const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
  const rgbPattern = /^rgba?\(/i;
  return hexPattern.test(str) || rgbPattern.test(str);
};

interface CartSetting {
  id: number;
  name: string;
  price: number;
  type: 'yes' | 'no';
  status: 'active' | 'inactive';
}

const CartPage = () => {
  const { items, loading, total, updateQuantity, removeFromCart } = useCart();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [cartSettings, setCartSettings] = useState<CartSetting[]>([]);
  const [selectedCartSettings, setSelectedCartSettings] = useState<Record<number, number>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  // Fetch cart settings
  useEffect(() => {
    const fetchCartSettings = async () => {
      try {
        setLoadingSettings(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/cart-settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCartSettings(data.data || []);
            // Initialize selected settings with default prices for type "no"
            const initialSelected: Record<number, number> = {};
            data.data?.forEach((setting: CartSetting) => {
              if (setting.type === 'no') {
                initialSelected[setting.id] = Number(setting.price) || 0;
              }
            });
            setSelectedCartSettings(initialSelected);
          }
        }
      } catch (error) {
        console.error('Error fetching cart settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchCartSettings();
  }, []);

  // Calculate cart settings total
  const cartSettingsTotal = Object.values(selectedCartSettings).reduce((sum, price) => sum + price, 0);
  
  // Calculate final total including cart settings
  const finalTotal = total + cartSettingsTotal;

  const renderStatusSoldout = () => {
    return (
      <div className="rounded-full flex items-center justify-center px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <NoSymbolIcon className="w-3.5 h-3.5" />
        <span className="ml-1 leading-none">Sold Out</span>
      </div>
    );
  };

  const renderStatusInstock = () => {
    return (
      <div className="rounded-full flex items-center justify-center px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <CheckIcon className="w-3.5 h-3.5" />
        <span className="ml-1 leading-none">In Stock</span>
      </div>
    );
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

  const handleRemove = async (cartId: number) => {
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

  const renderProduct = (item: typeof items[0], index: number) => {
    const { product, quantity, price, priceWithAttributes, finalPrice, discountPercentage, selectedAttributes } = item;
    const isUpdating = updatingId === item.id;
    const isRemoving = removingId === item.id;

    // Debug: Log attributes for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('Cart Item:', {
        productId: product.id,
        productName: product.name,
        selectedAttributes,
        productAttributes: product.attributes,
      });
    }

    // Calculate attribute prices
    let totalAttributePrice = 0;
    if (selectedAttributes && product.attributes) {
      Object.entries(selectedAttributes).forEach(([attrId, values]) => {
        const attribute = product.attributes?.find(a => a.id === Number(attrId));
        if (attribute && values && values.length > 0) {
          const selectedValue = values[0];
          const valueDetails = attribute.values?.find(v => 
            v.id === Number(selectedValue) || v.value === selectedValue
          );
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
    
    const itemTotal = (finalPrice || (discountedProductPrice + totalAttributePrice)) * quantity;
    const itemPriceWithAttrs = (discountedProductPrice + totalAttributePrice); // for display without quantity

    return (
      <div
        key={item.id}
        className="relative flex py-8 sm:py-10 xl:py-12 first:pt-0 last:pb-0"
      >
        {/* Product Thumbnail */}
        <div className="relative h-36 w-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {product.image ? (
          <Image
            fill
              src={product.image}
              alt={product.name}
            sizes="300px"
            className="h-full w-full object-contain object-center"
              unoptimized={product.image.includes('localhost') || product.image.includes('127.0.0.1')}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}
          <Link href={`/product-detail/${product.slug}`} className="absolute inset-0"></Link>
        </div>

        {/* Product Details */}
        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              {/* Left Side - Product Info */}
              <div className="flex-1 pr-4">
                {/* Product Name */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  <Link href={`/product-detail/${product.slug}`} className="hover:text-primary-6000 dark:hover:text-primary-400">
                    {product.name}
                  </Link>
                </h3>
                
                {/* Attributes */}
                <div className="mt-1.5 sm:mt-2.5 space-y-1">
                  {(() => {
                    // Check if we have selectedAttributes and product.attributes
                    if (!selectedAttributes || typeof selectedAttributes !== 'object' || Object.keys(selectedAttributes).length === 0) {
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Cart Page - No selectedAttributes:', { selectedAttributes, item });
                      }
                      // Fallback to old color/size display
                      return (
                        <>
                          {item.color && <div className="text-sm text-slate-600 dark:text-slate-400">color: {item.color.name}</div>}
                          {item.size && <div className="text-sm text-slate-600 dark:text-slate-400">Size: {item.size.name}</div>}
                          {!item.color && !item.size && <div className="text-sm text-slate-400">No variant</div>}
                        </>
                      );
                    }

                    if (!product.attributes || product.attributes.length === 0) {
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Cart Page - No product.attributes:', { productId: product.id, productName: product.name });
                      }
                      return (
                        <>
                          {item.color && <div className="text-sm text-slate-600 dark:text-slate-400">color: {item.color.name}</div>}
                          {item.size && <div className="text-sm text-slate-600 dark:text-slate-400">Size: {item.size.name}</div>}
                          {!item.color && !item.size && <div className="text-sm text-slate-400">No variant</div>}
                        </>
                      );
                    }

                    // Map selected attributes (no extra filter; API already provides relevant ones)
                    const filteredAttributes = Object.entries(selectedAttributes)
                      .map(([attrId, values]) => {
                        const attrIdNum = Number(attrId);
                        const attribute = product.attributes?.find(a => a.id === attrIdNum);
                        
                        // If attribute not found in product.attributes, skip it (backend filtered it out)
                        if (!attribute) {
                          if (process.env.NODE_ENV === 'development') {
                            console.log('Cart Page - Attribute not found:', { attrId, attrIdNum, availableAttributes: product.attributes?.map(a => a.id) });
                          }
                          return null;
                        }
                        
                        if (!values || !Array.isArray(values) || values.length === 0) {
                          if (process.env.NODE_ENV === 'development') {
                            console.log('Cart Page - No values for attribute:', { attrId, values });
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
                          console.log('Cart Page - Value details not found:', { 
                            attrId, 
                            selectedValue, 
                            availableValues: attribute.values?.map(v => ({ id: v.id, value: v.value }))
                          });
                        }
                        
                        const displayValue = valueDetails?.backend_value || valueDetails?.value || selectedValue;
                        const displayValueStr = String(displayValue);
                        const isColorCode = isValidColorCode(displayValueStr);
                        
                        return {
                          attrId,
                          attribute,
                          valueDetails,
                          displayValue: displayValueStr,
                          isColorCode,
                        };
                      })
                      .filter(item => item !== null);

                    if (filteredAttributes.length === 0) {
                      return (
                        <>
                          {item.color && <div className="text-sm text-slate-600 dark:text-slate-400">color: {item.color.name}</div>}
                          {item.size && <div className="text-sm text-slate-600 dark:text-slate-400">Size: {item.size.name}</div>}
                          {!item.color && !item.size && <div className="text-sm text-slate-400">No variant</div>}
                        </>
                      );
                    }

                    return (
                      <>
                        {filteredAttributes.map(({ attrId, attribute, valueDetails, displayValue, isColorCode }) => (
                          <div key={attrId} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{attribute.name}:</span>
                              {isColorCode ? (
                                <>
                                  <div 
                                    className="w-4 h-4 rounded-full border border-slate-300 inline-block flex-shrink-0"
                                    style={{ backgroundColor: displayValue }}
                                  />
                                  <span className="font-medium">{valueDetails?.value || displayValue}</span>
                                </>
                              ) : (
                                <span className="font-medium">{valueDetails?.value || displayValue}</span>
                              )}
                            </div>
                            {valueDetails?.price && Number(valueDetails.price) > 0 && (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                +{getCurrencySymbol(currency)}{Number(valueDetails.price).toFixed(2)}
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
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                    {getCurrencySymbol(currency)}{finalPrice.toFixed(2)}
                  </div>
                      {discountPercentage > 0 && (
                        <>
                          <span className="text-slate-400 dark:text-slate-500 line-through text-sm">
                            {getCurrencySymbol(currency)}{(baseProductPrice + totalAttributePrice).toFixed(2)}
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

            {/* Status and Remove */}
            <div className="flex items-center gap-4">
              {product.inStock !== false ? renderStatusInstock() : renderStatusSoldout()}
              
              <div className="flex items-center gap-4">
                {/* Mobile Price Display */}
                <div className="sm:hidden text-right">
                  {discountPercentage > 0 && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 line-through mb-0.5">
                      {getCurrencySymbol(currency)}{priceWithAttrs.toFixed(2)}
                    </div>
                  )}
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {getCurrencySymbol(currency)}{itemTotal.toFixed(2)}
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={isRemoving}
                  className="text-sm font-medium text-primary-6000 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pb-28 lg:pt-20">
        <div className="mb-12 sm:mb-16">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
            Shopping Cart
          </h2>
          <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
            <Link href={"/"}>Homepage</Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <Link href={"/collection"}>Products</Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <span className="underline">Shopping Cart</span>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 my-10 xl:my-12" />

        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Your cart is empty</p>
            <ButtonPrimary href="/collection">Continue Shopping</ButtonPrimary>
          </div>
        ) : (
        <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-[60%] xl:w-[55%] divide-y divide-slate-200 dark:divide-slate-700">
              {items.map(renderProduct)}
          </div>
          <div className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:mx-16 2xl:mx-20 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="sticky top-28">
                <h3 className="text-lg font-semibold">Order Summary</h3>
              <div className="mt-7 text-sm text-slate-500 dark:text-slate-400 divide-y divide-slate-200/70 dark:divide-slate-700/80">
                <div className="flex justify-between pb-4">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {getCurrencySymbol(currency)}{total.toFixed(2)}
                  </span>
                </div>
                
                {/* Dynamic Cart Settings */}
                {loadingSettings ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading settings...</div>
                ) : (
                  cartSettings.map((setting) => {
                    const price = Number(setting.price) || 0;
                    return (
                      <div key={setting.id} className="py-4">
                        {setting.type === 'yes' ? (
                          // Show radio buttons for type "yes"
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-slate-600 dark:text-slate-400 font-medium">{setting.name}</label>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                                {getCurrencySymbol(currency)}{(selectedCartSettings[setting.id] || 0).toFixed(2)}
                  </span>
                </div>
                            <div className="flex gap-4 mt-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`cart-setting-${setting.id}`}
                                  value={0}
                                  checked={selectedCartSettings[setting.id] === 0 || !selectedCartSettings[setting.id]}
                                  onChange={(e) => {
                                    const selectedPrice = Number(e.target.value);
                                    setSelectedCartSettings(prev => ({
                                      ...prev,
                                      [setting.id]: selectedPrice
                                    }));
                                  }}
                                  className="w-4 h-4 text-primary-6000 focus:ring-primary-6000 border-slate-300 dark:border-slate-600"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">None</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`cart-setting-${setting.id}`}
                                  value={price}
                                  checked={selectedCartSettings[setting.id] === price}
                                  onChange={(e) => {
                                    const selectedPrice = Number(e.target.value);
                                    setSelectedCartSettings(prev => ({
                                      ...prev,
                                      [setting.id]: selectedPrice
                                    }));
                                  }}
                                  className="w-4 h-4 text-primary-6000 focus:ring-primary-6000 border-slate-300 dark:border-slate-600"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {getCurrencySymbol(currency)}{price.toFixed(2)}
                                </span>
                              </label>
                            </div>
                          </div>
                        ) : (
                          // Show static price for type "no"
                          <div className="flex justify-between">
                            <span>{setting.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                              {getCurrencySymbol(currency)}{price.toFixed(2)}
                  </span>
                </div>
                        )}
                      </div>
                    );
                  })
                )}
                
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
                  <span>Order total</span>
                    <span>{getCurrencySymbol(currency)}{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <ButtonPrimary 
                onClick={() => {
                  // Save selected cart settings to localStorage before navigating
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('cart_selected_settings', JSON.stringify(selectedCartSettings));
                  }
                  window.location.href = '/checkout';
                }}
                className="mt-8 w-full"
              >
                Checkout
              </ButtonPrimary>
              <div className="mt-5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <p className="block relative pl-5">
                  <svg
                    className="w-4 h-4 absolute -left-1 top-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8V13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.9945 16H12.0035"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Learn more{` `}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="##"
                    className="text-slate-900 dark:text-slate-200 underline font-medium"
                  >
                    Taxes
                  </a>
                  <span>
                    {` `}and{` `}
                  </span>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="##"
                    className="text-slate-900 dark:text-slate-200 underline font-medium"
                  >
                    Shipping
                  </a>
                    {` `} information
                </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
