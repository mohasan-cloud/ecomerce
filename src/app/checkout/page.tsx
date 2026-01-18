"use client";

import Label from "@/components/Label/Label";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import { useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import ContactInfo from "./ContactInfo";
import PaymentMethod from "./PaymentMethod";
import ShippingAddress from "./ShippingAddress";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useSiteData } from "@/hooks/useSiteData";
import { getCurrencySymbol } from "@/utils/currency";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

const CheckoutPage = () => {
  const router = useRouter();
  const [tabActive, setTabActive] = useState<
    "ContactInfo" | "ShippingAddress" | "PaymentMethod"
  >("ShippingAddress");
  const { items, loading, total } = useCart();
  const [cartSettings, setCartSettings] = useState<CartSetting[]>([]);
  const [selectedCartSettings, setSelectedCartSettings] = useState<Record<number, number>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;
  
  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [paymentFormData, setPaymentFormData] = useState<{
    cardNumber?: string;
    cardName?: string;
    cardExpiry?: string;
    cardCVC?: string;
    phoneNumber?: string;
  }>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

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
            
            // Try to load selected settings from localStorage (from cart page)
            let savedSettings: Record<number, number> | null = null;
            if (typeof window !== 'undefined') {
              const saved = localStorage.getItem('cart_selected_settings');
              if (saved) {
                try {
                  savedSettings = JSON.parse(saved);
                } catch (e) {
                  console.warn('Failed to parse saved cart settings:', e);
                }
              }
            }
            
            // Initialize selected settings
            const initialSelected: Record<number, number> = {};
            data.data?.forEach((setting: CartSetting) => {
              if (setting.type === 'no') {
                // Type "no" always has default price
                initialSelected[setting.id] = Number(setting.price) || 0;
              } else if (savedSettings && savedSettings[setting.id] !== undefined) {
                // Type "yes" - use saved selection from cart page
                initialSelected[setting.id] = savedSettings[setting.id];
              } else {
                // Type "yes" - default to 0 (None)
                initialSelected[setting.id] = 0;
              }
            });
            setSelectedCartSettings(initialSelected);
            
            // Clear saved settings after loading
            if (typeof window !== 'undefined' && savedSettings) {
              localStorage.removeItem('cart_selected_settings');
            }
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
  const cartSettingsTotal = Object.values(selectedCartSettings).reduce(
    (sum, price) => sum + price,
    0
  );

  // Amount before applying any coupon
  const amountBeforeCoupon = total + cartSettingsTotal;

  // Coupon discount (from validated coupon)
  const couponDiscount = appliedCoupon?.discount || 0;

  // Final total including cart settings and coupon discount
  const finalTotal = Math.max(0, amountBeforeCoupon - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/coupons/validate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code: couponCode,
          amount: amountBeforeCoupon,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message =
          data?.message || "Failed to apply coupon. Please try again.";
        setAppliedCoupon(null);
        setCouponError(message);
        toast.error(message);
        return;
      }

      setAppliedCoupon({
        code: data.data.coupon.code,
        discount: Number(data.data.discount) || 0,
      });
      setCouponError(null);
      toast.success("Coupon applied successfully");
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      setAppliedCoupon(null);
      setCouponError(
        error?.message || "Failed to apply coupon. Please try again."
      );
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const renderProduct = (item: typeof items[0], index: number) => {
    const { product, quantity, price, priceWithAttributes, finalPrice, discountPercentage, selectedAttributes } = item;

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
      <div key={item.id} className="relative flex py-8 sm:py-10 first:pt-0 last:pb-0 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
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
                {selectedAttributes && Object.keys(selectedAttributes).length > 0 && product.attributes && (
                  <div className="mt-1.5 sm:mt-2.5 space-y-1">
                    {Object.entries(selectedAttributes).map(([attrId, values]) => {
                      const attribute = product.attributes?.find(a => a.id === Number(attrId));
                      if (!attribute || !values || values.length === 0) return null;
                      
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
                      
                      const displayValue = valueDetails?.backend_value || valueDetails?.value || selectedValue;
                      const displayValueStr = String(displayValue);
                      const isColorCode = isValidColorCode(displayValueStr);
                      
                      return (
                        <div key={attrId} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{attribute.name}:</span>
                            {isColorCode ? (
                              <>
                                <div 
                                  className="w-4 h-4 rounded-full border border-slate-300 inline-block flex-shrink-0"
                                  style={{ backgroundColor: displayValueStr }}
                                />
                                <span className="font-medium">{valueDetails?.value || displayValueStr}</span>
                              </>
                            ) : (
                              <span className="font-medium">{valueDetails?.value || displayValueStr}</span>
                            )}
                          </div>
                          {valueDetails?.price && Number(valueDetails.price) > 0 && (
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              +{getCurrencySymbol(currency)}{Number(valueDetails.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

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
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Qty: {quantity}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Price Display */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 sm:hidden">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Qty: {quantity}
            </div>
            <div className="text-right">
              {discountPercentage > 0 && (
                <div className="text-xs text-slate-400 dark:text-slate-500 line-through mb-0.5">
                  {getCurrencySymbol(currency)}{priceWithAttrs.toFixed(2)}
                </div>
              )}
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {getCurrencySymbol(currency)}{itemTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeft = () => {
    return (
      <div className="space-y-8">
        <div id="ContactInfo" className="scroll-mt-24">
          <ContactInfo
            isActive={tabActive === "ContactInfo"}
            onOpenActive={() => {
              setTabActive("ContactInfo");
              handleScrollToEl("ContactInfo");
            }}
            onCloseActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
          />
        </div>

        <div id="ShippingAddress" className="scroll-mt-24">
          <ShippingAddress
            isActive={tabActive === "ShippingAddress"}
            onOpenActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
            onCloseActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
          />
        </div>

        <div id="PaymentMethod" className="scroll-mt-24">
          <PaymentMethod
            isActive={tabActive === "PaymentMethod"}
            onOpenActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
            onCloseActive={() => setTabActive("PaymentMethod")}
            selectedCartSettings={selectedCartSettings}
            onPaymentMethodChange={(method, formData) => {
              setSelectedPaymentMethod(method);
              setPaymentFormData(formData);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CheckoutPage">
      <main className="container py-16 lg:pb-28 lg:pt-20 ">
        <div className="mb-16">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
            Checkout
          </h2>
          <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
            <Link href={"/"}>Homepage</Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <Link href={"/collection"}>Products</Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <Link href={"/cart"}>Cart</Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <span className="underline">Checkout</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1">{renderLeft()}</div>

          <div className="flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:lg:mx-14 2xl:mx-16 "></div>

          <div className="w-full lg:w-[36%] ">
            <h3 className="text-lg font-semibold">Order summary</h3>
            <div className="mt-8 divide-y divide-slate-200/70 dark:divide-slate-700 ">
              {items.length > 0 ? (
                items.map((item, index) => renderProduct(item, index))
              ) : (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No items in cart
                </div>
              )}
            </div>

            <div className="mt-10 pt-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-700 ">
              <div>
                <Label className="text-sm">Coupon code</Label>
                <div className="flex mt-1.5">
                  <Input
                    sizeClass="h-10 px-4 py-3"
                    className="flex-1"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                  />
                  <button
                    className="text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 rounded-2xl px-4 ml-3 font-medium text-sm bg-neutral-200/70 dark:bg-neutral-700 dark:hover:bg-neutral-800 w-24 flex justify-center items-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode}
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1 text-xs text-red-500">{couponError}</p>
                )}
                {appliedCoupon && !couponError && (
                  <p className="mt-1 text-xs text-green-600">
                    Applied coupon <span className="font-semibold">{appliedCoupon.code}</span>
                  </p>
                )}
              </div>

              <div className="mt-4 divide-y divide-slate-200/70 dark:divide-slate-700/80">
                <div className="flex justify-between py-2.5">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {getCurrencySymbol(currency)}
                    {total.toFixed(2)}
                  </span>
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between py-2.5 text-green-600 dark:text-green-400">
                    <span>
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span className="font-semibold">
                      -{getCurrencySymbol(currency)}
                      {couponDiscount.toFixed(2)}
                </span>
              </div>
                )}
                
                {/* Dynamic Cart Settings */}
                {loadingSettings ? (
                  <div className="py-2.5 text-center text-xs text-slate-400">Loading settings...</div>
                ) : (
                  cartSettings.map((setting) => {
                    const price = Number(setting.price) || 0;
                    return (
                      <div key={setting.id} className="py-2.5">
                        {setting.type === 'yes' ? (
                          // Show radio buttons for type "yes"
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-slate-600 dark:text-slate-400 font-medium">{setting.name}</label>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                {getCurrencySymbol(currency)}{(selectedCartSettings[setting.id] || 0).toFixed(2)}
                </span>
              </div>
                            <div className="flex gap-4 mt-1">
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
                                <span className="text-xs text-slate-700 dark:text-slate-300">None</span>
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
                                <span className="text-xs text-slate-700 dark:text-slate-300">
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
              </div>
              
              <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4 border-t border-slate-200/70 dark:border-slate-700/80">
                <span>Order total</span>
                <span>
                  {getCurrencySymbol(currency)}
                  {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
            <ButtonPrimary 
              className="mt-8 w-full"
              onClick={async () => {
                // Validate cart
                if (items.length === 0) {
                  toast.error("Your cart is empty");
                  return;
                }

                // Validate payment method
                if (!selectedPaymentMethod) {
                  toast.error("Please select a payment method");
                  handleScrollToEl("PaymentMethod");
                  return;
                }

                // Validate payment form fields based on method
                if (selectedPaymentMethod.name === 'stripe') {
                  if (!paymentFormData.cardNumber || !paymentFormData.cardName || !paymentFormData.cardExpiry || !paymentFormData.cardCVC) {
                    toast.error("Please fill in all card details");
                    handleScrollToEl("PaymentMethod");
                    return;
                  }
                } else if (selectedPaymentMethod.name === 'easypaisa' || selectedPaymentMethod.name === 'jazzcash') {
                  if (!paymentFormData.phoneNumber) {
                    toast.error("Please enter your phone number");
                    handleScrollToEl("PaymentMethod");
                    return;
                  }
                }

                try {
                  toast.loading("Processing your order...", { id: "order-processing" });
                  
                  // Get contact info from localStorage or fetch from API
                  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                  
                  let contactName = '';
                  let contactEmail = '';
                  let contactPhone = '';
                  
                  if (userStr) {
                    try {
                      const user = JSON.parse(userStr);
                      contactName = user.name || '';
                      contactEmail = user.email || '';
                      contactPhone = user.phone || '';
                    } catch (e) {
                      console.error('Error parsing user data:', e);
                    }
                  }
                  
                  // Fetch contact info from API if logged in
                  if (token) {
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                      const response = await fetch(`${apiUrl}/api/auth/me`, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Accept': 'application/json',
                        },
                      });
                      if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.data?.user) {
                          contactName = data.data.user.name || contactName;
                          contactEmail = data.data.user.email || contactEmail;
                          contactPhone = data.data.user.phone || contactPhone;
                        }
                      }
                    } catch (e) {
                      console.error('Error fetching user data:', e);
                    }
                  }
                  
                  // Get selected shipping address
                  const getSessionId = () => {
                    if (typeof window === 'undefined') return null;
                    let sid = localStorage.getItem('session_id');
                    if (!sid) {
                      sid = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
                      localStorage.setItem('session_id', sid);
                    }
                    return sid;
                  };
                  
                  const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  };
                  
                  if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                  }
                  const sid = getSessionId();
                  if (sid) {
                    headers['X-Session-ID'] = sid;
                  }
                  
                  // Fetch shipping addresses to get the selected one
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                  const addressesResponse = await fetch(`${apiUrl}/api/shipping-addresses`, {
                    headers: {
                      'Accept': 'application/json',
                      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                      ...(sid ? { 'X-Session-ID': sid } : {}),
                    },
                  });
                  
                  let shippingAddressId = null;
                  if (addressesResponse.ok) {
                    const addressesData = await addressesResponse.json();
                    if (addressesData.success && addressesData.data && addressesData.data.length > 0) {
                      // Get default address or first address
                      const defaultAddress = addressesData.data.find((addr: any) => addr.is_default);
                      shippingAddressId = defaultAddress ? defaultAddress.id : addressesData.data[0].id;
                    }
                  }
                  
                  if (!shippingAddressId) {
                    toast.error("Please select a shipping address", { id: "order-processing" });
                    handleScrollToEl("ShippingAddress");
                    return;
                  }
                  
                  if (!contactName || !contactEmail || !contactPhone) {
                    toast.error("Please fill in contact information", { id: "order-processing" });
                    handleScrollToEl("ContactInfo");
                    return;
                  }
                  
                  // Prepare payment details
                  const paymentDetails: any = {};
                  if (selectedPaymentMethod.name === 'stripe') {
                    paymentDetails.card_number = paymentFormData.cardNumber?.replace(/\s/g, '');
                    paymentDetails.card_name = paymentFormData.cardName;
                    paymentDetails.card_expiry = paymentFormData.cardExpiry;
                    paymentDetails.card_cvc = paymentFormData.cardCVC;
                  } else if (selectedPaymentMethod.name === 'easypaisa' || selectedPaymentMethod.name === 'jazzcash') {
                    paymentDetails.phone_number = paymentFormData.phoneNumber;
                  }
                  
                  // Prepare cart settings array with id, name, and price
                  const cartSettingsArray = Object.entries(selectedCartSettings)
                    .filter(([settingId, price]) => price > 0)
                    .map(([settingId, price]) => {
                      const setting = cartSettings.find(s => s.id === Number(settingId));
                      return {
                        id: Number(settingId),
                        name: setting?.name || `Setting ${settingId}`,
                        price: Number(price),
                      };
                    });
                  
                  // Create order
                  const orderResponse = await fetch(`${apiUrl}/api/orders`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                      contact_name: contactName,
                      contact_email: contactEmail,
                      contact_phone: contactPhone,
                      shipping_address_id: shippingAddressId,
                      payment_method_id: selectedPaymentMethod.id,
                      payment_method_name: selectedPaymentMethod.name,
                      payment_details: paymentDetails,
                      cart_settings: cartSettingsArray,
                      coupon_code: appliedCoupon?.code || null,
                    }),
                  });
                  
                  const orderData = await orderResponse.json();
                  
                  if (orderData.success) {
                    toast.success("Order confirmed successfully! Your order has been placed.", { id: "order-processing", duration: 5000 });
                    
                    // Save order ID to localStorage and pass to success page
                    if (orderData.data?.order?.id) {
                      localStorage.setItem('last_order_id', orderData.data.order.id.toString());
                      setTimeout(() => {
                        router.push(`/order-success?order_id=${orderData.data.order.id}`);
                      }, 2000);
                    } else {
                      setTimeout(() => {
                        router.push("/order-success");
                      }, 2000);
                    }
                  } else {
                    toast.error(orderData.message || "Failed to process order. Please try again.", { id: "order-processing" });
                  }
                } catch (error: any) {
                  console.error('Order creation error:', error);
                  toast.error(error.message || "Failed to process order. Please try again.", { id: "order-processing" });
                }
              }}
            >
              Confirm order
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
                {` `} infomation
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
