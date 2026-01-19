"use client";

import React, { useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
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
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import ReviewItem from "@/components/ReviewItem";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import SectionPromo2 from "@/components/SectionPromo2";
import ModalViewAllReviews from "../ModalViewAllReviews";
import NotifyAddTocart from "@/components/NotifyAddTocart";
import Image from "next/image";
import AccordionInfo from "@/components/AccordionInfo";
import Link from "next/link";
import SizeGuideModal from "@/components/SizeGuideModal";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSiteData } from "@/hooks/useSiteData";
import { getCurrencySymbol } from "@/utils/currency";

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  finalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  mainImage: string;
  galleryImages: string[];
  rating: number;
  numberOfReviews: number;
  status: string | null;
  stockQuantity: number;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  weight: string | null;
  dimensions: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  subCategory: {
    id: number;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: number;
    name: string;
  } | null;
  colors: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  sizes: Array<{
    id: number;
    name: string | null;
  }>;
  attributes?: Array<{
    id: number;
    name: string;
    input_type: string;
    is_required: boolean;
    show_in_quick_view?: boolean;
    values: Array<{
      id: number;
      value: string;
      backend_value?: string | null;
      price?: number | null;
    }>;
  }>;
  hasOffer: boolean;
  offer: {
    id: number;
    name: string;
    discountType: string;
    discountValue: number;
    discountPercentage: number;
    startDate: string;
    endDate: string;
  } | null;
}

