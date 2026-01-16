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
    const { product, quantity, finalPrice, selectedAttributes } = item;

    return (
      <div key={item.id} className="relative flex py-7 first:pt-0 last:pb-0">
        <div className="relative h-36 w-24 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {product.image ? (
            <Image
              src={product.image}
              fill
              alt={product.name}
              className="h-full w-full object-contain object-center"
              sizes="150px"
              unoptimized={product.image.includes('localhost') || product.image.includes('127.0.0.1')}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}
          <Link href={`/product-detail/${product.slug}`} className="absolute inset-0"></Link>
        </div>

        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div className="flex-[1.5] ">
                <h3 className="text-base font-semibold">
                  <Link href={`/product-detail/${product.slug}`}>{product.name}</Link>
                </h3>
                
                {/* Attributes - Only show attributes marked for checkout */}
                {selectedAttributes && Object.keys(selectedAttributes).length > 0 && (
                  <div className="mt-1.5 sm:mt-2.5 space-y-1">
                    {Object.entries(selectedAttributes).map(([attrId, values]) => {
                      const attribute = product.attributes?.find(a => a.id === Number(attrId));
                      if (!attribute || !values || values.length === 0) return null;
                      
                      const selectedValue = values[0];
                      const valueDetails = attribute.values?.find(v => 
                        v.id === Number(selectedValue) || v.value === selectedValue
                      );
                      const displayValue = valueDetails?.backend_value || valueDetails?.value || selectedValue;
                      const displayValueStr = String(displayValue);
                      const isColorCode = isValidColorCode(displayValueStr);
                      
                      return (
                        <div key={attrId} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                          {isColorCode ? (
                            <>
                              <div 
                                className="w-3 h-3 rounded-full border border-slate-300 inline-block flex-shrink-0"
                                style={{ backgroundColor: displayValueStr }}
                              />
                              <span className="font-medium">{valueDetails?.value || displayValueStr}</span>
                            </>
                          ) : (
                            <span className="font-medium">{displayValueStr}</span>
                          )}
                          {valueDetails?.price && Number(valueDetails.price) > 0 && (
                            <span className="text-xs text-slate-500 dark:text-slate-500">
                              (+{getCurrencySymbol(currency)}{Number(valueDetails.price).toFixed(2)})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 flex justify-between w-full sm:hidden relative">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Qty: {quantity}
                  </div>
                  <Prices
                    contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                    price={product.price}
                    finalPrice={finalPrice}
                    currency={currency}
                  />
                </div>
              </div>

              <div className="hidden flex-1 sm:flex justify-end">
                <Prices 
                  price={product.price} 
                  finalPrice={finalPrice}
                  currency={currency}
                  className="mt-0.5" 
                />
              </div>
            </div>
          </div>

          <div className="flex mt-auto pt-4 items-end justify-between text-sm">
            <div className="hidden sm:block text-center relative">
              <span className="text-slate-600 dark:text-slate-400">Qty: {quantity}</span>
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
                  
                  // Prepare cart settings array (just the prices)
                  const cartSettingsArray = Object.values(selectedCartSettings);
                  
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
                    
                    // Redirect to order success page
                    setTimeout(() => {
                      router.push("/order-success");
                    }, 2000);
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
