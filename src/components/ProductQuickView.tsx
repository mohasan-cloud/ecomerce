"use client";
import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import LikeButton from "@/components/LikeButton";
import { StarIcon } from "@heroicons/react/24/solid";
import BagIcon from "@/components/BagIcon";
import NcInputNumber from "@/components/NcInputNumber";
import {
  NoSymbolIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import IconDiscount from "@/components/IconDiscount";
import Prices from "@/components/Prices";
import toast from "react-hot-toast";
import NotifyAddTocart from "./NotifyAddTocart";
import AccordionInfo from "@/components/AccordionInfo";
import Image from "next/image";
import Link from "next/link";
import { ApiProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSiteData } from "@/hooks/useSiteData";
import { getCurrencySymbol } from "@/utils/currency";

export interface ProductQuickViewProps {
  className?: string;
  productData?: ApiProduct;
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ 
  className = "",
  productData,
}) => {
  if (!productData) {
    return <div className="p-8">No product data available</div>;
  }

  const {
    name,
    description,
    price,
    finalPrice,
    discountPercentage,
    image,
    galleryImages,
    rating,
    numberOfReviews,
    status,
    inStock,
    stockQuantity,
    slug,
    id,
    category,
    subCategory,
    colors,
    sizes,
    attributes,
  } = productData;

  const LIST_IMAGES = galleryImages.length > 0 
    ? [image, ...galleryImages] 
    : [image];

  const [imageActive, setImageActive] = useState(0);
  const [qualitySelected, setQualitySelected] = useState(1);
  const [colorSelected] = useState(0);
  const [sizeSelected] = useState<string>("");

  // Quantity validation handler
  const handleQuantityChange = (newQuantity: number) => {
    // Validate minimum quantity
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    // If item is already in cart, check total quantity (existing + new)
    if (currentCartItem) {
      const totalQuantity = currentCartItem.quantity + newQuantity;
      if (stockQuantity !== null && stockQuantity !== undefined && totalQuantity > stockQuantity) {
        const availableQuantity = stockQuantity - currentCartItem.quantity;
        if (availableQuantity <= 0) {
          toast.error("Maximum stock limit reached. Cannot add more items.");
          setQualitySelected(1);
          return;
        }
        toast.error(`Only ${availableQuantity} more item${availableQuantity === 1 ? '' : 's'} available. You already have ${currentCartItem.quantity} in cart.`);
        setQualitySelected(availableQuantity);
        return;
      }
    }

    // If item is not in cart, check against stock quantity
    if (stockQuantity !== null && stockQuantity !== undefined && newQuantity > stockQuantity) {
      toast.error(`Only ${stockQuantity} item${stockQuantity === 1 ? '' : 's'} available in stock`);
      setQualitySelected(stockQuantity);
      return;
    }

    // If all validations pass, update quantity
    setQualitySelected(newQuantity);
  };
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, (number | string)[]>>({}); // Store attribute value IDs (or strings for boolean/text)
  
  const { addToCart, removeFromCart, updateQuantity, items: cartItems, processing: cartProcessing } = useCart();
  const { toggleWishlist, isInWishlist, processing: wishlistProcessing } = useWishlist();
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  // Find cart item for current product with matching attributes
  const [currentCartItem, setCurrentCartItem] = useState<typeof cartItems[0] | null>(null);
  const isInCart = !!currentCartItem;

  // Create a stable string representation of selectedAttributes for dependency
  const selectedAttributesKey = JSON.stringify(selectedAttributes, Object.keys(selectedAttributes).sort());

  useEffect(() => {
    // Find cart item that matches both product ID and selected attributes
    const foundItem = cartItems.find(item => {
      if (item.product.id !== id) return false;
      
      // Compare attributes
      const itemAttributes = item.selectedAttributes || {};
      const currentAttributes = selectedAttributes;
      
      // Normalize both for comparison - handle both number[] (IDs) and string[] (legacy) and mixed arrays
      const normalizeAttrs = (attrs: Record<number | string, (number | string)[]>) => {
        const normalized: Record<string, (number | string)[]> = {};
        Object.keys(attrs).forEach(key => {
          const values = attrs[key];
          normalized[String(key)] = Array.isArray(values) ? values : [values];
        });
        return JSON.stringify(normalized, Object.keys(normalized).sort());
      };
      
      return normalizeAttrs(itemAttributes) === normalizeAttrs(currentAttributes);
    });
    
    setCurrentCartItem(foundItem || null);
  }, [id, cartItems, selectedAttributesKey]);

  // Debug: Log attributes
  useEffect(() => {
    if (attributes) {
      console.log('Product Attributes:', attributes);
    }
  }, [attributes]);

  const notifyAddTocart = async () => {
    // Check if product is in stock
    if (!inStock) {
      toast.error("This product is out of stock");
      return;
    }

    // Validate quantity
    if (qualitySelected < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    
    // Validate required attributes
    if (attributes && attributes.length > 0) {
      const missingRequired = attributes.filter(attr => {
        if (!attr.is_required) return false;
        const selectedValues = selectedAttributes[attr.id] || [];
        return selectedValues.length === 0;
      });
      
      if (missingRequired.length > 0) {
        toast.error(`Please select: ${missingRequired.map(a => a.name).join(', ')}`);
        return;
      }
    }
    
    // If already in cart, increase quantity
    if (currentCartItem) {
      const newQuantity = currentCartItem.quantity + qualitySelected;
      
      // Check stock quantity availability
      if (stockQuantity !== null && stockQuantity !== undefined) {
        if (newQuantity > stockQuantity) {
          const availableQuantity = stockQuantity - currentCartItem.quantity;
          if (availableQuantity <= 0) {
            toast.error("Maximum stock limit reached. Cannot add more items.");
            return;
          }
          toast.error(`Only ${availableQuantity} more item${availableQuantity === 1 ? '' : 's'} available. You already have ${currentCartItem.quantity} in cart.`);
          return;
        }
      }
      
      const result = await updateQuantity(currentCartItem.id, newQuantity);
      
      if (result.success) {
        toast.success(`Quantity updated to ${newQuantity}`);
        setQualitySelected(1); // Reset to 1 after successful update
      } else {
        toast.error("Failed to update quantity");
      }
      return;
    }
    
    // Check stock quantity for new item
    if (stockQuantity !== null && stockQuantity !== undefined) {
      if (qualitySelected > stockQuantity) {
        toast.error(`Only ${stockQuantity} item${stockQuantity === 1 ? '' : 's'} available in stock`);
        setQualitySelected(stockQuantity);
        return;
      }
    }
    
    // Debug: Log selected attributes
    console.log('Adding to cart with attributes:', selectedAttributes);
    
    // Add new item to cart with selected attributes
    const result = await addToCart(id, qualitySelected, selectedAttributes);
    if (result.success) {
    toast.custom(
      (t) => (
        <NotifyAddTocart
            productImage={LIST_IMAGES[0]}
            productName={name}
            productPrice={price}
            finalPrice={finalPrice}
            discountPercentage={discountPercentage}
          qualitySelected={qualitySelected}
          show={t.visible}
            sizeSelected={""}
            variantActive={0}
            colors={[]}
            selectedAttributes={selectedAttributes}
            productAttributes={attributes}
        />
      ),
      { position: "top-right", id: "nc-product-notify", duration: 3000 }
    );
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!currentCartItem) return;
    
    const result = await removeFromCart(currentCartItem.id);
    
    if (result.success) {
      toast.success("Removed from cart");
    } else {
      toast.error("Failed to remove from cart");
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = await toggleWishlist(id);
    if (result.success) {
      toast.success(result.message);
    }
  };

  const renderVariants = () => {
    if (!colors || colors.length === 0) {
      return null;
    }

    return (
      <div>
        <label>
          <span className="text-sm font-medium">
            Color:
            <span className="ms-1 font-semibold">
              {colors[colorSelected]?.name}
            </span>
          </span>
        </label>
        <div className="flex mt-3 space-x-2">
          {colors.map((color, index) => (
            <div
              key={color.id}
              onClick={() => {}}
              className={`relative w-11 h-11 rounded-full cursor-pointer border-2 transition-all ${
                colorSelected === index
                  ? "border-primary-6000 dark:border-primary-500 scale-110"
                  : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div
                className="absolute inset-0.5 rounded-full"
                style={{ backgroundColor: color.code }}
                title={color.name}
              ></div>
              {colorSelected === index && (
                <div className="absolute inset-0 rounded-full ring-2 ring-primary-6000 dark:ring-primary-500 ring-offset-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSizeList = () => {
    if (!sizes || sizes.length === 0) {
      return null;
    }

    return (
      <div>
        <div className="flex justify-between font-medium text-sm">
          <label>
            <span>
              Size:
              <span className="ms-1 font-semibold">{sizeSelected || sizes[0]?.name}</span>
            </span>
          </label>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mt-3">
          {sizes.map((size) => {
            const sizeName = size.name || size.id.toString();
            const isActive = sizeSelected === sizeName || (!sizeSelected && sizes[0]?.name === sizeName);
            return (
              <div
                key={size.id}
                className={`relative h-10 sm:h-11 rounded-2xl border flex items-center justify-center text-sm sm:text-base uppercase font-semibold select-none overflow-hidden z-0 cursor-pointer transition-all ${
                  isActive
                    ? "bg-primary-6000 border-primary-6000 text-white hover:bg-primary-700"
                    : "border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
                onClick={() => {}}
              >
                {sizeName}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAttributes = () => {
    if (!attributes || attributes.length === 0) {
      return null;
    }

    // Helper function to check if a string is a valid color code
    const isValidColorCode = (str: string): boolean => {
      if (!str) return false;
      // Check for hex color (#FFFFFF or FFFFFF)
      const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
      // Check for rgb/rgba format
      const rgbPattern = /^rgba?\(/i;
      return hexPattern.test(str) || rgbPattern.test(str);
    };

    const handleAttributeValueToggle = (attributeId: number, valueId: number | string) => {
      setSelectedAttributes(prev => {
        // For select type, single selection only - store ID
        const attribute = attributes.find(a => a.id === attributeId);
        if (attribute?.input_type === 'select') {
          // Single selection - replace current value with ID (if number) or value (if string for boolean/text)
          if (typeof valueId === 'number') {
            return { ...prev, [attributeId]: [valueId] };
          } else {
            // For boolean/text inputs that don't have IDs, store as string
            return { ...prev, [attributeId]: [valueId] };
          }
        } else {
          // For other types (boolean, text), store as string since they don't have IDs
          return { ...prev, [attributeId]: [String(valueId)] };
        }
      });
    };

    // Filter attributes - only show those marked for quick view (backend should already filter, but this is a safety check)
    const filteredAttributes = attributes.filter(attr => attr.show_in_quick_view !== false);
    
    if (filteredAttributes.length === 0) {
      return null;
    }

    return (
      <div className="space-y-5">
        {filteredAttributes.map((attribute) => {
          const selectedValues = selectedAttributes[attribute.id] || [];
          const values = attribute.values || [];

          return (
            <div key={attribute.id}>
              <label className="text-sm font-medium">
                <span>
                  {attribute.name}:
                  {attribute.is_required && <span className="text-red-500 ms-1">*</span>}
                  {selectedValues.length > 0 && (() => {
                    // Find value by ID (selectedValues now contains IDs)
                    const selectedValueId = selectedValues[0];
                    const selectedVal = values.find(v => {
                      // Handle both number ID and string ID
                      if (typeof selectedValueId === 'number') {
                        return v.id === selectedValueId;
                      }
                      const numId = Number(selectedValueId);
                      if (!isNaN(numId)) {
                        return v.id === numId;
                      }
                      // Legacy: if it's a string value name, match by value
                      return v.value === selectedValueId || v.backend_value === selectedValueId;
                    });
                    const displayValue = selectedVal?.backend_value || selectedVal?.value || String(selectedValueId);
                    const displayValueStr = String(displayValue);
                    const isColorCode = isValidColorCode(displayValueStr);
                    const price = selectedVal?.price && Number(selectedVal.price) > 0 ? Number(selectedVal.price) : null;
                    return (
                      <span className="ms-1 font-semibold text-primary-6000 flex items-center gap-2">
                        {isColorCode ? (
                          <>
                            <div 
                              className="w-4 h-4 rounded-full border border-slate-300"
                              style={{ backgroundColor: displayValueStr }}
                            />
                            <span>{selectedVal?.value || displayValue}</span>
                          </>
                        ) : (
                          <span>{displayValue}</span>
                        )}
                        {price !== null && (
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-300">
                            (+{getCurrencySymbol(currency)}{price.toFixed(2)})
                          </span>
                        )}
                      </span>
                    );
                  })()}
                </span>
              </label>
              
              {attribute.input_type === 'select' ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {values.map((val) => {
                    const displayValue = val.backend_value || val.value;
                    const isSelected = selectedValues.includes(val.id); // Compare by ID
                    const isColorCode = isValidColorCode(displayValue);
                    const isColorAttribute = attribute.name.toLowerCase().includes('color') || attribute.input_type === 'color';

                    // Color attribute: Circular swatches
                    if (isColorAttribute || isColorCode) {
                      return (
                        <div
                          key={val.id}
                          onClick={() => handleAttributeValueToggle(attribute.id, val.id)} // Pass ID instead of value
                          className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-black dark:ring-white"
                              : "ring-1 ring-slate-300 dark:ring-slate-600"
                          }`}
                          style={{ backgroundColor: isColorCode ? displayValue : '#e5e7eb' }}
                          title={val.value}
                        >
                          {isColorCode && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full border-2 border-white/80" />
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Other attributes: Rectangular buttons (like Size)
                    return (
                      <div
                        key={val.id}
                        onClick={() => handleAttributeValueToggle(attribute.id, val.id)} // Pass ID instead of value
                        className={`relative h-10 sm:h-11 px-4 rounded-lg border flex items-center justify-center text-sm font-medium select-none cursor-pointer transition-all ${
                          isSelected
                            ? "bg-white dark:bg-neutral-800 border-2 border-black dark:border-white text-slate-900 dark:text-slate-100"
                            : "bg-white dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500"
                        }`}
                      >
                        <span>{displayValue}</span>
                        {val.price && Number(val.price) > 0 && (
                          <span className="absolute -bottom-4 text-[10px] text-slate-600 dark:text-slate-400">
                            +{getCurrencySymbol(currency)}{Number(val.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : attribute.input_type === 'dropdown' ? (
                <div className="mt-3">
                  <select
                    value={selectedValues[0] || ''}
                    onChange={(e) => handleAttributeValueToggle(attribute.id, Number(e.target.value) || e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-6000 focus:border-primary-6000 bg-white dark:bg-neutral-800"
                    required={attribute.is_required}
                  >
                    <option value="">Select {attribute.name}</option>
                    {values.map((val) => {
                      const displayValue = val.backend_value || val.value;
                      return (
                        <option key={val.id} value={val.id}>
                          {displayValue}
                          {val.price && Number(val.price) > 0 && ` (+${getCurrencySymbol(currency)}${Number(val.price).toFixed(2)})`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : attribute.input_type === 'boolean' ? (
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => handleAttributeValueToggle(attribute.id, 'Yes')}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedValues.some(v => String(v) === 'Yes')
                        ? "bg-primary-6000 border-primary-6000 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttributeValueToggle(attribute.id, 'No')}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedValues.some(v => String(v) === 'No')
                        ? "bg-primary-6000 border-primary-6000 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    No
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <input
                    type={attribute.input_type === 'number' ? 'number' : attribute.input_type === 'date' ? 'date' : 'text'}
                    value={selectedValues[0] || ''}
                    onChange={(e) => handleAttributeValueToggle(attribute.id, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-6000 focus:border-primary-6000"
                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                    required={attribute.is_required}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };


  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const CLASSES =
      "absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 nc-shadow-lg rounded-full flex items-center justify-center text-slate-700 text-slate-900 dark:text-slate-300";
    if (status === "New in") {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "50% Discount") {
      return (
        <div className={CLASSES}>
          <IconDiscount className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "Sold Out") {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "limited edition") {
      return (
        <div className={CLASSES}>
          <ClockIcon className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    return null;
  };

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        {/* ---------- 1 HEADING ----------  */}
        <div>
          {(category || subCategory) && (
            <div className="flex items-center gap-2 mb-3">
              {category && (
                <Link 
                  href={`/collection?category=${category.slug}`}
                  className="text-sm px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                >
                  {category.name}
                </Link>
              )}
              {subCategory && (
                <Link 
                  href={`/collection?subcategory=${subCategory.slug}`}
                  className="text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {subCategory.name}
                </Link>
              )}
            </div>
          )}
          <h2 className="text-2xl font-semibold hover:text-primary-6000 transition-colors">
            <Link href={`/product-detail/${slug || id}`}>{name}</Link>
          </h2>

          <div className="flex justify-start rtl:justify-end items-center mt-5 space-x-4 sm:space-x-5 rtl:space-x-reverse">
            <Prices
              contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
              price={price}
              finalPrice={finalPrice}
              discountPercentage={discountPercentage}
              currency={currency}
            />

            <div className="h-6 border-s border-slate-300 dark:border-slate-700"></div>

            <div className="flex items-center">
              <Link
                href={`/product-detail/${slug || id}`}
                className="flex items-center text-sm font-medium"
              >
                <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                <div className="ms-1.5 flex">
                  <span>{rating?.toFixed(1) || "0.0"}</span>
                  <span className="block mx-2">·</span>
                  <span className="text-slate-600 dark:text-slate-400 underline">
                    {numberOfReviews || 0} reviews
                  </span>
                </div>
              </Link>
              {status && (
                <>
              <span className="hidden sm:block mx-2.5">·</span>
              <div className="hidden sm:flex items-center text-sm">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span className="ms-1 leading-none">{status}</span>
              </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---------- 3 ATTRIBUTES ---------- */}
        {renderAttributes()}

        {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
        <div className="flex space-x-3.5 rtl:space-x-reverse">
          <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-3 sm:p-3.5 rounded-full">
            <NcInputNumber
              defaultValue={qualitySelected}
              onChange={handleQuantityChange}
              min={1}
              max={
                currentCartItem && stockQuantity !== null && stockQuantity !== undefined
                  ? stockQuantity - currentCartItem.quantity
                  : stockQuantity !== null && stockQuantity !== undefined
                  ? stockQuantity
                  : 99
              }
            />
          </div>
          {isInCart ? (
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  In cart: {currentCartItem.quantity} {currentCartItem.quantity === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex space-x-2">
                <ButtonPrimary
                  className="flex-1 flex-shrink-0"
                  onClick={notifyAddTocart}
                  disabled={
                    !inStock || 
                    cartProcessing || 
                    qualitySelected < 1 ||
                    (stockQuantity !== null && 
                     stockQuantity !== undefined && 
                     currentCartItem && 
                     (currentCartItem.quantity + qualitySelected) > stockQuantity)
                  }
                >
                  <span className="text-lg">+</span>
                  <span className="ms-2">
                    {cartProcessing ? 'Adding...' : `Add ${qualitySelected} more`}
                  </span>
                </ButtonPrimary>
                <ButtonSecondary
                  className="flex-shrink-0 px-4"
                  onClick={handleRemoveFromCart}
                  disabled={cartProcessing}
                >
                  Remove
                </ButtonSecondary>
              </div>
            </div>
          ) : (
          <ButtonPrimary
            className="flex-1 flex-shrink-0"
            onClick={notifyAddTocart}
            disabled={
              !inStock || 
              cartProcessing || 
              qualitySelected < 1 ||
              (stockQuantity !== null && 
               stockQuantity !== undefined && 
               qualitySelected > stockQuantity)
            }
          >
            <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
              <span className="ms-3">
                {cartProcessing ? 'Adding...' : inStock ? 'Add to cart' : 'Out of Stock'}
              </span>
          </ButtonPrimary>
          )}
        </div>

        {/*  */}
        <hr className=" border-slate-200 dark:border-slate-700"></hr>
        {/*  */}

        {/* ---------- 5 ----------  */}
        <AccordionInfo
          data={[
            {
              name: "Description",
              content: description || "No description available.",
            },
          ]}
        />
      </div>
    );
  };

  return (
    <>
    <div className={`nc-ProductQuickView ${className}`}>
      {/* MAIn */}
      <div className="lg:flex">
        {/* CONTENT */}
        <div className="w-full lg:w-[50%] ">
          {/* HEADING */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-16 relative">
              <Image
                src={LIST_IMAGES[imageActive] || LIST_IMAGES[0]}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full rounded-xl object-cover"
                alt={name}
                unoptimized={
                  typeof LIST_IMAGES[imageActive] === "string" &&
                  LIST_IMAGES[imageActive].startsWith("http")
                }
                onError={(e) => {
                  console.error('Image load error:', LIST_IMAGES[imageActive]);
                }}
              />
            </div>

            {/* STATUS */}
            {renderStatus()}
            {/* META FAVORITES */}
            <LikeButton 
              liked={isInWishlist(id)} 
              className="absolute end-3 top-3"
              onClick={handleToggleWishlist}
              disabled={wishlistProcessing}
            />
          </div>
          {LIST_IMAGES.length > 1 && (
          <div className="hidden lg:grid grid-cols-2 gap-3 mt-3 sm:gap-6 sm:mt-6 xl:gap-5 xl:mt-5">
              {LIST_IMAGES.slice(1, 3).map((item, index) => {
              return (
                  <div 
                    key={index} 
                    className="aspect-w-3 aspect-h-4 relative cursor-pointer"
                    onClick={() => setImageActive(index + 1)}
                  >
                  <Image
                    fill
                    src={item}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full rounded-xl object-cover"
                      alt={`${name} ${index + 2}`}
                      unoptimized={typeof item === "string" && item.startsWith("http")}
                  />
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-[50%] pt-6 lg:pt-0 lg:ps-7 xl:ps-8">
          {renderSectionContent()}
        </div>
      </div>
    </div>

      {/* Size Guide Modal removed because size selection is disabled */}
    </>
  );
};

export default ProductQuickView;