interface ProductDetailClientProps {
  slug: string;
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ slug }) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [colorSelected] = useState(0);
  const [sizeSelected] = useState("");
  const [qualitySelected, setQualitySelected] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, (number | string)[]>>({}); // Store attribute value IDs (or strings for boolean/text)
  const [isOpenModalViewAllReviews, setIsOpenModalViewAllReviews] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { addToCart, removeFromCart, updateQuantity, items: cartItems, processing: cartProcessing } = useCart();
  const { toggleWishlist, isInWishlist, processing: wishlistProcessing } = useWishlist();
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/products/${slug}`);
        
        if (!response.ok) {
          console.error(`Failed to fetch product: ${response.status} ${response.statusText}`);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setProduct(data.data);
        } else {
          console.error('Product not found or API error:', data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!slug) return;
      
      try {
        setLoadingReviews(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/products/${slug}/reviews`);
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.data || []);
          setReviewStats(data.stats || { averageRating: 0, totalReviews: 0 });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [slug]);

  // Find cart item for current product with matching attributes
  const [currentCartItem, setCurrentCartItem] = useState<typeof cartItems[0] | null>(null);
  const isInCart = !!currentCartItem;

  // Create a stable string representation of selectedAttributes for dependency
  const selectedAttributesKey = JSON.stringify(selectedAttributes, Object.keys(selectedAttributes).sort());

  useEffect(() => {
    if (!product) {
      setCurrentCartItem(null);
      return;
    }
    
    // Find cart item that matches both product ID and selected attributes
    const foundItem = cartItems.find(item => {
      if (item.product.id !== product.id) return false;
      
      // Compare attributes
      const itemAttributes = item.selectedAttributes || {};
      const currentAttributes = selectedAttributes;
      
      // Normalize both for comparison - handle both number[] (IDs) and string[] (legacy)
      const normalizeAttrs = (attrs: Record<number | string, (string | number)[] | number[] | string[]>) => {
        const normalized: Record<string, (number | string)[]> = {};
        Object.keys(attrs).forEach(key => {
          const values = attrs[key as keyof typeof attrs];
          normalized[String(key)] = Array.isArray(values) ? values : [values];
        });
        return JSON.stringify(normalized, Object.keys(normalized).sort());
      };
      
      return normalizeAttrs(itemAttributes) === normalizeAttrs(currentAttributes);
    });
    
    setCurrentCartItem(foundItem || null);
  }, [product, cartItems, selectedAttributesKey]);

  const notifyAddTocart = async () => {
    if (!product) return;
    
    // Check if product is in stock
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }
    
    // If already in cart, increase quantity
    if (currentCartItem) {
      const newQuantity = currentCartItem.quantity + qualitySelected;
      
      // Check stock quantity availability
      if (product.stockQuantity !== null && product.stockQuantity !== undefined && newQuantity > product.stockQuantity) {
        toast.error(`Only ${product.stockQuantity} items available in stock`);
        return;
      }
      
      const result = await updateQuantity(currentCartItem.id, newQuantity);
      
      if (result.success) {
        toast.success(`Quantity updated to ${newQuantity}`);
      } else {
        toast.error("Failed to update quantity");
      }
      return;
    }
    
    // Check stock quantity for new item
    if (product.stockQuantity !== null && product.stockQuantity !== undefined && qualitySelected > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }
    
    // Add new item to cart with selected attributes
    const result = await addToCart(product.id, qualitySelected, selectedAttributes);
    
    if (result.success) {
      toast.custom(
        (t) => (
          <NotifyAddTocart
            productImage={product.mainImage}
            productName={product.name}
            productPrice={product.price}
            finalPrice={product.finalPrice}
            discountPercentage={product.discountPercentage}
            qualitySelected={qualitySelected}
            show={t.visible}
            sizeSelected={""}
            variantActive={0}
            colors={[]}
            selectedAttributes={selectedAttributes}
            productAttributes={product.attributes}
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

  const renderAttributes = () => {
    if (!product?.attributes || product.attributes.length === 0) {
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
        const attribute = product.attributes?.find(a => a.id === attributeId);
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
    const filteredAttributes = product.attributes.filter(attr => {
      // If show_in_quick_view is explicitly false, exclude it
      // If undefined/null, include it (for backward compatibility)
      return attr.show_in_quick_view !== false;
    });
    
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

  const handleToggleWishlist = async () => {
    if (!product) return;
    const result = await toggleWishlist(product.id);
    if (result.success) {
      toast.success(result.message);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewName || !reviewEmail || !reviewRating || !reviewComment) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setSubmittingReview(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/products/${slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reviewName,
          email: reviewEmail,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setReviewName("");
        setReviewEmail("");
        setReviewRating(0);
        setReviewComment("");
        // Refresh reviews
        const reviewsResponse = await fetch(`${apiUrl}/api/products/${slug}/reviews`);
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.success) {
          setReviews(reviewsData.data || []);
          setReviewStats(reviewsData.stats || { averageRating: 0, totalReviews: 0 });
        }
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("An error occurred while submitting your review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-11 mb-24">
        <div className="animate-pulse">
          <div className="lg:flex gap-8">
            <div className="lg:w-[55%] space-y-4">
              <div className="aspect-w-16 aspect-h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-w-11 aspect-h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="aspect-w-11 aspect-h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
            </div>
            <div className="lg:w-[45%] space-y-4 mt-8 lg:mt-0">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-11 mb-24 text-center">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          The product you're looking for doesn't exist.
        </p>
        <Link href="/collection">
          <ButtonPrimary className="mt-6">Browse Products</ButtonPrimary>
        </Link>
      </div>
    );
  }

const decodeUrl = (url: string) => {
  try {
    let decoded = url;
    let prev = "";

    // keep decoding until it stops changing
    while (decoded !== prev) {
      prev = decoded;
      decoded = decodeURIComponent(decoded);
    }

    return decoded;
  } catch {
    return url;
  }
};


  const renderColors = () => {
    if (!product.colors || product.colors.length === 0) {
      return null;
    }

    return (
      <div>
        <label>
          <span className="text-sm font-medium">
            Color:
            <span className="ml-1 font-semibold">
              {product.colors[colorSelected]?.name}
            </span>
          </span>
        </label>
        <div className="flex mt-3 space-x-2">
          {product.colors.map((color, index) => (
            <div
              key={color.id}
              onClick={() => {}}
              className={`relative w-11 h-11 rounded-full cursor-pointer border-2 ${
                colorSelected === index
                  ? "border-primary-6000 dark:border-primary-500"
                  : "border-transparent"
              }`}
            >
              <div
                className="absolute inset-0.5 rounded-full"
                style={{ backgroundColor: color.code }}
                title={color.name}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSizes = () => {
    if (!product.sizes || product.sizes.length === 0) {
      return null;
    }

    return (
      <div>
        <div className="flex justify-between font-medium text-sm">
          <label>
            <span>
              Size:
              <span className="ms-1 font-semibold">{sizeSelected || product.sizes[0]?.name}</span>
            </span>
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowSizeGuide(true);
            }}
            className="text-primary-6000 hover:text-primary-500 underline"
          >
            Size guide
          </button>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mt-3">
          {product.sizes.map((size) => {
            const sizeName = size.name || size.id.toString();
            const isActive = sizeSelected === sizeName;
            return (
              <div
                key={size.id}
                className={`relative h-10 sm:h-11 rounded-2xl border flex items-center justify-center text-sm sm:text-base uppercase font-semibold select-none overflow-hidden z-0 cursor-pointer ${
                  isActive
                    ? "bg-primary-6000 border-primary-6000 text-white hover:bg-primary-6000"
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


  const renderStatus = () => {
    if (!product.status) {
      return null;
    }
    
    const CLASSES =
      "absolute top-3 left-3 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 nc-shadow-lg rounded-full flex items-center justify-center text-slate-700 text-slate-900 dark:text-slate-300";
    
    if (product.status.includes("Discount")) {
      return (
        <div className={CLASSES}>
          <IconDiscount className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{product.status}</span>
        </div>
      );
    }
    if (product.status === "New in") {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">New in</span>
        </div>
      );
    }
    if (product.status === "Sold Out") {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">Sold Out</span>
        </div>
      );
    }
    return null;
  };

  const renderSectionContent = () => {
    return (
      <div className="space-y-7 2xl:space-y-8">
        {/* HEADING */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            {product.name}
          </h2>

          <div className="flex items-center mt-5 space-x-4 sm:space-x-5">
            {/* PRICE */}
            <Prices 
              price={product.price}
              finalPrice={product.finalPrice}
              discountPercentage={product.discountPercentage}
              className="!text-base"
              contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
              currency={currency}
            />

            <div className="h-7 border-l border-slate-300 dark:border-slate-700"></div>

            {/* RATING */}
            <div className="flex items-center">
              <Link
                href="#reviews"
                className="flex items-center text-sm font-medium"
              >
                <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                <div className="ms-1.5 flex">
                  <span>{product.rating}</span>
                  <span className="block mx-2">·</span>
                  <span className="text-slate-600 dark:text-slate-400 underline">
                    {product.numberOfReviews} reviews
                  </span>
                </div>
              </Link>
              <span className="hidden sm:block mx-2.5">·</span>
              <div className="hidden sm:flex items-center text-sm">
                {product.inStock ? (
                  <>
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span className="ms-1 leading-none">In Stock</span>
                  </>
                ) : (
                  <>
                    <NoSymbolIcon className="w-3.5 h-3.5" />
                    <span className="ms-1 leading-none">Sold Out</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SHORT DESCRIPTION */}
        {product.shortDescription && (
          <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {product.shortDescription}
          </div>
        )}

        {/*  */}
        <div className="space-y-6">
          {renderAttributes()}
        </div>

        {/*  */}
        <div className="flex space-x-3.5">
          <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-3 sm:p-3.5 rounded-full">
            <NcInputNumber
              defaultValue={qualitySelected}
              onChange={setQualitySelected}
              max={product.stockQuantity}
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
                  disabled={!product.inStock || cartProcessing}
                >
                  <span className="text-lg">+</span>
                  <span className="ms-2">
                    {cartProcessing ? "Adding..." : `Add ${qualitySelected} more`}
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
              disabled={!product.inStock || cartProcessing}
            >
              <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
              <span className="ms-3">
                {cartProcessing ? "Adding..." : product.inStock ? "Add to cart" : "Sold Out"}
              </span>
            </ButtonPrimary>
          )}
        </div>

        {/* META */}
        <div className="hidden xl:block pt-6">
          <div className="text-sm space-y-3">
            {product.sku && (
              <div className="flex items-center">
                <span className="text-slate-500 dark:text-slate-400 w-20">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
            )}
            {product.category && (
              <div className="flex items-center">
                <span className="text-slate-500 dark:text-slate-400 w-20">Category:</span>
                <Link href={`/collection?category=${product.category.slug}`} className="font-medium hover:text-primary-6000">
                  {product.category.name}
                </Link>
              </div>
            )}
            {product.brand && (
              <div className="flex items-center">
                <span className="text-slate-500 dark:text-slate-400 w-20">Brand:</span>
                <span className="font-medium">{product.brand.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`nc-ProductDetailPage`}>
      {/* MAIn */}
      <main className="container mt-5 lg:mt-11">
        <div className="lg:flex">
          {/* IMAGES */}
          <div className="w-full lg:w-[55%]">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-16 relative">
                <Image
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  src={allImages[activeImage]}
                  className="w-full rounded-2xl object-cover"
                  alt={product.name}
                  unoptimized={allImages[activeImage].includes('localhost')}
                />
              </div>
              {renderStatus()}
              <LikeButton 
                liked={product ? isInWishlist(product.id) : false}
                className="absolute right-3 top-3"
                onClick={handleToggleWishlist}
                disabled={wishlistProcessing}
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-2 gap-3 mt-3 sm:gap-6 sm:mt-6 xl:gap-8 xl:mt-8">
                {allImages.slice(1, 3).map((img, index) => (
                  <div
                    key={index + 1}
                    className="aspect-w-11 xl:aspect-w-10 2xl:aspect-w-11 aspect-h-16 relative cursor-pointer"
                    onClick={() => setActiveImage(index + 1)}
                  >
                    <Image
                      sizes="(max-width: 1024px) 50vw, 27.5vw"
                      fill
                      src={img}
                      className="w-full rounded-2xl object-cover"
                      alt={`${product.name} ${index + 2}`}
                      unoptimized={img.includes('localhost')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-[45%] pt-10 lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
            {renderSectionContent()}
          </div>
        </div>

        {/* DETAILS */}
        <div className="mt-12 sm:mt-16 space-y-10 sm:space-y-16">
          {/* DESCRIPTION */}
          <div>
            <h2 className="text-2xl font-semibold">Product Details</h2>
            <div className="prose prose-sm sm:prose dark:prose-invert sm:max-w-4xl mt-7">
              <p>{product.description}</p>
              
              {(product.weight || product.dimensions) && (
                <div className="mt-6">
                  <h3>Specifications</h3>
                  <ul>
                    {product.weight && <li>Weight: {product.weight}</li>}
                    {product.dimensions && <li>Dimensions: {product.dimensions}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* REVIEWS SECTION */}
          <div id="reviews">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-semibold flex items-center">
                <span>Customer Reviews</span>
                {reviewStats.totalReviews > 0 && (
                  <span className="ml-2 text-lg text-slate-500 dark:text-slate-400">
                    ({reviewStats.totalReviews})
                  </span>
                )}
              </h2>
              
              {reviewStats.totalReviews > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <StarIcon className="w-6 h-6 text-yellow-500" />
                    <span className="ml-2 text-xl font-semibold">
                      {Number(reviewStats.averageRating).toFixed(1)}
                    </span>
                    <span className="ml-1 text-slate-500 dark:text-slate-400">
                      out of 5
                    </span>
                  </div>
                  <ButtonSecondary
                    onClick={() => setIsOpenModalViewAllReviews(true)}
                    sizeClass="py-2 px-4"
                  >
                    View all reviews
                  </ButtonSecondary>
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reviewName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="reviewName"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="reviewEmail" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="reviewEmail"
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Your Rating *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          star <= reviewRating
                            ? "text-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        onClick={() => setReviewRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewComment" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    id="reviewComment"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="block w-full text-sm rounded-2xl border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900"
                    placeholder="Share your thoughts about this product..."
                    required
                  ></textarea>
                </div>

                <ButtonPrimary
                  type="submit"
                  disabled={submittingReview}
                  className="!px-8"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </ButtonPrimary>
              </form>
            </div>

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="mt-10 space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex space-x-4">
                      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold mb-6">What Customers Say</h3>
                <div className="space-y-8">
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewItem key={review.id} data={review} />
                  ))}
                </div>
                {reviews.length > 3 && (
                  <div className="mt-8 text-center">
                    <ButtonSecondary
                      onClick={() => setIsOpenModalViewAllReviews(true)}
                    >
                      View all {reviews.length} reviews
                    </ButtonSecondary>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-700 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            )}
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* RELATED PRODUCTS */}
          <SectionSliderProductCard
            heading="Customers also purchased"
            subHeading=""
            headingFontClassName="text-2xl font-semibold"
            headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
          />
        </div>
      </main>

      <ModalViewAllReviews
        show={isOpenModalViewAllReviews}
        onCloseModalViewAllReviews={() => setIsOpenModalViewAllReviews(false)}
        productSlug={slug}
        reviews={reviews}
        reviewStats={reviewStats}
      />

      <SizeGuideModal
        show={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        productName={product?.name || ""}
        sizes={product?.sizes}
      />
    </div>
  );
};

export default ProductDetailClient;

